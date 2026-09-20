"""Derive an attributed, offline SVG basemap and walking graph from OSM XML.
Run manually after downloading the documented OSM bbox; normal builds are offline.
Coordinates stay north-up in a local equirectangular projection (metre aspect ratio).
"""
import json, math, heapq, sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
root = ET.parse('.preview/kadhimiya-full.osm').getroot()
nodes = {n.attrib['id']: (float(n.attrib['lat']), float(n.attrib['lon'])) for n in root.findall('node')}
def project(p):
    lat, lon = p
    return [round((lon-44.3348)*41750, 2), round((33.3787-lat)*50000, 2)]
def distance(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])
def near_view(points):
    return max(p[0] for p in points)>-30 and min(p[0] for p in points)<1000 and max(p[1] for p in points)>-30 and min(p[1] for p in points)<810
roads, parks, buildings, water, named = [], [], [], [], []
graph, xy, edges = {}, {id:project(p) for id,p in nodes.items()}, []
def edge(a,b):
    weight=distance(xy[a],xy[b])
    graph.setdefault(a,[]).append((b,weight));graph.setdefault(b,[]).append((a,weight))
walkable={'tertiary','tertiary_link','secondary','secondary_link','residential','unclassified','service','footway','pedestrian','path','steps','living_street','primary','primary_link'}
for way in root.findall('way'):
    tags={t.attrib['k']:t.attrib['v'] for t in way.findall('tag')}
    refs=[n.attrib['ref'] for n in way.findall('nd') if n.attrib['ref'] in nodes]
    points=[xy[id] for id in refs]
    if len(points)<2: continue
    road=tags.get('highway')
    if road:
        # Preserve every intersecting segment, including ways crossing the bbox.
        segments=[]; segment=[]
        for a,b in zip(points,points[1:]):
            if near_view([a,b]):
                if not segment:segment=[a]
                segment.append(b)
            elif segment:segments.append(segment);segment=[]
        if segment:segments.append(segment)
        for part in segments:roads.append({'id':way.attrib['id'],'points':part,'kind':road})
        if tags.get('name') and segments:named.append({'id':way.attrib['id'],'name':tags['name'],'points':segments[0]})
        if road in walkable and tags.get('foot')!='no' and (tags.get('access') not in {'private','no'} or tags.get('foot') in {'yes','permissive'}):
            for a,b in zip(refs,refs[1:]):
                edge(a,b);edges.append((a,b))
    if tags.get('leisure')=='park' and near_view(points):parks.append({'id':way.attrib['id'],'points':points,'name':tags.get('name','')})
    if 'building' in tags and near_view(points):buildings.append(points)
    if way.attrib['id']=='8134037':water.append(points)

# Location coordinates verified against the owner's three shared Google places.
# Boys use the adjacent clinic as the reference point, not a made-up entrance pin.
places={
 'institute':[33.3724375,44.3398125], 'girls':[33.3656493,44.3426101],
 'boys':[33.376117,44.3484757], 'zahra':[33.3733571,44.3390975],
 'square':[33.365855,44.34551], 'park':[33.3755296,44.350494],
 'akad':[33.3738395,44.3478146],
 'bridge':[33.3769546,44.3522917], 'mashat':[33.366001,44.3389538],
 'hospital':[33.3671084,44.3441647],
}
snaps={}
for name,latlon in places.items():
    p=project(latlon); best=None
    for a,b in edges:
        aa,bb=xy[a],xy[b];vx,vy=bb[0]-aa[0],bb[1]-aa[1]
        t=max(0,min(1,((p[0]-aa[0])*vx+(p[1]-aa[1])*vy)/(vx*vx+vy*vy or 1)))
        q=[round(aa[0]+vx*t,2),round(aa[1]+vy*t,2)];d=distance(p,q)
        if best is None or d<best[0]:best=(d,a,b,q)
    _,a,b,q=best;xy[name]=q;edge(name,a);edge(name,b);snaps[name]={'point':p,'street':q,'edge':[a,b],'offsetMeters':round(best[0]*2.226)}

def route(start,end):
    costs={start:0};previous={};queue=[(0,start)]
    while queue:
        cost,node=heapq.heappop(queue)
        if node==end:break
        if cost!=costs.get(node):continue
        for nxt,w in graph[node]:
            if cost+w<costs.get(nxt,float('inf')):
                costs[nxt]=cost+w;previous[nxt]=node;heapq.heappush(queue,(cost+w,nxt))
    if end not in costs:raise ValueError(f'No connected walking route {start} -> {end}')
    chain=[end]
    while chain[-1]!=start:chain.append(previous[chain[-1]])
    chain.reverse()
    return {'points':[xy[node] for node in chain],'meters':round(costs[end]*2.226),'nodes':chain}
routes={}
for dest in ['institute','girls','boys']:
    routes[dest]={}
    for start in ['zahra','square','park','akad','institute','bridge','mashat','hospital']:
        if dest!=start:routes[dest][start]=route(start,dest)

# Clip large water rings to our viewport while preserving the actual shoreline.
def clip(poly,axis,value,greater):
    result=[]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        ia=a[axis]>=value if greater else a[axis]<=value
        ib=b[axis]>=value if greater else b[axis]<=value
        if ia:result.append(a)
        if ia!=ib:
            t=(value-a[axis])/(b[axis]-a[axis]);result.append([round(a[0]+t*(b[0]-a[0]),2),round(a[1]+t*(b[1]-a[1]),2)])
    return result
for i,p in enumerate(water):
    for axis,val,greater in [(0,-20,True),(0,1020,False),(1,-20,True),(1,830,False)]:p=clip(p,axis,val,greater)
    water[i]=p

result={'source':'OpenStreetMap contributors, ODbL 1.0','date':'2026-09-20','viewBox':[0,0,1000,810], 'roads':roads,'parks':parks,'buildings':buildings,'water':water,'named':named,'places':snaps,'routes':routes}
Path('data/district.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'{len(roads)} street ways, {len(water)} river polygon, {len(parks)} parks, {len(buildings)} mapped footprints')
for name,p in snaps.items():print(name,p['point'],'street offset',p['offsetMeters'],'m')
for dest,origins in routes.items():print(dest,{k:v['meters'] for k,v in origins.items()})
