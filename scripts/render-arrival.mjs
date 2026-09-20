import { readFile, writeFile } from 'node:fs/promises';
import { contacts, destinations } from '../data/places.js';

const district = JSON.parse(await readFile(new URL('../data/district.json', import.meta.url), 'utf8'));
const project = ([x,y]) => [+(370 + .86*x - .43*y).toFixed(2), +(55 + .31*x + .6*y).toFixed(2)];
const pts = points => points.map(project).map(p => p.join(',')).join(' ');
const projectedPath = points => 'M' + points.map(p=>p.join(',')).join('L');
const path = points => projectedPath(points.map(project));
const major = r => /^(primary|secondary|tertiary)/.test(r.kind);
const foot = r => /^(footway|path|steps|pedestrian)/.test(r.kind);
const routeData = Object.fromEntries(Object.entries(district.routes).map(([id,starts])=>[id,Object.fromEntries(Object.entries(starts).map(([start,r])=>[start,r.points.map(project)]))]));
await writeFile('data/routes.js', `// Walking routes derived from the connected OpenStreetMap street graph.\nexport const routes = ${JSON.stringify(routeData)};\nexport const points = ${JSON.stringify(Object.fromEntries(Object.entries(district.places).map(([k,v])=>[k,project(v.point)])))};\n`);
const landmarkLabels = [
  {id:'zahra',name:'ساحة الزهراء',point:district.places.zahra.point,label:[327,217]},
  {id:'square',name:'ساحة عبدالمحسن الكاظمي',point:district.places.square.point,label:[590,650]},
  {id:'park',name:'متنزه ١٤ تموز',point:district.places.park.point,label:[997,299]},
  {id:'akad',name:'شارع اكد',point:district.places.akad.point,label:[653,417]},
];
const facilityLabels = [
  {id:'institute',name:'المعهد',point:district.places.institute.point,label:[370,365]},
  {id:'girls',name:'ثانوية البنات',point:district.places.girls.point,label:[302,581]},
  {id:'boys',name:'ثانوية البنين',point:district.places.boys.point,label:[805,246]},
];
const origins = {
  square:'ساحة عبدالمحسن الكاظمي', zahra:'ساحة الزهراء',
  park:'الشارع أمام متنزه ١٤ تموز', bridge:'جسر الأئمة',
  akad:'شارع اكد', mashat:'شارع المشاط', hospital:'مستشفى الضرغام', institute:'معهد الأزل',
};
const mobileLabels = {
  zahra:[.19,.14], square:[.65,.83], park:[.84,.25], akad:[.64,.51],
  institute:[.16,.37], girls:[.18,.67], boys:[.61,.105],
};
function extrude(raw, height, className) {
  const base = raw.map(project), roof = base.map(([x,y])=>[x,y-height]);
  const faces = base.slice(0,-1).map((a,i)=>`<polygon points="${[a,base[i+1],roof[i+1],roof[i]].map(p=>p.join(',')).join(' ')}"/>`).join('');
  return `<g class="${className}"><g class="block-sides">${faces}</g><polygon class="block-roof" points="${roof.map(p=>p.join(',')).join(' ')}"/></g>`;
}
const map = `<svg class="district-svg" viewBox="0 0 1270 910" role="img" aria-labelledby="district-title district-description" xmlns="http://www.w3.org/2000/svg">
<title id="district-title">شوارع الكاظمية ومواقع الأزل</title>
<desc id="district-description">خريطة محلية باتجاه الشمال، مبنية من شبكة شوارع OpenStreetMap. تظهر دجلة وساحة عبدالمحسن الكاظمي وساحة الزهراء وشارع أكد ومتنزه 14 تموز. نقطة البنين مرجعها عيادة حرير المجاورة؛ المدخل على يسار العيادة عند مواجهتها. المسارات للمشي.</desc>
<defs><clipPath id="district-clip"><polygon points="${pts([[0,0],[1000,0],[1000,810],[0,810]])}"/></clipPath><pattern id="water-lines" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 16L16 0" stroke="#06ffac" stroke-width=".5" opacity=".08"/></pattern><marker id="route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#06ffac" stroke-width="2"/></marker></defs>
<path class="district-plinth" d="M21.7 541L881.7 851L1230 365v22L881.7 873L21.7 563Z"/>
<g clip-path="url(#district-clip)">
<polygon points="${pts([[0,0],[1000,0],[1000,810],[0,810]])}" fill="#21135e"/>
${district.water.map(p=>`<polygon class="district-water" points="${pts(p)}"/><polygon points="${pts(p)}" fill="url(#water-lines)"/>`).join('')}
${district.parks.map(p=>`<polygon class="district-park" points="${pts(p.points)}"/>`).join('')}
${(district.blocks||[]).map(p=>extrude(p,6,'street-block')).join('')}
${district.buildings.map(p=>extrude(p,12,'mapped-building')).join('')}
<g class="street-borders">${district.roads.filter(r=>!foot(r)).map(r=>`<path d="${path(r.points)}" stroke-width="${major(r)?12:6.5}"/>`).join('')}</g>
<g class="street-surfaces">${district.roads.map(r=>`<path d="${path(r.points)}" class="${foot(r)?'footway':major(r)?'major-street':'minor-street'}" stroke-width="${foot(r)?1.5:major(r)?8:3.5}"/>`).join('')}</g>
<g class="street-centres">${district.roads.filter(major).map(r=>`<path d="${path(r.points)}"/>`).join('')}</g>
<text class="river-name" x="893" y="621" transform="rotate(-22 893 621)">دجلة</text>

<text class="street-name" x="1025" y="423" transform="rotate(52 1025 423)">جسر الأئمة</text>
<text class="street-name" x="290" y="484" transform="rotate(-13 290 484)">شارع المشاط</text>
<text class="street-name minor-name" x="237" y="403" transform="rotate(-34 237 403)">شارع النواب</text>
<text class="street-name branch-name" x="423" y="564" transform="rotate(-9 423 564)">فرع مستشفى الضرغام</text>
<g class="hospital-marker" transform="translate(${project([390.98,579.58]).join(' ')})"><circle r="9"/><path d="M-5 0h10M0-5v10"/></g>
<path class="map-leader" d="M${project([390.98,579.58]).join(',')}L508,493"/>
<text class="hospital-label" x="513" y="487">مستشفى الضرغام</text>
<g class="route-layer"><path id="district-route-shadow" d="${projectedPath(routeData.institute.square)}"/><path id="district-route" d="${projectedPath(routeData.institute.square)}" marker-end="url(#route-arrow)"/><g id="route-directions"></g><g id="route-connectors"></g><circle id="route-origin" cx="${routeData.institute.square[0][0]}" cy="${routeData.institute.square[0][1]}" r="7"/><g id="route-traveller" transform="translate(${project(district.places.institute.point).join(' ')})"><circle class="traveller-halo" r="18"/><path d="M-7 0Q-7-7 0-7H7V0Q7 7 0 7H-7Z"/></g></g>
${landmarkLabels.map(l=>`<path class="map-leader" d="M${project(l.point).join(',')}L${l.label.join(',')}"/><circle class="landmark-dot" cx="${project(l.point)[0]}" cy="${project(l.point)[1]}" r="4"/>`).join('')}
${[...landmarkLabels,...facilityLabels].map(l=>`<path class="mobile-map-leader" d="M${project(l.point).join(',')}L${mobileLabels[l.id][0]*1270},${mobileLabels[l.id][1]*910}"/>`).join('')}
${facilityLabels.map(l=>`<g class="facility-pin" data-map-building="${l.id}" transform="translate(${project(l.point).join(' ')})"><ellipse cy="7" rx="14" ry="6" class="pin-shadow"/><path d="M-11-2L11-2V5Q11 11 4 11H-11Z" class="pin-side"/><path d="M-11-2Q-11-12-1-12H11V0Q11 6 3 6H-11Z" class="pin-top"/><image href="public/brand/logo-navy.svg" x="-5" y="-8" width="11" height="12"/></g>`).join('')}
<g class="north-arrow" transform="translate(130 613)"><path d="M-10 12L12-19m-12 4 12-4 1 12"/><text x="0" y="38">شمال</text></g>

</g></svg>`;

