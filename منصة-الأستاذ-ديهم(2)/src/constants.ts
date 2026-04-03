export const PROVINCES = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
  'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر شرق', 'الجزائر وسط', 'الجزائر غرب', 'الجلفة', 'جيجل',
  'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة',
  'معسكر', 'ورقلة', 'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت',
  'الوادي', 'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان',
  'تيميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس', 'إن صالح', 'إن قزام', 'تقرت', 'جانت', 'المغير', 'المنيعة'
];

export const SUBJECTS = [
  'الرياضيات', 'اللغة العربية', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التاريخ والجغرافيا',
  'التربية الإسلامية', 'التربية المدنية', 'العلوم الطبيعية والحياة', 'العلوم الفيزيائية والتكنولوجيا',
  'التربية التشكيلية', 'التربية الموسيقية', 'التربية البدنية والرياضية', 'الفلسفة', 'المحاسبة',
  'الاقتصاد', 'القانون', 'التكنولوجيا', 'الإعلام الآلي'
];

export const PRIMARY_LEVELS = [
  'سنة 1 ابتدائي', 'سنة 2 ابتدائي', 'سنة 3 ابتدائي', 'سنة 4 ابتدائي', 'سنة 5 ابتدائي'
];

export const MIDDLE_LEVELS = [
  'السنة الأولى متوسط', 'السنة الثانية متوسط', 'السنة الثالثة متوسط', 'السنة الرابعة متوسط'
];

export const HIGH_LEVELS = [
  'السنة الأولى ثانوي', 'السنة الثانية ثانوي', 'السنة الثالثة ثانوي'
];

export const ALL_LEVELS = [...PRIMARY_LEVELS, ...MIDDLE_LEVELS, ...HIGH_LEVELS];

export const EXAM_TYPES = [
  'فرض محروس', 'اختبار الفصل الأول', 'اختبار الفصل الثاني', 'اختبار الفصل الثالث', 'امتحان تجريبي'
];

