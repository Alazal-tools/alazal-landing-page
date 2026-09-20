// Public contact details supplied in .info/readme.md. Location links supplied
// by the owner; boys' entrance side confirmed by the owner on 20 Sep 2026.
export const contacts = [
  { id: 'institute', name: 'معهد الأزل الأهلي', phone: '0781 804 1198', international: '9647818041198', address: 'الكاظمية · ساحة الزهراء · مجمع الزهراء · الطابق الثالث', instagram: 'alazal.institute', telegram: 'alazalinstitutee', direct: 'alazal_institute', facebook: 'Alazal.institute' },
  { id: 'girls', name: 'ثانوية الأزل للبنات', phone: '0770 0330 666', international: '9647700330666', address: 'الكاظمية · ساحة عبدالمحسن الكاظمي · فرع مستشفى الضرغام', instagram: 'alazal_schools', telegram: 'alazal_schools', direct: 'az_sup', facebook: 'alazal_schools' },
  { id: 'boys', name: 'ثانوية الأزل للبنين', phone: '0773 1999 246', international: '9647731999246', address: 'الكاظمية · شارع أكد · قرب متنزه ١٤ تموز · يسار عيادة حرير عند مواجهتها', instagram: 'alazal_schools', telegram: 'alazal_schools', direct: 'az_sup', facebook: 'alazal_schools' },
  { id: 'platform', name: 'منصة الأزل التعليمية', phone: '0781 804 1198', international: '9647818041198', address: 'الأزل، من مكانك.', instagram: 'alazalplatform', telegram: 'alazalplatform', facebook: 'alazalplatform' },
  { id: 'library', name: 'مكتبة الأزل', phone: '0770 543 3370', international: '9647705433370', address: 'الكاظمية · مجمع الزهراء · الطابق الأول', instagram: 'alazallibrary', telegram: 'alazallibrary', direct: 'al_azal', facebook: 'libraryalazal' },
  { id: 'publisher', name: 'دار الأزل', phone: '0770 543 3370', international: '9647705433370', address: 'للطباعة والنشر وتفاصيل الطلبات', instagram: 'Dar_alazal', telegram: 'alazallibrary', direct: 'az_p_p' },
];

// Accessible arrival details. Geographic coordinates and street-following routes
// are maintained separately in district.json and its generated routes.js.
export const destinations = {
  institute: {
    name: 'المعهد', fullName: 'معهد الأزل الأهلي', area: 'ساحة الزهراء',
    link: 'https://share.google/vCCQMyr9oHgdqi3X0', linkLabel: 'رابط موقع المعهد',
    arrival: 'وصلت. المعهد في الطابق الثالث.', note: 'والمكتبة في الطابق الأول من مجمع الزهراء.',
    steps: [
      { title: 'ساحة الزهراء', body: 'ابدأ من ساحة الزهراء، المعروفة أيضاً بالشوصة.' },
      { title: 'مجمع الزهراء', body: 'ابحث عن مجمع الزهراء الذي يضم معهد الأزل.' },
      { title: 'الطابق الثالث', body: 'اصعد إلى الطابق الثالث. هنا معهد الأزل الأهلي.' },
    ],
  },
  girls: {
    name: 'ثانوية البنات', fullName: 'ثانوية الأزل للبنات', area: 'ساحة عبدالمحسن الكاظمي',
    link: 'https://share.google/sUbgioB9ouu1H6CuR', linkLabel: 'رابط موقع ثانوية البنات',
    arrival: 'ثانوية البنات، في فرع مستشفى الضرغام.', note: 'تحتاج مساعدة داخل الفرع؟ اتصل بفريق المدرسة.',
    steps: [
      { title: 'ساحة عبدالمحسن الكاظمي', body: 'اجعل ساحة عبدالمحسن الكاظمي نقطة وصولك إلى المنطقة.' },
      { title: 'فرع مستشفى الضرغام', body: 'من منطقة الساحة، اتجه إلى الفرع المعروف بفرع مستشفى الضرغام.' },
      { title: 'ثانوية الأزل للبنات', body: 'ابحث عن لافتة ثانوية الأزل للبنات داخل الفرع. فريقنا يساعدك عند الاتصال.' },
    ],
  },
  boys: {
    name: 'ثانوية البنين', fullName: 'ثانوية الأزل للبنين', area: 'شارع أكد · قرب متنزه ١٤ تموز',
    link: 'https://share.google/vzZoMBddZnDVH4DE3', linkLabel: 'موقع عيادة حرير المجاورة',
    arrival: 'الأزل على يسارك، وأنت تواجه عيادة حرير.', note: 'مدخل ثانوية البنين على يسار العيادة مباشرة.',
    steps: [
      { title: 'الشارع أمام متنزه ١٤ تموز', body: 'ابدأ من الشارع أمام المتنزه واتجه نحو عيادة حرير، دون الدخول إلى المتنزه.' },
      { title: 'شارع أكد · عيادة حرير', body: 'في شارع أكد، ابحث عن عيادة حرير القريبة من المتنزه.' },
      { title: 'إلى يسار العيادة', body: 'قف بمواجهة عيادة حرير. مدخل ثانوية الأزل للبنين على يسارها.' },
    ],
  },
};