// Keep every polygon, stroke and paint order, but move the immutable geography
// out of the live document. Labels, routes and pins remain interactive vectors.
const baseStart = map.indexOf('<path class="district-plinth"');
const baseEnd = map.indexOf('<text class="river-name"');
const arrivalCss = await readFile('arrival.css', 'utf8');
const baseCss = arrivalCss.slice(arrivalCss.indexOf('.district-plinth {'), arrivalCss.indexOf('.river-name {'));
const defs = map.match(/<defs>[\s\S]*?<\/defs>/)[0];
const base = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1270 910"><style>${baseCss}</style>${defs}${map.slice(baseStart, baseEnd)}</g></svg>`;
await writeFile('public/district-base.svg', base);
const interactiveMap = map.slice(0, baseStart) + '<g clip-path="url(#district-clip)">' + map.slice(baseEnd);

const socialLinks = (c) => [
  ['إنستغرام', `https://www.instagram.com/${c.instagram}/`],
  ['قناة تيليغرام', `https://t.me/${c.telegram}`],
  ...(c.direct ? [['مراسلة تيليغرام', `https://t.me/${c.direct}`]] : []),
  ...(c.facebook ? [['فيسبوك', `https://www.facebook.com/${c.facebook}`]] : []),
].map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener">${name} <span aria-hidden="true">↗</span></a>`).join('');

