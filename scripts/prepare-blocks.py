"""Low relief from real street-enclosed blocks, not invented building sites.
Optional data maintenance step after prepare-district.py. Shapely is only used
offline; neither the website nor its normal Node build needs Python packages.
"""
import sys,json
sys.path.insert(0,'.preview/geo-deps')
from shapely.geometry import LineString,Polygon,box
from shapely.ops import unary_union,polygonize
from pathlib import Path
target=Path('data/district.json')
data=json.loads(target.read_text(encoding='utf8'))
lines=[LineString(r['points']) for r in data['roads'] if r['kind'] not in ['footway','path','steps']]
network=unary_union(lines)
water=unary_union([Polygon(r).buffer(0) for r in data['water']])
parks=unary_union([Polygon(r['points']).buffer(0) for r in data['parks']])
blocks=[]
for shape in polygonize(network):
    shape=shape.intersection(box(0,0,1000,810)).difference(water).difference(parks).buffer(-4.5,join_style=2)
    polygons=[shape] if shape.geom_type=='Polygon' else getattr(shape,'geoms',[])
    for polygon in polygons:
        if 100<polygon.area<12000:
            blocks.append([[round(x,2),round(y,2)] for x,y in polygon.simplify(.6).exterior.coords])
data['blocks']=blocks
target.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(f'Prepared {len(blocks)} actual street blocks.')
