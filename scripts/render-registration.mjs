import {readFile,writeFile} from 'node:fs/promises';
const {pages,academicYear}=JSON.parse(await readFile('data/registration.json','utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=value=>escape(value).replace('2026–2027','<bdi class="academic-year">2026–2027</bdi>');
const link=(url,label,attributes='')=>`<a href="${escape(url)}" ${attributes}>${label}</a>`;
const form=(f,index,institution)=>{
  if(!/^https:\/\/(forms\.gle|docs\.google\.com)\//.test(f.url))throw new Error(`Invalid registration destination: ${f.id}`);
  return `<article class="registration-form" data-form="${f.id}"><span class="form-number" aria-hidden="true" dir="ltr">0${index+1}</span><div class="form-copy"><p class="form-tag">${escape(f.tag)}</p><h4>${title(f.title)}</h4><p>${escape(f.description)}</p><details class="form-details"><summary>تفاصيل التسجيل <span aria-hidden="true">+</span></summary><ul>${f.details.map(t=>`<li>${escape(t)}</li>`).join('')}</ul></details></div>${link(f.url,'افتح الاستمارة <span aria-hidden="true">↗</span>',`class="form-action" target="_blank" rel="noopener" data-form-id="${f.id}" data-institution="${institution}" aria-label="فتح استمارة ${escape(f.title)}"`)}</article>`;
};
const section=`<!-- registration:start -->
      <section class="registration section-space" id="registration" aria-labelledby="registration-title">
        <span id="world" class="section-alias" aria-hidden="true"></span><span id="contact" class="section-alias" aria-hidden="true"></span>
        <div class="wrap">
          <header class="registration-heading"><div><p class="eyebrow">والخطوة هسّه إلك</p><h2 id="registration-title">اختَر مكانك.<br/><em>وابدأ.</em></h2></div><div class="registration-intro"><span class="registration-year" dir="ltr">${academicYear}</span><p>مدرسة لو معهد؟<br/>اختَر حتى تظهر استماراتك.</p></div></header>
          <nav class="registration-choices" aria-label="اختيار جهة التسجيل"><a href="#school-registration" data-registration-choice="school" aria-controls="school-registration" aria-expanded="false"><span class="choice-number" dir="ltr">01</span><strong>مدرسة</strong><small>ثانويات الأزل للبنين والبنات</small><span class="choice-arrow" aria-hidden="true">↙</span></a><a href="#institute-registration" data-registration-choice="institute" aria-controls="institute-registration" aria-expanded="false"><span class="choice-number" dir="ltr">02</span><strong>معهد</strong><small>معهد الأزل الأهلي</small><span class="choice-arrow" aria-hidden="true">↙</span></a></nav>
          <section class="registration-group" id="school-registration" data-entity="schools" aria-labelledby="school-registration-title"><div class="registration-group-heading"><span class="group-index" dir="ltr">01 / SCHOOLS</span><h3 id="school-registration-title">مدارس الأزل</h3><p class="school-motto">أبعد من التعليم.<span lang="en" dir="ltr">Beyond Education</span></p><p class="group-description">ثانويات الأزل الأهلية<br/>للبنين والبنات</p><div class="registration-contacts"><a href="tel:+9647700330666">البنات <b dir="ltr">0770 0330 666</b></a><a href="tel:+9647731999246">البنين <b dir="ltr">0773 1999 246</b></a></div></div><div class="registration-forms">${pages.school.forms.map((f,i)=>form(f,i,'schools')).join('')}</div></section>
          <section class="registration-group" id="institute-registration" data-entity="institute" aria-labelledby="institute-registration-title"><div class="registration-group-heading"><span class="group-index" dir="ltr">02 / INSTITUTE</span><h3 id="institute-registration-title">معهد الأزل الأهلي</h3><p class="group-description">اختَر مرحلتك وبرنامجك،<br/>واطّلع على تفاصيل التسجيل.</p><div class="registration-contacts"><a href="tel:+9647818041198"><b dir="ltr">0781 804 1198</b></a><a href="https://wa.me/9647818041198" target="_blank" rel="noopener">واتساب المعهد ↗</a></div></div><div class="registration-forms">${pages.institute.forms.map((f,i)=>form(f,i,'institute')).join('')}</div></section>
          <p class="registration-note">تُفتح الاستمارات على Google Forms. فريق الأزل يتابع وياك إكمال التسجيل.</p>
        </div>
      </section>
      <!-- registration:end -->`;
const html=await readFile('index.html','utf8');
await writeFile('index.html',html.replace(/<!-- registration:start -->[\s\S]*?<!-- registration:end -->/,section));
console.log('Rendered five registration forms on the main website.');