export const STATIC_PAGES = {
  about: {
    title: 'من نحن',
    content: `
      <div class="text-center mb-8">
        <div class="w-32 h-32 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-blue-500 shadow-lg">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi_DbPOPTnopsRTUEA7ZaO-g-UUalsOzwtXAB3gbOCs6Y9DBXVD1HOx00wxn-py9g3qQhSkZPRiODGAnPtdiz17YqNUkehzoM0wLfiGh8f_AVoDbs8gFe10FkgVuUe_66P6lP5LZsm3rHdKB24IC6rAqaOBqRRNwuUNfTAD2WDuePRmeHyEK5ejr8CvRFA/s4032/IMG_3109.webp" alt="الأستاذ عبداللطيف" class="w-full h-full object-cover rounded-full border-4 border-white bg-gray-100" />
        </div>
        <h2 class="text-emerald-700 text-2xl font-bold mb-4">مرحباً بكم في منصة الأستاذ الذكية</h2>
      </div>
      <p class="text-lg mb-6">
        هذه المنصة هي مبادرة شخصية غير ربحية، تم تطويرها وبرمجتها بالكامل من قبل <strong>الأستاذ عبداللطيف ديحم</strong>، أستاذ مادة الرياضيات.
      </p>
      <div class="bg-slate-50 border-r-4 border-emerald-500 p-5 rounded-l-lg mb-8">
        <h3 class="text-slate-900 text-xl font-bold mt-0 mb-3">الهدف من المنصة</h3>
        <p class="m-0">
          تهدف هذه المنصة إلى مساعدة زملائي الأساتذة في الجزائر على توفير الوقت والجهد في إعداد الاختبارات، الفروض، المذكرات، ومعالجة نقاط الرقمنة. نعتمد على أحدث تقنيات الذكاء الاصطناعي لتقديم محتوى تعليمي يتماشى مع مناهج الجيل الثاني.
        </p>
      </div>
      <h3 class="text-slate-900 text-xl font-bold mb-4">المميزات الرئيسية:</h3>
      <ul class="list-none p-0 m-0 mb-8 space-y-3">
        <li class="flex items-start gap-3">
          <span class="text-emerald-500 text-xl">✓</span>
          <span>توليد اختبارات وفروض مع التصحيح النموذجي وسلّم التنقيط.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-emerald-500 text-xl">✓</span>
          <span>إنشاء مذكرات دروس احترافية (أنشطة عددية، هندسية، تنظيم معطيات).</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-emerald-500 text-xl">✓</span>
          <span>معالجة آلية لملفات الرقمنة (Excel) وتوليد الملاحظات والتقديرات.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-emerald-500 text-xl">✓</span>
          <span>مجانية بالكامل ولا تتطلب سوى مفتاح API شخصي لضمان الخصوصية.</span>
        </li>
      </ul>
      <p class="text-center font-bold text-emerald-700 mt-8">
        نسأل الله أن يجعل هذا العمل خالصاً لوجهه الكريم، وأن ينفع به الأساتذة والتلاميذ.
      </p>
    `
  },
  privacy: {
    title: 'سياسة الخصوصية',
    content: `
      <p class="mb-4">في <strong>منصة الأستاذ الذكية</strong>، ندرك تماماً أهمية خصوصية بياناتك كأستاذ وخصوصية بيانات تلاميذك. توضح هذه الصفحة كيف نتعامل مع المعلومات عند استخدامك للمنصة.</p>
      
      <h2 class="text-blue-800 text-xl font-bold mt-6 mb-3">1. مفاتيح API (Gemini API Key)</h2>
      <p class="mb-4">لكي تعمل أدوات الذكاء الاصطناعي، تتطلب المنصة استخدام مفتاح API خاص بك. <strong>نحن لا نقوم بتخزين هذا المفتاح على خوادمنا أبداً.</strong> يتم حفظ المفتاح في "التخزين المحلي" (LocalStorage) لمتصفحك فقط، ويتم استخدامه مباشرة للاتصال بخدمات Google Gemini.</p>
      
      <h2 class="text-blue-800 text-xl font-bold mt-6 mb-3">2. ملفات الإكسل وبيانات التلاميذ</h2>
      <p class="mb-2">عند استخدام أداة "حجز الملاحظات" ورفع ملف الرقمنة:</p>
      <ul class="list-disc pr-6 mb-4 space-y-2">
          <li>تتم معالجة الملف بالكامل داخل متصفحك (Client-side).</li>
          <li>لا يتم رفع أسماء التلاميذ أو علاماتهم إلى أي خادم خارجي تابع لنا.</li>
          <li>يتم إرسال البيانات الإحصائية العامة فقط (مثل معدل القسم) إلى الذكاء الاصطناعي للحصول على التحليل البيداغوجي.</li>
      </ul>
      
      <h2 class="text-blue-800 text-xl font-bold mt-6 mb-3">3. أمن المعلومات</h2>
      <p class="mb-4">بما أن المنصة تعمل كأداة "بدون خادم" (Serverless) في معظم وظائفها، فإن أمن بياناتك يعتمد بشكل كبير على أمن جهازك ومتصفحك. ننصح دائماً باستخدام متصفحات حديثة وعدم مشاركة مفتاح API الخاص بك مع الآخرين.</p>
    `
  },
  contact: {
    title: 'اتصل بنا',
    content: `
      <div class="text-center mb-8">
        <div class="w-36 h-36 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-emerald-500 shadow-lg">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi_DbPOPTnopsRTUEA7ZaO-g-UUalsOzwtXAB3gbOCs6Y9DBXVD1HOx00wxn-py9g3qQhSkZPRiODGAnPtdiz17YqNUkehzoM0wLfiGh8f_AVoDbs8gFe10FkgVuUe_66P6lP5LZsm3rHdKB24IC6rAqaOBqRRNwuUNfTAD2WDuePRmeHyEK5ejr8CvRFA/s4032/IMG_3109.webp" alt="الأستاذ عبداللطيف" class="w-full h-full object-cover rounded-full border-4 border-white bg-gray-100" />
        </div>
        <h2 class="m-0 text-blue-800 text-2xl font-bold">الأستاذ عبداللطيف ديحم</h2>
        <p class="text-gray-500 mt-1 text-sm">مطور المنصة وأستاذ مادة الرياضيات</p>
      </div>

      <p class="text-center text-lg mb-8 text-gray-600">
        يسعدنا دائماً سماع آرائكم واقتراحاتكم لتطوير المنصة. لا تتردد في التواصل معنا عبر المنصات التالية:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <a href="https://www.youtube.com/@math-bem-dz" target="_blank" rel="noopener noreferrer" class="bg-white p-4 rounded-2xl border border-red-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md shadow-sm">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500 shrink-0">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </div>
          <div>
            <h3 class="text-red-500 m-0 mb-1 text-lg font-bold">قناة اليوتيوب</h3>
            <p class="text-gray-500 m-0 text-sm" dir="ltr">@math-bem-dz</p>
          </div>
        </a>

        <a href="https://www.facebook.com/functionLinear" target="_blank" rel="noopener noreferrer" class="bg-white p-4 rounded-2xl border border-blue-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md shadow-sm">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </div>
          <div>
            <h3 class="text-blue-500 m-0 mb-1 text-lg font-bold">صفحة الفيسبوك</h3>
            <p class="text-gray-500 m-0 text-sm" dir="ltr">/functionLinear</p>
          </div>
        </a>

        <a href="mailto:abdelatifdihem@gmail.com" class="bg-white p-4 rounded-2xl border border-amber-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md shadow-sm md:col-span-2 max-w-md mx-auto w-full">
          <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <div>
            <h3 class="text-amber-600 m-0 mb-1 text-lg font-bold">البريد الإلكتروني</h3>
            <p class="text-gray-500 m-0 text-sm" dir="ltr">abdelatifdihem@gmail.com</p>
          </div>
        </a>
      </div>
    `
  }
};