const arrival = `<!-- arrival:start -->
      <section class="arrival section-space" id="locations" aria-labelledby="arrival-title">
        <div class="wrap">
          <header class="arrival-heading"><div><p class="eyebrow">بغداد / الكاظمية</p><h2 id="arrival-title">طريقك إلى <em>الأزل.</em></h2></div><a class="arrival-contact-shortcut" href="#contact" aria-label="أرقام التواصل والحسابات">↗</a></header>
          <div class="destination-picker" role="group" aria-label="اختَر وجهتك">${Object.entries(destinations).map(([id,d],i)=>`<button type="button" data-destination="${id}" aria-pressed="${i===0}" aria-controls="arrival-map"><span dir="ltr">0${i+1}</span>${d.name}<span aria-hidden="true">↙</span></button>`).join('')}</div>
          <div class="arrival-layout" data-active-destination="institute">
            <div class="district-view" id="arrival-map">
              <div class="arrival-origin-control"><label for="arrival-origin">جاي من وين؟</label><select id="arrival-origin" aria-label="اختَر نقطة انطلاقك">${Object.entries(origins).map(([id,name])=>`<option value="${id}" ${id==='square'?'selected':''} ${id==='institute'?'disabled':''}>${name}</option>`).join('')}</select><span class="route-mode" title="مسار مشي">↝</span></div>
              <div class="district-topline"><span class="district-key"><i></i> الأزل</span><div class="map-tools" role="group" aria-label="عرض الخريطة"><button type="button" id="map-zoom-in" aria-label="تكبير الخريطة" title="تكبير">+</button><button type="button" id="map-zoom-out" aria-label="تصغير الخريطة" title="تصغير" disabled>−</button><button type="button" id="replay-arrival" aria-label="إعادة عرض الخريطة والمسار" title="إعادة العرض">↺</button></div></div>
              <div class="district-viewport" id="district-viewport"><div class="district-model">
                <img class="district-base" src="public/district-base.svg" width="1270" height="910" loading="lazy" decoding="async" alt=""/>
                ${interactiveMap}
                ${landmarkLabels.map(l=>`<button type="button" class="map-label" data-landmark="${l.id}" style="--x:${l.label[0]/12.7}%;--y:${l.label[1]/9.1}%" aria-label="ابدأ من ${l.name}" title="ابدأ من ${l.name}">${l.name}</button>`).join('')}
                ${facilityLabels.map(l=>`<button type="button" class="facility-label" data-map-destination="${l.id}" style="--x:${l.label[0]/12.7}%;--y:${l.label[1]/9.1}%" aria-label="الوصول إلى ${destinations[l.id].fullName}">${l.name}${l.id==='boys'?'<small>عيادة حرير</small>':''}</button>`).join('')}
                <div class="arrival-inset" data-inset="institute" role="img" aria-label="مجمع الزهراء: المعهد في الطابق الثالث، والمكتبة في الطابق الأول">
                  <div class="inset-institute"><div class="elevator-arrow" aria-hidden="true">↑</div><div class="arrival-floors"><span class="selected-floor"><b>٣</b><img src="public/brand/logo-navy.svg" width="25" height="26" alt=""/><strong>المعهد</strong></span><span><b>٢</b><i class="floor-windows"></i></span><span><b>١</b><strong>المكتبة</strong></span><span class="floor-door"><i></i></span></div></div>
                  <span class="inset-caption">مجمع الزهراء</span>
                </div>
                <div class="arrival-inset" data-inset="boys" role="img" aria-label="عند مواجهة عيادة حرير، مدخل ثانوية البنين على يسار العيادة" hidden>
                  <div class="arrival-facades" dir="ltr"><div class="facade-school"><img src="public/brand/logo-navy.svg" width="26" height="27" alt=""/><span dir="rtl">ثانوية البنين</span><i></i></div><div class="facade-clinic"><b aria-hidden="true">+</b><span dir="rtl">عيادة حرير</span><i></i></div></div><svg class="entrance-arrow" viewBox="0 0 220 70" aria-hidden="true"><path d="M110 54V37H54V10m-8 10 8-10 8 10"/><circle cx="110" cy="51" r="5"/><path d="M110 59v10m-8-6 8-4 8 4"/></svg>
                </div>
                <div class="arrival-inset" data-inset="girls" role="img" aria-label="ثانوية الأزل للبنات في فرع مستشفى الضرغام قرب ساحة عبدالمحسن الكاظمي" hidden>
                  <div class="girls-facade"><img src="public/brand/logo-navy.svg" width="32" height="33" alt=""/><span>ثانوية البنات</span><i></i></div><div class="branch-lane"><span>فرع مستشفى الضرغام</span><b aria-hidden="true">↑</b></div>
                </div>
              </div>
              </div><div id="mobile-arrival-detail"></div><div class="map-contact-bar"><div class="map-address"><h3 id="destination-title">معهد الأزل الأهلي</h3><p id="destination-address">${contacts[0].address}</p></div><div class="map-contact-links"><a id="destination-phone" href="tel:+9647818041198" dir="ltr">0781 804 1198</a><a id="destination-whatsapp" href="https://wa.me/9647818041198" target="_blank" rel="noopener">واتساب ↗</a><a id="destination-location" href="https://share.google/vCCQMyr9oHgdqi3X0" target="_blank" rel="noopener" aria-label="رابط موقع المعهد">الموقع ↗</a></div></div>
              <div class="district-caption"><span title="المسارات للمشي على شبكة الشوارع المتاحة، وقد تتغير إمكانية المرور ميدانياً.">مسار مشي <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true"><circle cx="8" cy="2" r="1.5" fill="currentColor"/><path d="M7 5L5 10l4 2 1 5M5 10l-3 7M7 5l2 4 4 1M7 5L3 7 1 10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" lang="en" dir="ltr">© OpenStreetMap · ODbL</a></div>
            </div>
            <p id="arrival-announcement" class="sr-only" aria-live="polite" aria-atomic="true"></p>
          </div>
          <noscript><div class="arrival-noscript"><p>فعّل JavaScript لاستكشاف المجسّم خطوة بخطوة. عناوين الفروع وأرقامها متاحة أدناه.</p>${Object.values(destinations).map(d=>`<div><h3>${d.fullName}</h3><ol>${d.steps.map(s=>`<li>${s.body}</li>`).join('')}</ol><a href="${d.link}">${d.linkLabel} ↗</a></div>`).join('')}</div></noscript>
        </div>
      </section>
      <!-- arrival:end -->`;

const directory = `<section class="contact" id="contact" aria-labelledby="contact-title">
        <div class="wrap contact-inner">
          <div class="contact-directory-heading"><div><p class="eyebrow">لكل سؤال، أهله.</p><h2 id="contact-title">نسمعك.<br/><span>ونوصلك.</span></h2></div><p>اختَر مكانك في الأزل.<br/>كل الأرقام والحسابات، هنا.</p></div>
          <div class="contact-directory">${contacts.map((c,i)=>`<details class="contact-entry" id="contact-${c.id}" ${i===0?'open':''}><summary><span class="contact-index" dir="ltr">0${i+1}</span><h3>${c.name}</h3><span class="contact-expand" aria-hidden="true">+</span></summary><div class="contact-entry-body"><p>${c.address}</p><div class="contact-primary"><a href="tel:+${c.international}" dir="ltr">${c.phone}</a><a class="contact-wa" href="https://wa.me/${c.international}" target="_blank" rel="noopener">واتساب ↗</a></div><div class="contact-socials">${socialLinks(c)}</div>${destinations[c.id]?`<a class="contact-directions" href="#locations" data-contact-destination="${c.id}">دليل الوصول إلى ${destinations[c.id].name} ←</a>`:''}</div></details>`).join('')}</div>
        </div>
      </section>`;

let html = await readFile('index.html','utf8');
if (html.includes('<!-- arrival:start -->')) html = html.replace(/<!-- arrival:start -->[\s\S]*?<!-- arrival:end -->/, arrival);
else html = html.replace('      <section class="everyday"', arrival + '\n      <section class="everyday"');
html = html.replace(/<section class="contact" id="contact"[\s\S]*?<\/section>/,directory);
await writeFile('index.html',html);
console.log('Rendered local district model, three arrival guides, and six complete contact entries.');
