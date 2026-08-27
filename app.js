// ═══════════════════════════════════════════════════════════════
// Jadwalak — نظام إنشاء الجداول المدرسية
// app.js — الحالة، الواجهة، وخوارزمية التوليد
// ═══════════════════════════════════════════════════════════════

// المشاريع الآن ملفات حقيقية على القرص (.jdwl، مع قبول .json القديمة عند الفتح فقط — راجع ProjectFileBridge.cs
// للتفاصيل). "قائمة المشاريع" أصبحت قائمة "ملفات حديثة" بسيطة (مسار + تاريخ آخر حفظ)، مخزَّنة محليًا لأنها
// مجرّد اختصارات ملاحة منخفضة المخاطر — لا بيانات فعلية، فقدانها يعني "أعد التصفح لملفك" لا فقدان أي عمل
const RECENTS_KEY = 'jadwalak_recent_files_v1';
const RECENTS_MAX = 20;
const ALL_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DEFAULT_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

// الصفوف الافتراضية وفق السلم التعليمي في الأردن من الصف الأول حتى الثاني عشر
const DEFAULT_GRADES = [
  'الصف الأول', 'الصف الثاني', 'الصف الثالث', 
  'الصف الرابع', 'الصف الخامس', 'الصف السادس',
  'الصف السابع', 'الصف الثامن', 'الصف التاسع',
  'الصف العاشر', 'الصف الحادي عشر', 'الصف الثاني عشر'
];

// الشعب الافتراضية محدودة من أ حتى و
const DEFAULT_SECTIONS = [
  'شعبة أ', 'شعبة ب', 'شعبة ج', 'شعبة د', 'شعبة هـ', 'شعبة و'
];

// قائمة المواد الافتراضية وفق منهاج وزارة التربية والتعليم الأردنية
const DEFAULT_SUBJECTS = [
    'التربية الإسلامية',
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'الدراسات الاجتماعية',
    'العلوم',
    'التربية الفنية والموسيقية والمسرحية',
    'التربية الرياضية',
    'النشاط',
    'التربية المهنية',
    'الثقافة المالية',
    'المهارات الرقمية',
    'اللغة الفرنسية (اختيارية)',
    'تاريخ الأردن',
    'العلوم بفروعه',
    'العلوم الحياتية',
    'الكيمياء',
    'الفيزياء',
    'علوم الأرض والبيئة',
    'اللغة الإنجليزية المتقدم',
    'التربية الإسلامية / تخصص',
    'اللغة العربية / تخصص',
    'التاريخ',
    'الجغرافيا',
    'علم الاجتماع وعلم النفس / الثقافة المالية / الفلسفة (مبحث اختياري)',
    'الإنجليزية الوظيفية',
    'اللغة الفرنسية (لتخصص الضيافة)'
];

// توزيع أنصبة الحصص الأسبوعية للمواد بحسب الصفوف (1 إلى 12) وفق الخطة الدراسية بالأردن
const DEFAULT_SUBJECT_PERIODS = {
    // ── الصف الأول ──
    "التربية الإسلامية___الصف الأول": 2,
    "اللغة العربية___الصف الأول": 7,
    "اللغة الإنجليزية___الصف الأول": 4,
    "الرياضيات___الصف الأول": 5,
    "الدراسات الاجتماعية___الصف الأول": 1,
    "العلوم___الصف الأول": 1,
    "التربية الفنية والموسيقية والمسرحية___الصف الأول": 1,
    "التربية الرياضية___الصف الأول": 2,
    "النشاط___الصف الأول": 2,

    // ── الصف الثاني ──
    "التربية الإسلامية___الصف الثاني": 2,
    "اللغة العربية___الصف الثاني": 7,
    "اللغة الإنجليزية___الصف الثاني": 4,
    "الرياضيات___الصف الثاني": 5,
    "الدراسات الاجتماعية___الصف الثاني": 1,
    "العلوم___الصف الثاني": 1,
    "التربية الفنية والموسيقية والمسرحية___الصف الثاني": 1,
    "التربية الرياضية___الصف الثاني": 2,
    "النشاط___الصف الثاني": 2,

    // ── الصف الثالث ──
    "التربية الإسلامية___الصف الثالث": 2,
    "اللغة العربية___الصف الثالث": 7,
    "اللغة الإنجليزية___الصف الثالث": 4,
    "الرياضيات___الصف الثالث": 5,
    "الدراسات الاجتماعية___الصف الثالث": 1,
    "العلوم___الصف الثالث": 1,
    "التربية الفنية والموسيقية والمسرحية___الصف الثالث": 1,
    "التربية الرياضية___الصف الثالث": 2,
    "النشاط___الصف الثالث": 2,

    // ── الصف الرابع ──
    "التربية الإسلامية___الصف الرابع": 3,
    "اللغة العربية___الصف الرابع": 7,
    "اللغة الإنجليزية___الصف الرابع": 4,
    "الرياضيات___الصف الرابع": 5,
    "الدراسات الاجتماعية___الصف الرابع": 2,
    "العلوم___الصف الرابع": 3,
    "التربية الفنية والموسيقية والمسرحية___الصف الرابع": 1,
    "التربية الرياضية___الصف الرابع": 2,
    "التربية المهنية___الصف الرابع": 2,
    "النشاط___الصف الرابع": 2,

    // ── الصف الخامس ──
    "التربية الإسلامية___الصف الخامس": 3,
    "اللغة العربية___الصف الخامس": 7,
    "اللغة الإنجليزية___الصف الخامس": 5,
    "الرياضيات___الصف الخامس": 5,
    "الدراسات الاجتماعية___الصف الخامس": 2,
    "العلوم___الصف الخامس": 3,
    "التربية الفنية والموسيقية والمسرحية___الصف الخامس": 1,
    "التربية الرياضية___الصف الخامس": 2,
    "التربية المهنية___الصف الخامس": 2,
    "النشاط___الصف الخامس": 2,

    // ── الصف السادس ──
    "التربية الإسلامية___الصف السادس": 3,
    "اللغة العربية___الصف السادس": 7,
    "اللغة الإنجليزية___الصف السادس": 5,
    "الرياضيات___الصف السادس": 5,
    "الدراسات الاجتماعية___الصف السادس": 3,
    "العلوم___الصف السادس": 3,
    "التربية الفنية والموسيقية والمسرحية___الصف السادس": 1,
    "التربية الرياضية___الصف السادس": 2,
    "التربية المهنية___الصف السادس": 2,
    "النشاط___الصف السادس": 2,

    // ── الصف السابع ──
    "التربية الإسلامية___الصف السابع": 3,
    "اللغة العربية___الصف السابع": 6,
    "اللغة الإنجليزية___الصف السابع": 5,
    "الرياضيات___الصف السابع": 5,
    "الدراسات الاجتماعية___الصف السابع": 3,
    "العلوم___الصف السابع": 4,
    "التربية الفنية والموسيقية والمسرحية___الصف السابع": 1,
    "التربية الرياضية___الصف السابع": 2,
    "التربية المهنية___الصف السابع": 2,
    "الثقافة المالية___الصف السابع": 1,
    "المهارات الرقمية___الصف السابع": 2,
    "النشاط___الصف السابع": 2,

    // ── الصف الثامن ──
    "التربية الإسلامية___الصف الثامن": 3,
    "اللغة العربية___الصف الثامن": 6,
    "اللغة الإنجليزية___الصف الثامن": 5,
    "الرياضيات___الصف الثامن": 5,
    "الدراسات الاجتماعية___الصف الثامن": 3,
    "العلوم___الصف الثامن": 4,
    "التربية الفنية والموسيقية والمسرحية___الصف الثامن": 1,
    "التربية الرياضية___الصف الثامن": 2,
    "التربية المهنية___الصف الثامن": 2,
    "الثقافة المالية___الصف الثامن": 1,
    "المهارات الرقمية___الصف الثامن": 2,
    "اللغة الفرنسية (اختیارية)___الصف الثامن": 3,
    "النشاط___الصف الثامن": 2,

    // ── الصف التاسع ──
    "التربية الإسلامية___الصف التاسع": 3,
    "اللغة العربية___الصف التاسع": 6,
    "اللغة الإنجليزية___الصف التاسع": 5,
    "الرياضيات___الصف التاسع": 5,
    "الدراسات الاجتماعية___الصف التاسع": 3,
    "العلوم___الصف التاسع": 5,
    "التربية الفنية والموسيقية والمسرحية___الصف التاسع": 1,
    "التربية الرياضية___الصف التاسع": 2,
    "التربية المهنية___الصف التاسع": 2,
    "الثقافة المالية___الصف التاسع": 1,
    "المهارات الرقمية___الصف التاسع": 2,
    "اللغة الفرنسية (اختيارية)___الصف التاسع": 3,
    "النشاط___الصف التاسع": 2,

    // ── الصف العاشر / المسار الأكاديمي ──
    "التربية الإسلامية___الصف العاشر / المسار الأكاديمي": 3,
    "اللغة العربية___الصف العاشر / المسار الأكاديمي": 5,
    "اللغة الإنجليزية___الصف العاشر / المسار الأكاديمي": 5,
    "الرياضيات___الصف العاشر / المسار الأكاديمي": 5,
    "الدراسات الاجتماعية___الصف العاشر / المسار الأكاديمي": 3,
    "العلوم___الصف العاشر / المسار الأكاديمي": 6,
    "التربية الفنية والموسيقية والمسرحية___الصف العاشر / المسار الأكاديمي": 1,
    "التربية الرياضية___الصف العاشر / المسار الأكاديمي": 1,
    "الثقافة المالية___الصف العاشر / المسار الأكاديمي": 1,
    "المهارات الرقمية___الصف العاشر / المسار الأكاديمي": 2,
    "اللغة الفرنسية (اختيارية)___الصف العاشر / المسار الأكاديمي": 3,
    "النشاط___الصف العاشر / المسار الأكاديمي": 2,

    // ── الصف الحادي عشر / المسار الأكاديمي ──
    "التربية الإسلامية___الصف الحادي عشر / المسار الأكاديمي": 5,
    "اللغة العربية___الصف الحادي عشر / المسار الأكاديمي": 6,
    "اللغة الإنجليزية___الصف الحادي عشر / المسار الأكاديمي": 5,
    "تاريخ الأردن___الصف الحادي عشر / المسار الأكاديمي": 4,
    "الرياضيات___الصف الحادي عشر / المسار الأكاديمي": 5,
    "العلوم بفروعه___الصف الحادي عشر / المسار الأكاديمي": 6,
    "المهارات الرقمية___الصف الحادي عشر / المسار الأكاديمي": 2,
    "التربية الرياضية___الصف الحادي عشر / المسار الأكاديمي": 1,
    "الثقافة المالية___الصف الحادي عشر / المسار الأكاديمي": 1,

    // ── الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي) ──
    "المهارات الرقمية___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 2,
    "التربية الرياضية___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 1,
    "الرياضيات___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 6,
    "العلوم الحياتية___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 5,
    "الكيمياء___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 5,
    "الفيزياء___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 5,
    "علوم الأرض والبيئة___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 5,
    "اللغة الإنجليزية المتقدم___الصف الثاني عشر / المسار الأكاديمي (الحقل الصحي)": 5,

    // ── الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة) ──
    "المهارات الرقمية___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 2,
    "التربية الرياضية___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 1,
    "الرياضيات___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 6,
    "العلوم الحياتية___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 5,
    "الكيمياء___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 5,
    "الفيزياء___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 5,
    "علوم الأرض والبيئة___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 5,
    "اللغة الإنجليزية المتقدم___الصف الثاني عشر / المسار الأكاديمي (حقل العلوم والتكنولوجيا والهندسة)": 5,

    // ── الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية) ──
    "المهارات الرقمية___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 2,
    "التربية الرياضية___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 1,
    "التربية الإسلامية / تخصص___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 5,
    "اللغة العربية / تخصص___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 5,
    "اللغة الإنجليزية المتقدم___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 5,
    "التاريخ___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 5,
    "الجغرافيا___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 5,
    "علم الاجتماع وعلم النفس / الثقافة المالية / الفلسفة (مبحث اختياري)___الصف الثاني عشر / المسار الأكاديمي (حقل اللغات والعلوم الإنسانية والاجتماعية)": 5,

    // ── الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة) ──
    "التربية الإسلامية___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "اللغة العربية___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "اللغة الإنجليزية___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "الإنجليزية الوظيفية___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 2,
    "اللغة الفرنسية (لتخصص الضيافة)___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "تاريخ الأردن___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 2,
    "المهارات الرقمية___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 2,
    "التربية الرياضية___الصف الحادي عشر / المسار المهني التقني (الثقافة المشتركة)": 1,

    // ── الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة) ──
    "التربية الإسلامية___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "اللغة العربية___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "اللغة الإنجليزية___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "الإنجليزية الوظيفية___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 2,
    "اللغة الفرنسية (لتخصص الضيافة)___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 3,
    "تاريخ الأردن___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 2,
    "المهارات الرقمية___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 2,
    "التربية الرياضية___الصف الثاني عشر / المسار المهني التقني (الثقافة المشتركة)": 1
};

function defaultConstraints() {
  return {
    // أرقام الحصص التي يجب توزيعها بالتساوي قدر الإمكان بين المعلمين — مثال: [7]
    balancedPeriods: [],
    // أوقات ممنوعة على معلم معيّن: { teacherId, day, period }
    teacherBlocks: [],
    // أي معلمين لهم صف ظاهر في مصفوفة "أوقات ممنوعة لمعلم محدد" (حتى قبل تأشير أي خانة له فعلًا)
    teacherBlockRows: [],
    // تجميع حصص مادة لصف معيّن في نفس اليوم بشكل متتابع: { subject, grade }
    subjectGrouping: [],
    // أزواج "مادة___صف" سبق أن طُبِّق عليها قرار التجميع الافتراضي مرة واحدة (سواء بتفعيله أو لعدم انطباقه)
    // — تمنع إعادة فرض الافتراضي على مادة/صف عدّل المستخدم قراره بشأنه لاحقًا، بنفس منطق تعامل الحدود
    // اليومية للصف (الخطوة الثانية) مع القيم المخصَّصة يدويًا
    subjectGroupingDefaultsApplied: [],
    // تثبيت حصة مادة في شعبة معيّنة عند يوم وحصة محددين دائمًا: { classKey, subject, day, period }
    fixedPlacements: [],
  };
}

// بيانات إدارية تُستخدَم فقط عند تصدير الجدول بصيغة النموذج الوزاري الرسمي — لا علاقة لها بالتوليد أو أي
// حساب آخر في التطبيق، فتغييرها لا يستدعي إعادة توليد الجدول إطلاقًا
function defaultSchoolInfo() {
  return {
    schoolYear: '',
    directorateName: '',
    schoolName: '',
    cityName: '',
    formNumber: 'نموذج (11)',
  };
}

// كائن حالة افتراضي جديد كليًا (لا يشارك أي مصفوفة/كائن داخلي مع أي استدعاء سابق) — يُستخدَم لتهيئة الحالة
// عند بدء التطبيق، وعند إنشاء أي مشروع جديد لاحقًا، حتى لا يتسرّب أي أثر من مشروع سابق إلى مشروع جديد
function createDefaultState() {
  return {
    school: { days: [...DEFAULT_DAYS], maxPeriods: 6 },
    grades: [...DEFAULT_GRADES],
    sections: [...DEFAULT_SECTIONS],
    activeClasses: {}, // Default filled but UNCHECKED
    subjects: [...DEFAULT_SUBJECTS],
    subjectPeriods: { ...DEFAULT_SUBJECT_PERIODS }, // { "SubjectName___GradeName": number }
    teachers: [],
    constraints: defaultConstraints(),
    gradeDayCaps: {}, // { [اسم الصف]: { [اسم اليوم]: عدد الحصص القصوى } } — الخطوة الثانية
    schoolInfo: defaultSchoolInfo(), // بيانات إدارية للتصدير بصيغة النموذج الرسمي فقط — لا تؤثر على التوليد
    timetable: null
  };
}

let state = createDefaultState();

let currentStep = 1;
let modalState = { editingId: null, name: '', assignMap: {}, activeSubject: null };

// المسار الفعلي للملف المفتوح حاليًا، أو null في حالتين مختلفتين تمامًا: لا مشروع مفتوح إطلاقًا (شاشة
// قائمة الملفات الحديثة معروضة)، أو مشروع جديد مفتوح في المعالِج لم يُحفَظ ولو مرة واحدة بعد (لا يوجد له
// مسار حتى يختاره المستخدم بنفسه عند أول حفظ — تُميَّز هاتان الحالتان عمليًا بأي شاشة معروضة حاليًا)
let currentProjectPath = null;

// مقبض ملف حقيقي (FileSystemFileHandle) — يُستخدَم فقط في نسخة الموقع الساكن (لا غلاف WebView2) عند توفّر
// File System Access API في المتصفح: يسمح بإعادة الكتابة على نفس الملف مباشرة في الحفظات اللاحقة، أقرب
// لتجربة سطح المكتب. يبقى null دومًا على تطبيق سطح المكتب (لا حاجة له إطلاقًا هناك، الحفظ عبر الجسر مباشرة)
// وأيضًا في متصفحات لا تدعم هذه الواجهة (فَيَرفوكس/سفاري) — تلك تتراجع لتنزيل ملف جديد في كل حفظ بلا مقبض
let currentFileHandle = null;

function supportsFileSystemAccess() {
  return typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function';
}

function downloadTextAsFile(content, fileName) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── قائمة "الملفات الحديثة" — اختصارات ملاحة محليّة فقط (مسار + تاريخ آخر حفظ)، لا بيانات فعلية ──────
function loadRecentFiles() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { console.warn('تعذّرت قراءة قائمة الملفات الحديثة', e); return []; }
}
function saveRecentFiles(list) {
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)); }
  catch (e) { console.warn('تعذّر حفظ قائمة الملفات الحديثة', e); }
}
function addOrUpdateRecent(path) {
  const list = loadRecentFiles();
  const existing = list.find(r => r.path === path);
  if (existing) existing.lastModified = new Date().toISOString();
  else list.push({ path, lastModified: new Date().toISOString() });
  list.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  saveRecentFiles(list.slice(0, RECENTS_MAX));
}
function removeRecent(path) {
  saveRecentFiles(loadRecentFiles().filter(r => r.path !== path));
}
// اسم العرض يُشتَقّ من المسار مباشرة في كل مرة (لا يُخزَّن بشكل منفصل) — فهو نفسه اسم الملف الفعلي على
// القرص دومًا بلا احتمال تعارض بينهما، تمامًا كما تعرض قوائم "الملفات الأخيرة" في Word أو Excel
function pathBasename(path) {
  if (!path) return '';
  const norm = path.replace(/\\/g, '/');
  const parts = norm.split('/');
  return parts[parts.length - 1] || path;
}

// ── تطبيع أي state خام (من ملف مفتوح، أو من ملف مستورَد) إلى كائن صالح ومكتمل — لا يمسّ التخزين إطلاقًا ──
function normalizeState(rawState) {
  const result = Object.assign(createDefaultState(), rawState);
  if (!result.school) result.school = { days: [...DEFAULT_DAYS], maxPeriods: 6 };
  if (!result.activeClasses) result.activeClasses = {};
  if (!result.grades || result.grades.length === 0) result.grades = [...DEFAULT_GRADES];
  if (!result.sections || result.sections.length === 0) result.sections = [...DEFAULT_SECTIONS];
  if (!result.subjects || result.subjects.length === 0) result.subjects = [...DEFAULT_SUBJECTS];
  if (!result.subjectPeriods || Object.keys(result.subjectPeriods).length === 0) {
    result.subjectPeriods = { ...DEFAULT_SUBJECT_PERIODS };
  }
  if (!result.teachers) result.teachers = [];
  if (!result.gradeDayCaps || typeof result.gradeDayCaps !== 'object') result.gradeDayCaps = {};
  if (!result.schoolInfo || typeof result.schoolInfo !== 'object') result.schoolInfo = defaultSchoolInfo();
  result.schoolInfo = Object.assign(defaultSchoolInfo(), result.schoolInfo);
  if (!result.constraints) result.constraints = defaultConstraints();
  if (!Array.isArray(result.constraints.balancedPeriods)) result.constraints.balancedPeriods = [];
  if (!Array.isArray(result.constraints.teacherBlocks)) result.constraints.teacherBlocks = [];
  if (!Array.isArray(result.constraints.teacherBlockRows)) result.constraints.teacherBlockRows = [];
  if (!Array.isArray(result.constraints.subjectGrouping)) result.constraints.subjectGrouping = [];
  if (!Array.isArray(result.constraints.subjectGroupingDefaultsApplied)) result.constraints.subjectGroupingDefaultsApplied = [];
  if (!Array.isArray(result.constraints.fixedPlacements)) result.constraints.fixedPlacements = [];
  if (result.timetable && !Array.isArray(result.timetable.unpinned)) result.timetable.unpinned = [];
  migrateBalancedPeriodsFormat(result);
  return result;
}

// توافق مع إصدار سابق كانت فيه "balancedPeriods" مجرد مصفوفة أرقام حصص (بلا تحديد شعبة) تُطبَّق على كل الشعب.
// الإصدار الحالي يتطلب تحديد الشعبة صراحة، فنحوّل كل رقم حصة قديم إلى قيد لكل شعبة نشطة للحفاظ على نفس السلوك السابق.
function migrateBalancedPeriodsFormat(state) {
  const list = state.constraints.balancedPeriods || [];
  const hasOldFormat = list.some(x => typeof x === 'number');
  if (!hasOldFormat) return;

  const oldPeriods = list.filter(x => typeof x === 'number');
  const newEntries = list.filter(x => typeof x !== 'number');
  const allClassKeys = [];
  (state.grades || []).forEach(g => (state.sections || []).forEach(s => {
    const k = classKey(g, s);
    if (state.activeClasses && state.activeClasses[k]) allClassKeys.push(k);
  }));
  oldPeriods.forEach(p => {
    allClassKeys.forEach(k => {
      if (!newEntries.some(e => e.classKey === k && e.period === p)) newEntries.push({ classKey: k, period: p });
    });
  });
  state.constraints.balancedPeriods = newEntries;
}

// يبني نص الملف الكامل (نفس غلاف exportedFrom/exportVersion/exportedAt المستخدَم دومًا) من الحالة الحالية
function buildFileContent() {
  return JSON.stringify({
    exportedFrom: 'Jadwalak',
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    state,
  }, null, 2);
}

// ═══════════════════════════════════════════════════════════════
// حفظ صريح (كـ Word/Excel): كل تعديل في البيانات يُعلِّم المشروع "غير محفوظ" فقط (markDirty) — بلا أي كتابة
// فعلية للقرص — والكتابة الفعلية (saveState) لا تحدث إلا بفعل صريح من المستخدم: Ctrl+S، زر الحفظ، أو
// موافقته على الحفظ ضمن نافذة "تغييرات غير محفوظة" عند فتح/تبديل ملف آخر. عمدًا بلا أي حفظ تلقائي خلفي —
// خيار واعٍ (راجع النقاش): التعقيد والصيانة اللازمان لحفظ احتياطي صامت لا يستحقّان مقابل هذا الخطر تحديدًا.
// لا مقارنة بمحتوى آخر نسخة محفوظة أبدًا — أي تغيير يُعلِّم المشروع كـ"غير محفوظ" فورًا، حتى لو كانت نتيجته
// مطابقة لما كان محفوظًا من قبل (نفس سلوك Word تمامًا: يتتبّع "هل حدث شيء منذ آخر حفظ"، لا مقارنة فعلية للمحتوى)
let isDirty = false;

function markDirty() {
  isDirty = true;
  updateDirtyIndicator();
}

// حفظ فعلي: للمسار الحالي مباشرة إن كان معروفًا (Ctrl+S العادي)، أو عبر نافذة "حفظ باسم" إن لم يكن (أول
// حفظ لمشروع جديد)، أو دومًا عبر النافذة إن forceAs=true ("حفظ باسم" صريح، حتى لو كان المسار معروفًا بالفعل
// — يشمل هذا ما كان يُسمّى "تصدير البيانات" سابقًا، فأصبحا الآن نفس الفعل بالضبط بعد أن غدا الملف حقيقيًا).
// تُرجع true عند نجاح الحفظ فعليًا، false عند الإلغاء أو الفشل (بلا استثناء أبدًا — الفشل يُعرَض كرسالة فقط)
async function saveState(forceAs) {
  if (!isBridgeAvailable()) return await saveStateViaBrowser(forceAs);

  const payload = {
    content: buildFileContent(),
    existingPath: currentProjectPath,
    suggestedFileName: (state.schoolInfo && state.schoolInfo.schoolName) ? state.schoolInfo.schoolName : 'مشروع جدولك',
    forceDialog: !!forceAs,
  };
  let result;
  try {
    result = await callSaveProjectFileBridge(payload, 30000);
  } catch (err) {
    toast(`تعذّر الاتصال بمحرّك الحفظ: ${err.message || err}`, 'error');
    return false;
  }
  if (result.cancelled) return false;
  if (!result.isSuccess) {
    toast(`تعذّر الحفظ: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    return false;
  }
  currentProjectPath = result.filePath;
  isDirty = false;
  updateDirtyIndicator();
  addOrUpdateRecent(currentProjectPath);
  return true;
}

// مسار الحفظ في المتصفح (نسخة الموقع الساكن، لا غلاف WebView2): يُفضَّل File System Access API حين تتوفر،
// وتتراجع تلقائيًا لتنزيل ملف جديد في كل مرة حين لا تتوفر. لا "ملفات حديثة" في أيٍّ من المسارين هنا — إعادة
// الفتح لاحقًا تعتمد على مقبض ملف حقيقي لا نملك آلية تخزينه بين جلسات المتصفح بعد (راجع applyOpenedFileContent)
async function saveStateViaBrowser(forceAs) {
  const content = buildFileContent();
  const suggestedName = ((state.schoolInfo && state.schoolInfo.schoolName) || 'مشروع جدولك') + '.jdwl';

  if (supportsFileSystemAccess()) {
    let handle = currentFileHandle;
    if (forceAs || !handle) {
      try {
        handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{ description: 'ملفات جدولك', accept: { 'application/json': ['.jdwl'] } }],
        });
      } catch (err) {
        if (err.name === 'AbortError') return false; // المستخدم أغلق نافذة الحفظ بلا اختيار مكان
        toast(`تعذّر الحفظ: ${err.message || err}`, 'error');
        return false;
      }
    }
    try {
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (err) {
      toast(`تعذّر الحفظ: ${err.message || err}`, 'error');
      return false;
    }
    currentFileHandle = handle;
    currentProjectPath = handle.name;
  } else {
    downloadTextAsFile(content, suggestedName);
    currentProjectPath = suggestedName;
  }

  isDirty = false;
  updateDirtyIndicator();
  return true;
}

// يُحدِّث كلًا من المؤشّر المرئي داخل الصفحة نفسها وعنوان نافذة التطبيق (شريط العنوان المُحقَن عبر
// WebView2Injector) بحالة الحفظ الحالية معًا — نقطة استدعاء واحدة مشتركة، فلا حاجة لتذكّر تحديث الاثنين
// من كل موضع يُغيَّر فيه isDirty/currentProjectPath عبر الملف كله
function updateDirtyIndicator() {
  const el = document.getElementById('dirty-indicator');
  if (el) el.style.display = isDirty ? '' : 'none';
  updateWindowTitle();
}

// عنوان النافذة نفسه يعيش داخل DOM مغلق (shadow root بوضع "closed" في WebView2Injector.cs) — لا يمكن
// الوصول إليه مباشرة من هنا مهما حاولنا (document.getElementById('titlebar-container').shadowRoot يُرجع
// null دومًا لعمد، لعزل عناصر تحكّم النافذة عن أي تدخّل من محتوى الصفحة). المسار الوحيد لتغييره هو طلب من
// C# نفسه تنفيذ window.syncTitlebarText(...) بالنيابة عنا (دالة مكشوفة من نفس الإغلاق (closure) الذي أنشأ
// شريط العنوان أصلًا) — لذلك نرسل الأمر عبر postMessage عادي (بلا انتظار ردّ، بنفس أسلوب minimize/maximize
// الحالي)، لا عبر callBridge (التي تنتظر ردًا لن يصل أصلًا لهذا النوع من الرسائل)
function updateWindowTitle() {
  if (!isBridgeAvailable()) return; // خارج غلاف WebView2 (متصفح عادي وقت التطوير) — لا شريط عنوان مخصَّص لتحديثه أصلًا
  const fileName = currentProjectPath ? pathBasename(currentProjectPath) : 'مشروع جديد';
  const title = isDirty ? `${fileName} • (غير محفوظ) — Jadwalak` : `${fileName} — Jadwalak`;
  try {
    window.chrome.webview.postMessage({ windowAction: 'setTitle', title });
  } catch (e) { /* تحديث العنوان تحسين اختياري بحت — فشله لا يستحق أي إزعاج للمستخدم */ }
}

// نافذة "تغييرات غير محفوظة" — ثلاثية كما في Word: حفظ، تجاهل التغييرات، إلغاء. تُستدعى قبل أي فعل قد يُفقِد
// تعديلات غير محفوظة (فتح ملف آخر، العودة لقائمة الملفات الحديثة). تُرجع true إن كان يجوز المتابعة بالفعل
// الأصلي (سواء لأن المستخدم حفظ، أو اختار تجاهل التغييرات صراحةً، أو لأن لا شيء غير محفوظ أصلًا فلم تظهر
// النافذة إطلاقًا)، وfalse إن اختار الإلغاء (لا يُطبَّق الفعل الأصلي، يبقى كل شيء كما هو تمامًا)
let __unsavedChangesResolve = null;
function promptUnsavedChanges() {
  return new Promise((resolve) => {
    if (!isDirty) { resolve(true); return; }
    __unsavedChangesResolve = resolve;
    document.getElementById('unsaved-changes-modal').classList.add('show');
  });
}
function closeUnsavedChangesModal(result) {
  document.getElementById('unsaved-changes-modal').classList.remove('show');
  const resolve = __unsavedChangesResolve;
  __unsavedChangesResolve = null;
  if (resolve) resolve(result);
}

document.getElementById('btn-unsaved-save').addEventListener('click', async () => {
  // إن ألغى المستخدم نافذة "حفظ باسم" (لمشروع جديد لم يُحفَظ قط)، أو فشل الحفظ لأي سبب، لا نتابع الفعل
  // الأصلي إطلاقًا (فتح ملف آخر مثلًا) — نُبقي المستخدم في مكانه الآمن مع تعديلاته سليمة، لا نُخاطر بفقدها
  const saved = await saveState();
  if (!saved) return;
  closeUnsavedChangesModal(true);
});
document.getElementById('btn-unsaved-discard').addEventListener('click', () => closeUnsavedChangesModal(true));
document.getElementById('btn-unsaved-cancel').addEventListener('click', () => closeUnsavedChangesModal(false));
document.getElementById('btn-unsaved-close').addEventListener('click', () => closeUnsavedChangesModal(false));

document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.key !== 's') return;
  e.preventDefault();
  saveState().then((saved) => { if (saved) toast('تم الحفظ.', 'success'); });
});

function uid() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ── تنبيهات (Toast) ──────────────────────────────────────────
function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// ── مفاتيح مساعدة ────────────────────────────────────────────
function classKey(grade, section) { return grade + '___' + section; }
function subjectGradeKey(subject, grade) { return subject + '___' + grade; }

function getActiveClassList() {
  const list = [];
  state.grades.forEach(g => {
    state.sections.forEach(s => {
      const key = classKey(g, s);
      if (state.activeClasses[key]) list.push({ grade: g, section: s, key });
    });
  });
  return list;
}

// ═══════════════════════════════════════════════════════════════
// التنقل بين الخطوات
// ═══════════════════════════════════════════════════════════════
function goToStep(step) {
  currentStep = step;
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + step).classList.add('active');

  document.querySelectorAll('.step-item').forEach(item => {
    const n = parseInt(item.dataset.step, 10);
    item.classList.toggle('active', n === step);
    item.classList.toggle('done', n < step);
  });
  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('done', (i + 1) < step);
  });

  if (step === 2) renderGradeDayCapsMatrix(); // إعادة التوزيع/الأعمدة إن تغيّرت أيام الدوام من الخطوة الأولى
  if (step === 4) renderConstraintsStep();

  document.getElementById('btn-back').style.visibility = step === 1 ? 'hidden' : 'visible';
  document.getElementById('btn-next').textContent = step === 5 ? 'تم' : 'التالي';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('btn-back').addEventListener('click', () => {
  if (currentStep > 1) goToStep(currentStep - 1);
});
document.getElementById('btn-next').addEventListener('click', () => {
  if (currentStep < 5) goToStep(currentStep + 1);
});
document.querySelectorAll('.step-item').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => goToStep(parseInt(item.dataset.step, 10)));
});

// ── حفظ / حفظ باسم / فتح — الملف الفعلي هو مصدر الحقيقة الوحيد الآن، لا localStorage ─────────────────

document.getElementById('btn-save-project').addEventListener('click', async () => {
  const saved = await saveState();
  if (saved) toast('تم الحفظ.', 'success');
});

// "تصدير البيانات" أصبح ببساطة "حفظ باسم" (forceAs=true) — لم يعودا فعلين مختلفين بعد أن غدا الملف حقيقيًا
// (كانا فعلًا واحدًا يحمل اسمين فقط بسبب أن التصدير كان تنزيل متصفح، لا كتابة ملف فعلية على القرص)
document.getElementById('btn-export-data').addEventListener('click', async () => {
  const saved = await saveState(true);
  if (saved) toast('تم الحفظ بنجاح.', 'success');
});

// "استيراد البيانات" أصبح ببساطة "فتح ملف" — لم يعودا فعلين مختلفين بعد أن غدا بالإمكان اختيار أي ملف عبر
// نافذة نظام حقيقية (بدل حقل رفع HTML بلا مسار حقيقي)؛ التمييز الذي كان مهمًا فعلًا (استبدال المشروع الحالي
// مقابل فتحه في نسخة منفصلة) لا يزال قائمًا، لكنه الآن يُحسَم عبر تشغيل نسخة تطبيق ثانية بدل نافذة اختيار
// داخل نفس النسخة — فحص "تغييرات غير محفوظة" المعتاد يحمي المشروع الحالي دومًا قبل أي فتح جديد
document.getElementById('btn-import-data').addEventListener('click', openProjectViaDialog);

// "البدء من جديد" لم يعد يمسح أي بيانات — أصبح مجرّد تنقّل إلى شاشة قائمة الملفات الحديثة
document.getElementById('btn-reset-app').addEventListener('click', async () => {
  await showProjectListView();
});

// ═══════════════════════════════════════════════════════════════
// الخطوة ١ — أيام الدوام وعدد الحصص
// ═══════════════════════════════════════════════════════════════
function renderStep1() {
  const grid = document.getElementById('day-grid');
  grid.innerHTML = '';
  ALL_DAYS.forEach(day => {
    const checked = state.school.days.includes(day);
    const label = document.createElement('label');
    label.className = 'day-check' + (checked ? ' checked' : '');
    label.innerHTML = `<input type="checkbox" value="${day}" ${checked ? 'checked' : ''}/> <span>${day}</span>`;
    label.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!state.school.days.includes(day)) state.school.days.push(day);
      } else {
        state.school.days = state.school.days.filter(d => d !== day);
      }
      label.classList.toggle('checked', e.target.checked);
      markDirty();
    });
    grid.appendChild(label);
  });

  const maxInput = document.getElementById('max-periods-input');
  maxInput.value = state.school.maxPeriods;
  maxInput.oninput = () => {
    let v = parseInt(maxInput.value, 10);
    if (isNaN(v)) return;
    v = Math.max(1, Math.min(10, v));
    state.school.maxPeriods = v;
    markDirty();
  };

  // بيانات النموذج الرسمي (للتصدير فقط) — مجرد نصوص حرة، تُحفَظ مباشرة بلا أي تحقق أو أثر على التوليد
  const schoolInfoFields = [
    ['school-year-input', 'schoolYear'],
    ['directorate-name-input', 'directorateName'],
    ['school-name-input', 'schoolName'],
    ['city-name-input', 'cityName'],
    ['form-number-input', 'formNumber'],
  ];
  schoolInfoFields.forEach(([id, key]) => {
    const input = document.getElementById(id);
    input.value = state.schoolInfo[key] || '';
    input.oninput = () => {
      state.schoolInfo[key] = input.value;
      markDirty();
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// الخطوة ٢أ — مصفوفة الصفوف × الشعب
// ═══════════════════════════════════════════════════════════════
function renderGradesMatrix() {
  const table = document.getElementById('grades-matrix');
  table.innerHTML = '';

  if (state.grades.length === 0 || state.sections.length === 0) {
    table.innerHTML = `<tr><td style="padding:24px; color:var(--slate-light); text-align:center; border:none;">
      أضف صفًا وشعبة واحدة على الأقل للبدء.</td></tr>`;
    return;
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th class="col-first-header">الصف \\ الشعبة</th>`;
  state.sections.forEach((sec, si) => {
    const th = document.createElement('th');
    th.innerHTML = `<div class="col-head-cell">
        <input class="name-editable" style="text-align:center;" data-type="section" data-idx="${si}" value="${sec}" />
        <button class="btn-icon" data-action="delete-section" data-idx="${si}" title="حذف الشعبة">✕</button>
      </div>`;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  state.grades.forEach((grade, gi) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.innerHTML = `<div class="row-head-cell">
        <button class="btn-icon" data-action="delete-grade" data-idx="${gi}" title="حذف الصف">✕</button>
        <input class="name-editable" data-type="grade" data-idx="${gi}" value="${grade}" />
      </div>`;
    tr.appendChild(th);

    state.sections.forEach(sec => {
      const td = document.createElement('td');
      const key = classKey(grade, sec);
      const checked = !!state.activeClasses[key];
      td.innerHTML = `<input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''}/>`;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // مستمعو الأحداث
  table.querySelectorAll('input[type=checkbox][data-key]').forEach(cb => {
    cb.addEventListener('change', async () => {
      const key = cb.dataset.key;
      if (!cb.checked) {
        const broken = findFixedPlacementsBrokenByClassDeactivation(key);
        const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
        if (!proceed) { cb.checked = true; return; }
        if (broken.length > 0) renderFixedPlacementEditor();
      }
      state.activeClasses[key] = cb.checked;
      markDirty();
      renderTeacherList();
    });
  });
  table.querySelectorAll('input.name-editable').forEach(inp => {
    inp.addEventListener('change', () => renameEntity(inp.dataset.type, parseInt(inp.dataset.idx, 10), inp.value));
  });
  table.querySelectorAll('[data-action="delete-grade"]').forEach(btn => {
    btn.addEventListener('click', () => deleteGrade(parseInt(btn.dataset.idx, 10)));
  });
  table.querySelectorAll('[data-action="delete-section"]').forEach(btn => {
    btn.addEventListener('click', () => deleteSection(parseInt(btn.dataset.idx, 10)));
  });
}

// ═══════════════════════════════════════════════════════════════
// تحديث الأسماء داخل جدول مُولَّد مسبقًا بعد إعادة تسمية (مادة/معلم/صف/شعبة) — بلا حاجة لإعادة التوليد.
// محتوى الجدول نفسه (من يُدرِّس ماذا ومتى) لا يتغيّر إطلاقًا، فقط النص المعروض للاسم يُحدَّث أينما ظهر:
// خانات الجدول التفصيلي، القائمة الجانبية "الحصص غير المثبّتة"، وبالتبعية كل الجداول الستة عند إعادة رسمها
// (لأنها جميعًا تُحسَب من نفس tt.schedule/tt.activeClasses مباشرة عند كل استدعاء render).
// ═══════════════════════════════════════════════════════════════

function patchTimetableSubjectName(oldName, newName) {
  const tt = state.timetable;
  if (!tt || oldName === newName) return;
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (e && e.subject === oldName) e.subject = newName;
      });
    }
  });
  (tt.unpinned || []).forEach(u => { if (u.subject === oldName) u.subject = newName; });
}

// يطابق حسب معرّف المعلم الثابت (teacherId) لا الاسم القديم، لأنه لا يتغيّر عند إعادة التسمية
function patchTimetableTeacherName(teacherId, newName) {
  const tt = state.timetable;
  if (!tt) return;
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (e && e.teacherId === teacherId) e.teacher = newName;
      });
    }
  });
  (tt.unpinned || []).forEach(u => { if (u.teacherId === teacherId) u.teacher = newName; });
}

// يعيد بناء مفاتيح الشعب (classKey) داخل الجدول بعد تغيير اسم صف أو شعبة، عبر remapKey التي تُعيد المفتاح
// الجديد لمفتاح قديم معيّن (أو نفسه إن لم يتأثر) — تُستخدَم لكل من إعادة تسمية الصف والشعبة على حد سواء
function remapTimetableClassKeys(remapKey) {
  const tt = state.timetable;
  if (!tt) return;

  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const dayPeriodObj = tt.schedule[day][p];
      const newObj = {};
      Object.keys(dayPeriodObj).forEach(oldKey => { newObj[remapKey(oldKey)] = dayPeriodObj[oldKey]; });
      tt.schedule[day][p] = newObj;
    }
  });

  tt.activeClasses.forEach(c => {
    const newKey = remapKey(c.key);
    if (newKey !== c.key) {
      const [g, s] = newKey.split('___');
      c.key = newKey; c.grade = g; c.section = s;
    }
  });

  (tt.unpinned || []).forEach(u => { u.classKey = remapKey(u.classKey); });
}

function renameEntity(type, idx, newValue) {
  newValue = newValue.trim();
  if (!newValue) { renderGradesMatrix(); renderSubjectsMatrix(); return; }
  if (type === 'grade') {
    const oldName = state.grades[idx];
    if (oldName === newValue) return;
    if (state.grades.includes(newValue)) { toast('يوجد صف بهذا الاسم مسبقًا', 'error'); renderGradesMatrix(); return; }
    state.grades[idx] = newValue;

    // تحديث مفاتيح المواد وحصصها
    const newSubjectPeriods = {};
    Object.keys(state.subjectPeriods).forEach(k => {
      const [subj, g] = k.split('___');
      newSubjectPeriods[subjectGradeKey(subj, g === oldName ? newValue : g)] = state.subjectPeriods[k];
    });
    state.subjectPeriods = newSubjectPeriods;

    // تحديث المفاتيح والمهام المرتبطة
    const newActive = {};
    Object.keys(state.activeClasses).forEach(k => {
      const [g, s] = k.split('___');
      newActive[classKey(g === oldName ? newValue : g, s)] = state.activeClasses[k];
    });
    state.activeClasses = newActive;
    state.teachers.forEach(t => t.assignments.forEach(a => { if (a.grade === oldName) a.grade = newValue; }));

    // تحديث مفتاح الحدود اليومية للصف (الخطوة الثانية) للحفاظ على القيم المخصَّصة يدويًا بدل فقدانها
    if (state.gradeDayCaps[oldName]) {
      state.gradeDayCaps[newValue] = state.gradeDayCaps[oldName];
      delete state.gradeDayCaps[oldName];
    }

    // تحديث إشارات الصف داخل قيود الخطوة الرابعة (كانت تُفقَد صامتًا سابقًا عند إعادة تسمية صف له حصص
    // مثبّتة أو مادة مجمّعة مضبوطة له تحديدًا — الحصة المثبّتة كانت تبقى مربوطة باسم الصف القديم فتصبح
    // بلا أثر فعليًا دون أي تنبيه للمستخدم)
    (state.constraints.fixedPlacements || []).forEach(f => {
      const [g, s] = f.classKey.split('___');
      if (g === oldName) f.classKey = classKey(newValue, s);
    });
    (state.constraints.subjectGrouping || []).forEach(g => { if (g.grade === oldName) g.grade = newValue; });

    // تحديث الجدول المولَّد مسبقًا (إن وُجد) بمفاتيح الصف الجديدة، دون الحاجة لإعادة التوليد
    remapTimetableClassKeys(oldKey => {
      const [g, s] = oldKey.split('___');
      return g === oldName ? classKey(newValue, s) : oldKey;
    });
  } else if (type === 'section') {
    const oldName = state.sections[idx];
    if (oldName === newValue) return;
    if (state.sections.includes(newValue)) { toast('توجد شعبة بهذا الاسم مسبقًا', 'error'); renderGradesMatrix(); return; }
    state.sections[idx] = newValue;
    const newActive = {};
    Object.keys(state.activeClasses).forEach(k => {
      const [g, s] = k.split('___');
      newActive[classKey(g, s === oldName ? newValue : s)] = state.activeClasses[k];
    });
    state.activeClasses = newActive;
    state.teachers.forEach(t => t.assignments.forEach(a => { if (a.section === oldName) a.section = newValue; }));

    // نفس الإصلاح أعلاه، لكن لإشارات الشعبة داخل classKey الحصص المثبّتة
    (state.constraints.fixedPlacements || []).forEach(f => {
      const [g, s] = f.classKey.split('___');
      if (s === oldName) f.classKey = classKey(g, newValue);
    });

    // تحديث الجدول المولَّد مسبقًا (إن وُجد) بمفاتيح الشعبة الجديدة، دون الحاجة لإعادة التوليد
    remapTimetableClassKeys(oldKey => {
      const [g, s] = oldKey.split('___');
      return s === oldName ? classKey(g, newValue) : oldKey;
    });
  } else if (type === 'subject') {
    const oldName = state.subjects[idx];
    if (oldName === newValue) return;
    if (state.subjects.includes(newValue)) { toast('توجد مادة بهذا الاسم مسبقًا', 'error'); renderSubjectsMatrix(); return; }
    state.subjects[idx] = newValue;

    const newSubjectPeriods = {};
    Object.keys(state.subjectPeriods).forEach(k => {
      const [subj, g] = k.split('___');
      newSubjectPeriods[subjectGradeKey(subj === oldName ? newValue : subj, g)] = state.subjectPeriods[k];
    });
    state.subjectPeriods = newSubjectPeriods;

    state.teachers.forEach(t => t.assignments.forEach(a => { if (a.subject === oldName) a.subject = newValue; }));
    (state.constraints.subjectGrouping || []).forEach(g => { if (g.subject === oldName) g.subject = newValue; });
    (state.constraints.fixedPlacements || []).forEach(f => { if (f.subject === oldName) f.subject = newValue; });

    // تحديث الجدول المولَّد مسبقًا (إن وُجد) باسم المادة الجديد، دون الحاجة لإعادة التوليد
    patchTimetableSubjectName(oldName, newValue);
  }
  markDirty();
  renderGradesMatrix();
  renderSubjectsMatrix();
  renderGradeDayCapsMatrix();
  renderTeacherList();
  if (state.timetable) renderTimetableOutput();
}

async function deleteGrade(idx) {
  const grade = state.grades[idx];
  if (!confirm(`حذف الصف "${grade}"؟ سيتم حذف كل ما يرتبط به من شعب مفعّلة وحصص للمعلمين.`)) return;

  const broken = findFixedPlacementsBrokenByGradeDeletion(grade);
  const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
  if (!proceed) return;

  state.grades.splice(idx, 1);
  Object.keys(state.activeClasses).forEach(k => { if (k.startsWith(grade + '___')) delete state.activeClasses[k]; });
  Object.keys(state.subjectPeriods).forEach(k => { if (k.endsWith('___' + grade)) delete state.subjectPeriods[k]; });
  state.teachers.forEach(t => { t.assignments = t.assignments.filter(a => a.grade !== grade); });
  delete state.gradeDayCaps[grade];
  markDirty();
  renderGradesMatrix();
  renderSubjectsMatrix();
  renderGradeDayCapsMatrix();
  renderTeacherList();
  if (broken.length > 0) renderFixedPlacementEditor();
  toast('تم حذف الصف', 'success');
}

async function deleteSection(idx) {
  const sec = state.sections[idx];
  if (!confirm(`حذف الشعبة "${sec}"؟ سيتم حذف كل ما يرتبط بها من صفوف مفعّلة وحصص للمعلمين.`)) return;

  const broken = findFixedPlacementsBrokenBySectionDeletion(sec);
  const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
  if (!proceed) return;

  state.sections.splice(idx, 1);
  Object.keys(state.activeClasses).forEach(k => { if (k.endsWith('___' + sec)) delete state.activeClasses[k]; });
  state.teachers.forEach(t => { t.assignments = t.assignments.filter(a => a.section !== sec); });
  markDirty();
  renderGradesMatrix();
  renderTeacherList();
  if (broken.length > 0) renderFixedPlacementEditor();
  toast('تم حذف الشعبة', 'success');
}

document.getElementById('btn-check-all-grades').addEventListener('click', () => {
  state.grades.forEach(g => state.sections.forEach(s => { state.activeClasses[classKey(g, s)] = true; }));
  markDirty();
  renderGradesMatrix();
  renderTeacherList();
});
document.getElementById('btn-uncheck-all-grades').addEventListener('click', () => {
  state.grades.forEach(g => state.sections.forEach(s => { state.activeClasses[classKey(g, s)] = false; }));
  markDirty();
  renderGradesMatrix();
  renderTeacherList();
});

document.getElementById('btn-add-grade').addEventListener('click', () => {
  let n = state.grades.length + 1;
  let name = `الصف ${toArabicOrdinalNumber(n)}`;
  while (state.grades.includes(name)) { n++; name = `الصف ${toArabicOrdinalNumber(name)}`; }
  state.grades.push(name);
  markDirty();
  renderGradesMatrix();
  renderSubjectsMatrix();
  renderGradeDayCapsMatrix();
  renderTeacherList();
});

document.getElementById('btn-add-section').addEventListener('click', () => {
  const letters = [
    'أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي', 
    'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر', 
    'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'
  ];
  let n = state.sections.length;
  let name = `شعبة ${letters[n] || (n + 1)}`;
  while (state.sections.includes(name)) { n++; name = `شعبة ${letters[n] || (n + 1)}`; }
  state.sections.push(name);
  markDirty();
  renderGradesMatrix();
});

function toArabicOrdinalNumber(n) {
  const names = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
    'الحادي عشر', 'الثاني عشر'];
  return names[n - 1] || ('#' + n);
}

// ═══════════════════════════════════════════════════════════════
// الخطوة ٢ب — المواد الدراسية (مصفوفة المواد × الصفوف)
// ═══════════════════════════════════════════════════════════════
function renderSubjectsMatrix() {
  const table = document.getElementById('subjects-matrix');
  table.innerHTML = '';

  if (state.subjects.length === 0 || state.grades.length === 0) {
    table.innerHTML = `<tr><td style="padding:24px; color:var(--slate-light); text-align:center; border:none;">
      أضف مادة وصفًا واحدًا على الأقل لعرض مصفوفة الحصص.</td></tr>`;
    return;
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th class="col-first-header">المادة \\ الصف</th>`;
  state.grades.forEach(grade => {
    headRow.innerHTML += `<th>${grade}</th>`;
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  state.subjects.forEach((subj, si) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.innerHTML = `<div class="row-head-cell">
        <button class="btn-icon" data-action="delete-subject" data-idx="${si}" title="حذف المادة">✕</button>
        <input class="name-editable" data-type="subject" data-idx="${si}" value="${subj}" />
      </div>`;
    tr.appendChild(th);

    state.grades.forEach(grade => {
      const td = document.createElement('td');
      const key = subjectGradeKey(subj, grade);
      const val = state.subjectPeriods[key] !== undefined ? state.subjectPeriods[key] : 0;
      td.innerHTML = `<input type="number" class="subject-period-input" min="0" max="40" data-key="${key}" value="${val}" />`;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // مستمعو الأحداث مع تحديث فوري لكروت المعلمين
  table.querySelectorAll('input.subject-period-input').forEach(inp => {
    // القيمة قبل بدء هذا التعديل تحديدًا — تُلتقَط عند "focus" (بداية تعديل جديد)، لا تُحسَب من داخل
    // "change" نفسها (بحلول ذلك الوقت تكون "input" قد كتبت فوق القيمة القديمة بالفعل فلا سبيل لاستعادتها)
    let valueBeforeEdit = state.subjectPeriods[inp.dataset.key] || 0;
    inp.addEventListener('focus', () => {
      valueBeforeEdit = state.subjectPeriods[inp.dataset.key] || 0;
    });
    inp.addEventListener('input', () => {
      let v = parseInt(inp.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      state.subjectPeriods[inp.dataset.key] = v;
      markDirty();
      renderTeacherList(); // تحديث فوري لكروت المعلمين بدون إعادة تحميل الصفحة
      renderGradeDayCapsMatrix(); // تحديث عمود "الإجمالي المطلوب" في جدول الحدود اليومية أدناه
    });
    // "change" لا "input": تُطلَق مرة واحدة فقط عند اكتمال التعديل فعليًا (فقدان التركيز أو Enter)، لا مع كل
    // ضغطة زر — فحص "هل أصبحت القيمة صفرًا" يحدث هنا تحديدًا لهذا السبب: تفريغ الحقل عمدًا لكتابة رقم جديد
    // (إجراء تحرير طبيعي تمامًا) يمرّ بصفر لحظيًا أثناء الكتابة عبر "input" — ربط الفحص بها كان سيُطلق نافذة
    // تأكيد مزعجة منتصف الكتابة لكل تعديل عادي، لا فقط عند تصفير العدد فعليًا وعن قصد
    inp.addEventListener('change', async () => {
      const key = inp.dataset.key;
      const finalValue = state.subjectPeriods[key] || 0;
      if (finalValue !== 0 || valueBeforeEdit === 0) return; // لا انتقال فعلي من غير صفر إلى صفر — لا شيء يستحق الفحص
      const [subj, grade] = key.split('___');
      const proceed = await confirmAndCleanupZeroedSubjectGrade(subj, grade);
      if (!proceed) {
        state.subjectPeriods[key] = valueBeforeEdit;
        inp.value = valueBeforeEdit;
        markDirty();
        renderTeacherList();
        renderGradeDayCapsMatrix();
      } else {
        renderTeacherList(); // تعيينات معلمين قد تكون أُزيلت فعليًا الآن
      }
    });
  });

  table.querySelectorAll('[data-action="delete-subject"]').forEach(btn => {
    btn.addEventListener('click', () => deleteSubject(parseInt(btn.dataset.idx, 10)));
  });
  table.querySelectorAll('input.name-editable').forEach(inp => {
    inp.addEventListener('change', () => renameEntity(inp.dataset.type, parseInt(inp.dataset.idx, 10), inp.value));
  });
}

document.getElementById('btn-add-subject').addEventListener('click', addSubjectFromInput);
document.getElementById('subject-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addSubjectFromInput(); }
});

function addSubjectFromInput() {
  const input = document.getElementById('subject-input');
  const name = input.value.trim();
  if (!name) return;
  if (state.subjects.includes(name)) { toast('هذه المادة مضافة مسبقًا', 'error'); return; }
  state.subjects.push(name);
  input.value = '';
  markDirty();
  renderSubjectsMatrix();
  renderTeacherList();
}

async function deleteSubject(idx) {
  const subj = state.subjects[idx];
  if (!confirm(`حذف مادة "${subj}"؟ سيتم حذف كل الحصص المخصصة لها.`)) return;

  const broken = findFixedPlacementsBrokenBySubjectDeletion(subj);
  const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
  if (!proceed) return;

  state.subjects.splice(idx, 1);
  Object.keys(state.subjectPeriods).forEach(k => { if (k.startsWith(subj + '___')) delete state.subjectPeriods[k]; });
  state.teachers.forEach(t => { t.assignments = t.assignments.filter(a => a.subject !== subj); });
  markDirty();
  renderSubjectsMatrix();
  renderTeacherList();
  if (broken.length > 0) renderFixedPlacementEditor();
  toast('تم حذف المادة', 'success');
}

// ═══════════════════════════════════════════════════════════════
// الخطوة ٢ج — الحد الأقصى اليومي للحصص لكل صف
// ═══════════════════════════════════════════════════════════════
// مصفوفة (صف × يوم) تحدّد كم حصة كحد أقصى يجوز جدولتها لهذا الصف تحديدًا في هذا اليوم تحديدًا،
// بمعزل عن "الحد الأقصى لعدد الحصص في اليوم" العام في الخطوة الأولى (والذي يبقى هو حجم الشبكة الفعلي/السقف
// المطلق). القيم هنا قيد اختياري إضافي *ضمن* تلك الشبكة، يُطبَّق كقيد صارم أثناء التوليد (انظر generateTimetable).

// إجمالي الحصص الأسبوعية المطلوبة لصف معيّن، بجمع كل قيم "المواد الدراسية وقيم الحصص" الخاصة به (بصرف النظر
// عن تعيين المعلمين، لأن هذا الجدول يظهر في خطوة سابقة قبل تعيين المعلمين في الخطوة الثالثة)
function subjectTotalForGrade(grade) {
  return state.subjects.reduce((sum, subj) => sum + (state.subjectPeriods[subjectGradeKey(subj, grade)] || 0), 0);
}

// التوزيع الافتراضي المقترح: القسمة الصحيحة على عدد الأيام، والباقي يُوزَّع حصة إضافية واحدة لكل يوم
// بدءًا من أول أيام الدوام بالترتيب (مثال: ٣١ حصة على ٥ أيام = ٦ حصص لكل يوم + حصة إضافية لليوم الأول)
function computeDefaultDayCaps(grade) {
  const days = state.school.days;
  const result = {};
  if (days.length === 0) return result;
  const total = subjectTotalForGrade(grade);
  const base = Math.floor(total / days.length);
  const remainder = total - base * days.length;
  days.forEach((day, idx) => { result[day] = base + (idx < remainder ? 1 : 0); });
  return result;
}

// يُرجع الحد الأقصى الفعّال ليوم/صف معيّن: القيمة المخصّصة إن وُجدت، وإلا السقف العام لعدد الحصص في اليوم
// (بمعنى: صف بلا أي تخصيص لا يخضع لأي قيد إضافي عدا السقف العام نفسه)
function getGradeDayCap(grade, day) {
  const caps = state.gradeDayCaps && state.gradeDayCaps[grade];
  if (caps && caps[day] !== undefined && caps[day] !== null) return caps[day];
  return state.school.maxPeriods;
}

// يضمن أن state.gradeDayCaps يحوي صفًا لكل صف حالي وعمودًا لكل يوم دوام حالي، دون محو أي قيمة عدّلها
// المستخدم يدويًا من قبل — الصفوف الجديدة فقط تُملأ بالتوزيع الافتراضي المقترح
function syncGradeDayCaps() {
  state.grades.forEach(grade => {
    if (!state.gradeDayCaps[grade]) {
      state.gradeDayCaps[grade] = computeDefaultDayCaps(grade);
    } else {
      state.school.days.forEach(day => {
        if (state.gradeDayCaps[grade][day] === undefined) state.gradeDayCaps[grade][day] = 0;
      });
      Object.keys(state.gradeDayCaps[grade]).forEach(day => {
        if (!state.school.days.includes(day)) delete state.gradeDayCaps[grade][day];
      });
    }
  });
  Object.keys(state.gradeDayCaps).forEach(grade => {
    if (!state.grades.includes(grade)) delete state.gradeDayCaps[grade];
  });
}

function renderGradeDayCapsMatrix() {
  syncGradeDayCaps();
  const table = document.getElementById('grade-day-caps-matrix');
  table.innerHTML = '';

  if (state.grades.length === 0 || state.school.days.length === 0) {
    table.innerHTML = `<tr><td style="padding:24px; color:var(--slate-light); text-align:center; border:none;">
      أضف صفًا واحدًا على الأقل، وحدّد يوم دوام واحدًا على الأقل في الخطوة الأولى.</td></tr>`;
    return;
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th class="col-first-header">الصف</th>`;
  state.school.days.forEach(day => { headRow.innerHTML += `<th>${day}</th>`; });
  headRow.innerHTML += `<th>الإجمالي المستخدم / المطلوب</th>`;
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  state.grades.forEach(grade => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.innerHTML = `<div class="row-head-cell">
        <button class="btn-icon-reset" data-action="reset-grade-day-caps" data-grade="${grade}" title="إعادة التوزيع الافتراضي لهذا الصف">↺</button>
        <span style="text-align: inherit; width:100%;">${grade}</span>
      </div>`;
    tr.appendChild(th);

    state.school.days.forEach(day => {
      const td = document.createElement('td');
      const val = state.gradeDayCaps[grade][day] || 0;
      td.innerHTML = `<input type="number" class="subject-period-input day-cap-input" min="0" max="${state.school.maxPeriods}" data-grade="${grade}" data-day="${day}" value="${val}" />`;
      tr.appendChild(td);
    });

    const required = subjectTotalForGrade(grade);
    const used = state.school.days.reduce((s, d) => s + (state.gradeDayCaps[grade][d] || 0), 0);
    const ok = used === required;
    const totalTd = document.createElement('td');
    totalTd.innerHTML = `<span class="cap-total-badge ${ok ? 'ok' : 'mismatch'}">${used} / ${required}</span>`;
    tr.appendChild(totalTd);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // تحديث فوري بدون إعادة بناء الجدول كاملًا (لتفادي فقدان تركيز الكتابة)، مع تحديث شارة الإجمالي لهذا الصف فقط
  table.querySelectorAll('input.day-cap-input').forEach(inp => {
    inp.addEventListener('input', () => {
      let v = parseInt(inp.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      if (v > state.school.maxPeriods) v = state.school.maxPeriods;
      state.gradeDayCaps[inp.dataset.grade][inp.dataset.day] = v;
      markDirty();

      const grade = inp.dataset.grade;
      const required = subjectTotalForGrade(grade);
      const used = state.school.days.reduce((s, d) => s + (state.gradeDayCaps[grade][d] || 0), 0);
      const badge = inp.closest('tr').querySelector('.cap-total-badge');
      badge.textContent = `${used} / ${required}`;
      badge.classList.toggle('ok', used === required);
      badge.classList.toggle('mismatch', used !== required);
    });
  });

  table.querySelectorAll('[data-action="reset-grade-day-caps"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const grade = btn.dataset.grade;
      state.gradeDayCaps[grade] = computeDefaultDayCaps(grade);
      markDirty();
      renderGradeDayCapsMatrix();
      toast(`تمت إعادة التوزيع الافتراضي لحصص "${grade}" اليومية.`, 'success');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// الخطوة ٣ — المعلمون
// ═══════════════════════════════════════════════════════════════
let teacherSearchQuery = '';

function renderTeacherList() {
  const grid = document.getElementById('teacher-grid');
  const empty = document.getElementById('teacher-empty');
  const searchEmpty = document.getElementById('teacher-search-empty');
  grid.innerHTML = '';

  if (state.teachers.length === 0) {
    empty.classList.add('show');
    searchEmpty.classList.remove('show');
    return;
  }
  empty.classList.remove('show');

  const query = teacherSearchQuery.trim().toLowerCase();
  const filteredTeachers = query
    ? state.teachers.filter(t =>
        (t.name || '').toLowerCase().includes(query) ||
        t.assignments.some(a => (a.subject || '').toLowerCase().includes(query))
      )
    : state.teachers;

  if (filteredTeachers.length === 0) {
    searchEmpty.classList.add('show');
    return;
  }
  searchEmpty.classList.remove('show');

  filteredTeachers.forEach(teacher => {
    const activeKeys = new Set(getActiveClassList().map(c => c.key));
    const valid = teacher.assignments.filter(a => activeKeys.has(classKey(a.grade, a.section)) && state.subjects.includes(a.subject));
    const totalPeriods = valid.reduce((sum, a) => {
      const periods = state.subjectPeriods[subjectGradeKey(a.subject, a.grade)] || 0;
      return sum + periods;
    }, 0);
    const subjectCount = new Set(valid.map(a => a.subject)).size;
    const classCount = new Set(valid.map(a => classKey(a.grade, a.section))).size;

    const card = document.createElement('div');
    card.className = 'teacher-card';
    card.innerHTML = `
      <h4>${teacher.name || 'بدون اسم'}</h4>
      <p class="load-summary">${
        totalPeriods > 0
          ? `<span class="badge badge-green">${totalPeriods} حصة أسبوعيًا</span> · ${subjectCount} مادة · ${classCount} شعبة`
          : 'لا توجد حصص مخصصة بعد'
      }</p>
      <div class="teacher-card-actions">
        <button class="btn-secondary" data-action="edit">تعديل</button>
        <button class="btn-danger" data-action="delete">حذف</button>
      </div>`;
    card.querySelector('[data-action="edit"]').addEventListener('click', () => openTeacherModal(teacher.id));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTeacher(teacher.id));
    grid.appendChild(card);
  });
}

async function deleteTeacher(id) {
  const teacher = state.teachers.find(t => t.id === id);
  if (!teacher) return;
  if (!confirm(`حذف المعلم "${teacher.name}"؟`)) return;

  const broken = findFixedPlacementsBrokenByAssignmentRemoval(id, teacher.assignments);
  const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
  if (!proceed) return;

  state.teachers = state.teachers.filter(t => t.id !== id);
  markDirty();
  renderTeacherList();
  if (broken.length > 0) renderFixedPlacementEditor();
  toast('تم حذف المعلم', 'success');
}

document.getElementById('btn-add-teacher').addEventListener('click', () => openTeacherModal(null));
document.getElementById('teacher-search-input').addEventListener('input', (e) => {
  teacherSearchQuery = e.target.value;
  renderTeacherList();
});

// ── نافذة إعداد المعلم ──────────────────────────────────────
function openTeacherModal(teacherId) {
  if (state.subjects.length === 0) {
    document.getElementById('no-subjects-hint').style.display = 'block';
  } else {
    document.getElementById('no-subjects-hint').style.display = 'none';
  }

  modalState.editingId = teacherId;
  modalState.assignMap = {};

  if (teacherId) {
    const teacher = state.teachers.find(t => t.id === teacherId);
    modalState.name = teacher ? teacher.name : '';
    document.getElementById('modal-title').textContent = 'تعديل معلم';
    if (teacher) {
      teacher.assignments.forEach(a => {
        modalState.assignMap[a.subject + '|' + a.grade + '|' + a.section] = { checked: true };
      });
    }
  } else {
    modalState.name = '';
    document.getElementById('modal-title').textContent = 'إضافة معلم';
  }

  document.getElementById('teacher-name-input').value = modalState.name;
  // الافتراضي: أول مادة (بترتيب ظهورها في التبويبات) لهذا المعلم فعلًا حصص مخصَّصة لها، لا أول مادة في
  // القائمة عمومًا — هكذا تفتح النافذة مباشرة على ما يُدرِّسه المعلم بالفعل بدل تبويب قد يكون فارغًا له
  const firstAssignedSubject = state.subjects.find(subj => subjectHasAnyAssignment(subj));
  modalState.activeSubject = firstAssignedSubject || state.subjects[0] || null;

  renderSubjectTabs();
  renderAssignMatrix();

  document.getElementById('teacher-modal').classList.add('show');
}

function closeTeacherModal() {
  document.getElementById('teacher-modal').classList.remove('show');
}

document.getElementById('btn-modal-close').addEventListener('click', closeTeacherModal);
document.getElementById('btn-cancel-teacher').addEventListener('click', closeTeacherModal);
document.getElementById('teacher-modal').addEventListener('click', (e) => {
  if (e.target.id === 'teacher-modal') closeTeacherModal();
});
document.getElementById('teacher-name-input').addEventListener('input', (e) => {
  modalState.name = e.target.value;
});

function subjectHasAnyAssignment(subj) {
  return Object.keys(modalState.assignMap).some(k => k.startsWith(subj + '|') && modalState.assignMap[k].checked);
}

function renderSubjectTabs() {
  const bar = document.getElementById('subject-tab-bar');
  bar.innerHTML = '';
  state.subjects.forEach(subj => {
    const btn = document.createElement('button');
    btn.className = 'subject-tab' + (subj === modalState.activeSubject ? ' active' : '') + (subjectHasAnyAssignment(subj) ? ' has-assignments' : '');
    btn.textContent = subj;
    btn.addEventListener('click', () => {
      modalState.activeSubject = subj;
      renderSubjectTabs();
      renderAssignMatrix();
    });
    bar.appendChild(btn);
  });
}

// يُرجع المعلم الآخر (غير المعلم الجاري تعديله حاليًا) الذي أُسندت له هذه المادة لهذا الصف/الشعبة تحديدًا
// بالفعل، إن وُجد — تُستخدَم لمنع إسناد نفس المادة لنفس الشعبة لمعلمين مختلفين من الأساس
function findConflictingTeacher(subject, grade, section) {
  const editingId = modalState.editingId;
  return state.teachers.find(t =>
    t.id !== editingId &&
    t.assignments.some(a => a.subject === subject && a.grade === grade && a.section === section)
  ) || null;
}

function renderAssignMatrix() {
  const table = document.getElementById('assign-matrix');
  table.innerHTML = '';
  const subject = modalState.activeSubject;

  if (!subject || state.grades.length === 0 || state.sections.length === 0) {
    table.innerHTML = `<tr><td style="padding:20px; text-align:center; color:var(--slate-light); border:none;">
      لا توجد بيانات كافية بعد (تحقق من المواد والصفوف والشعب في الخطوة الثانية).</td></tr>`;
    return;
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th class="col-first-header">الصف \\ الشعبة</th>`;
  state.sections.forEach(sec => headRow.innerHTML += `<th>${sec}</th>`);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  state.grades.forEach(grade => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${grade}</th>`;
    const periods = state.subjectPeriods[subjectGradeKey(subject, grade)] || 0; // مرة واحدة لكل صف، لا لكل شعبة — العدد مقرَّر على مستوى الصف لا الشعبة
    state.sections.forEach(sec => {
      const key = classKey(grade, sec);
      const isActiveClass = !!state.activeClasses[key];
      const mapKey = subject + '|' + grade + '|' + sec;
      const entry = modalState.assignMap[mapKey] || { checked: false };
      const td = document.createElement('td');
      if (!isActiveClass) {
        td.className = 'inactive-cell';
        td.innerHTML = `<span style="font-size:11px;">غير مفعّلة</span>`;
      } else if (periods === 0) {
        td.className = 'inactive-cell';
        td.innerHTML = `<span style="font-size:11px;" title="لا يوجد عدد حصص مقرَّر لمادة &quot;${subject}&quot; في صف &quot;${grade}&quot; (الخطوة الثانية) — لا يمكن إسناد معلم لتدريس مادة بلا حصص مقرَّرة لها">لا حصص</span>`;
      } else {
        const conflictTeacher = findConflictingTeacher(subject, grade, sec);
        if (conflictTeacher) {
          td.className = 'inactive-cell';
          td.innerHTML = `<span style="font-size:11px;" title="هذه المادة مُسندة بالفعل لهذا المعلم لهذه الشعبة — لا يمكن إسنادها لمعلم آخر">${conflictTeacher.name}</span>`;
        } else {
          td.innerHTML = `
            <div class="assign-cell">
              <input type="checkbox" data-map="${mapKey}" ${entry.checked ? 'checked' : ''}/>
            </div>`;
        }
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  table.querySelectorAll('input[type=checkbox][data-map]').forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.map;
      modalState.assignMap[key] = { checked: cb.checked };
      renderSubjectTabs(); // تحديث فوري لنقطة التبويب الملوَّنة مع كل تبديل
    });
  });
}

document.getElementById('btn-check-all-assign').addEventListener('click', () => {
  const subject = modalState.activeSubject;
  if (!subject) return;
  state.grades.forEach(grade => {
    if ((state.subjectPeriods[subjectGradeKey(subject, grade)] || 0) === 0) return; // لا حصص مقرَّرة لهذه المادة لهذا الصف — نفس شرط تعطيل الخانة الفردية تمامًا
    state.sections.forEach(sec => {
      const key = classKey(grade, sec);
      if (!state.activeClasses[key]) return; // لا نُحدّد شعبًا غير مفعّلة
      if (findConflictingTeacher(subject, grade, sec)) return; // ولا شعبة مُسندة بالفعل لمعلم آخر لهذه المادة
      modalState.assignMap[subject + '|' + grade + '|' + sec] = { checked: true };
    });
  });
  renderAssignMatrix();
  renderSubjectTabs();
});
document.getElementById('btn-uncheck-all-assign').addEventListener('click', () => {
  const subject = modalState.activeSubject;
  if (!subject) return;
  state.grades.forEach(grade => {
    state.sections.forEach(sec => {
      modalState.assignMap[subject + '|' + grade + '|' + sec] = { checked: false };
    });
  });
  renderAssignMatrix();
  renderSubjectTabs();
});

document.getElementById('btn-save-teacher').addEventListener('click', async () => {
  const name = document.getElementById('teacher-name-input').value.trim();
  if (!name) { toast('الرجاء إدخال اسم المعلم', 'error'); return; }

  const assignments = [];
  Object.keys(modalState.assignMap).forEach(mapKey => {
    const entry = modalState.assignMap[mapKey];
    if (!entry.checked) return;
    const [subject, grade, section] = mapKey.split('|');
    assignments.push({ subject, grade, section });
  });

  let broken = [];
  if (modalState.editingId) {
    const teacher = state.teachers.find(t => t.id === modalState.editingId);
    if (teacher) {
      // اكتشف أي تعيينات أُزيلت (كانت مُسنَدة سابقًا ولم تعد ضمن التعيينات الجديدة) قبل تطبيق أي شيء فعليًا،
      // كي تُعرَض نافذة التأكيد (إن لزم) قبل حفظ التعديل لا بعده — يبقى بإمكان المستخدم التراجع كليًا
      const removedAssignments = teacher.assignments.filter(oldA =>
        !assignments.some(newA => newA.subject === oldA.subject && newA.grade === oldA.grade && newA.section === oldA.section)
      );
      broken = findFixedPlacementsBrokenByAssignmentRemoval(teacher.id, removedAssignments);
      const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
      if (!proceed) return; // لا نُغلق النافذة ولا نُطبِّق أي تغيير — يبقى المستخدم في نافذة التعديل بحرية إعادة المحاولة

      teacher.name = name;
      teacher.assignments = assignments;
      // تحديث الجدول المولَّد مسبقًا (إن وُجد) باسم المعلم الجديد أينما ظهر، دون الحاجة لإعادة التوليد.
      // ملاحظة: هذا يحدّث الاسم المعروض فقط — إن غيّر المستخدم تعييناته (المواد/الشعب) في هذه النافذة
      // أيضًا، يبقى محتوى الجدول القائم كما هو حتى إعادة التوليد، تمامًا كأي تعديل آخر على القيود
      patchTimetableTeacherName(teacher.id, name);
    }
  } else {
    state.teachers.push({ id: uid(), name, assignments });
  }

  markDirty();
  renderTeacherList();
  if (state.timetable) renderTimetableOutput();
  if (broken.length > 0) renderFixedPlacementEditor();
  closeTeacherModal();
  toast('تم حفظ بيانات المعلم', 'success');
});

// ═══════════════════════════════════════════════════════════════
// الخطوة ٤ — الشروط والقيود
// ═══════════════════════════════════════════════════════════════
function renderConstraintsStep() {
  renderTeacherBlockSection();
  renderSubjectGroupingSection();
  renderFixedPlacementEditor();
}

// ملاحظة: قسم "توازن حصص فترة معينة بين المعلمين" أُزيل من هنا — توازن أرقام الحصص والحمل اليومي لكل
// معلم بات افتراضيًا وتلقائيًا في كل توليد (عبر CP-SAT)، بلا حاجة لأي إعداد يدوي. تبقى
// state.constraints.balancedPeriods في شكل الحالة فقط لتوافق الملفات المحفوظة قديمًا (تُقرأ ولا يُعتَد
// بها في التوليد بعد الآن)، ولا واجهة لتعديلها.

// ── ٢) أوقات ممنوعة لمعلم محدد ───────────────────────────────
// ── ١) أوقات ممنوعة لمعلم محدد ────────────────────────────────
// مصفوفة (معلم × يوم × حصة) — يُضاف صف لكل معلم عبر زر "+ إضافة"، وتُعرَض تلقائيًا كل الصفوف التي لها
// أوقات ممنوعة فعلًا حتى إن لم تُضَف صراحةً هذه الجلسة (توافقًا مع بيانات محفوظة سابقًا)
function getShownBlockTeacherIds() {
  const ids = new Set((state.constraints.teacherBlockRows || []).filter(id => state.teachers.some(t => t.id === id)));
  (state.constraints.teacherBlocks || []).forEach(b => { if (state.teachers.some(t => t.id === b.teacherId)) ids.add(b.teacherId); });
  return ids;
}

function renderTeacherBlockSection() {
  const teacherSelect = document.getElementById('block-teacher-select');
  const shownIds = getShownBlockTeacherIds();
  const available = state.teachers.filter(t => !shownIds.has(t.id));

  teacherSelect.innerHTML = '';
  available.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name || 'بدون اسم';
    teacherSelect.appendChild(opt);
  });
  const noOptions = available.length === 0;
  teacherSelect.disabled = noOptions;
  document.getElementById('btn-add-teacher-block').disabled = noOptions;

  renderTeacherBlockMatrix();
}

function renderTeacherBlockMatrix() {
  const table = document.getElementById('teacher-block-matrix');
  const empty = document.getElementById('teacher-block-empty');
  const days = state.school.days;
  const maxP = state.school.maxPeriods;

  const teachers = [...getShownBlockTeacherIds()]
    .map(id => state.teachers.find(t => t.id === id))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  table.innerHTML = '';
  if (teachers.length === 0 || days.length === 0) {
    empty.classList.add('show');
    return;
  }
  empty.classList.remove('show');

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th class="col-first-header">المعلم</th><th class="tt-period-col">الحصة</th>` +
    days.map(d => `<th>${d}</th>`).join('');
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  teachers.forEach(t => {
    for (let p = 1; p <= maxP; p++) {
      const tr = document.createElement('tr');
      if (p === 1) {
        tr.innerHTML += `<th rowspan="${maxP}" class="col-first-header"><div class="row-head-cell">
            <button class="btn-icon" data-action="remove-block-teacher" data-id="${t.id}" title="إزالة هذا المعلم من الجدول (يحذف كل أوقاته الممنوعة)">✕</button>
            <span style="text-align: inherit; width:100%;">${t.name}</span>
          </div></th>`;
      }
      tr.innerHTML += `<th class="tt-period-col">${p}</th>`;
      days.forEach(day => {
        const checked = state.constraints.teacherBlocks.some(b => b.teacherId === t.id && b.day === day && b.period === p);
        tr.innerHTML += `<td class="block-cell"><input type="checkbox" data-teacher="${t.id}" data-day="${day}" data-period="${p}" ${checked ? 'checked' : ''} /></td>`;
      });
      tbody.appendChild(tr);
    }
  });
  table.appendChild(tbody);

  table.querySelectorAll('input[type=checkbox][data-teacher]').forEach(cb => {
    cb.addEventListener('change', async () => {
      const teacherId = cb.dataset.teacher;
      const day = cb.dataset.day;
      const period = parseInt(cb.dataset.period, 10);
      const idx = state.constraints.teacherBlocks.findIndex(b => b.teacherId === teacherId && b.day === day && b.period === period);

      if (cb.checked && idx === -1) {
        // إضافة حظر جديد (لا إزالته) هي وحدها ما قد يُبطل حصة مثبّتة — لا حاجة لأي فحص عند إلغاء حظر قائم
        const broken = findFixedPlacementsBrokenByTeacherBlock(teacherId, day, period);
        const proceed = await confirmAndUnpinBrokenFixedPlacements(broken);
        if (!proceed) { cb.checked = false; return; }
        state.constraints.teacherBlocks.push({ teacherId, day, period });
        if (broken.length > 0) renderFixedPlacementEditor();
      } else if (!cb.checked && idx !== -1) {
        state.constraints.teacherBlocks.splice(idx, 1);
      }
      markDirty();
    });
  });

  table.querySelectorAll('[data-action="remove-block-teacher"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      state.constraints.teacherBlockRows = (state.constraints.teacherBlockRows || []).filter(x => x !== id);
      state.constraints.teacherBlocks = state.constraints.teacherBlocks.filter(b => b.teacherId !== id);
      markDirty();
      renderTeacherBlockSection();
    });
  });
}

document.getElementById('btn-add-teacher-block').addEventListener('click', () => {
  const teacherId = document.getElementById('block-teacher-select').value;
  if (!teacherId) return;
  if (!Array.isArray(state.constraints.teacherBlockRows)) state.constraints.teacherBlockRows = [];
  if (!state.constraints.teacherBlockRows.includes(teacherId)) state.constraints.teacherBlockRows.push(teacherId);
  markDirty();
  renderTeacherBlockSection();
});

// ── ٣) تجميع حصص مادة في نفس اليوم ───────────────────────────
// مصفوفة (مادة × صف) بسيطة بخانات تأشير — لا حاجة لآلية "+ إضافة" تدريجية كما في مصفوفة أوقات المعلمين
// الممنوعة، لأن هذه العلاقة ثنائية البُعد فقط (بلا حصص/أيام)، فحجمها صغير بما يكفي لعرضها كاملة دومًا.

// مواد يشيع الاتفاق على تجميع حصصها دومًا — تُؤشَّر تلقائيًا لأي صف تظهر له لأول مرة فقط (لا تُفرَض مجددًا
// إن عدّل المستخدم قراره لاحقًا، تمامًا كتوزيع الحدود اليومية الافتراضي للصف في الخطوة الثانية). المطابقة
// بالاسم الحرفي فقط — إن سمّى المستخدم هذه المواد بصيغة مختلفة، لن يُطبَّق التأشير التلقائي عليها، ويبقى بإمكانه
// تأشيرها يدويًا من المصفوفة كأي مادة أخرى.
const DEFAULT_GROUPED_SUBJECTS = ['التربية المهنية', 'النشاط'];

function syncSubjectGroupingDefaults() {
  let changed = false;
  state.grades.forEach(grade => {
    DEFAULT_GROUPED_SUBJECTS.forEach(subject => {
      if (!state.subjects.includes(subject)) return; // المادة غير معرَّفة أصلًا في هذه المدرسة
      const key = subjectGradeKey(subject, grade);
      if (state.constraints.subjectGroupingDefaultsApplied.includes(key)) return; // سبق اتخاذ القرار بشأنها
      state.constraints.subjectGroupingDefaultsApplied.push(key);
      if (!state.constraints.subjectGrouping.some(g => g.subject === subject && g.grade === grade)) {
        state.constraints.subjectGrouping.push({ subject, grade });
      }
      changed = true;
    });
  });
  return changed;
}

function renderSubjectGroupingSection() {
  const table = document.getElementById('subject-grouping-matrix');
  const empty = document.getElementById('subject-grouping-empty');

  if (syncSubjectGroupingDefaults()) markDirty(); // احفظ فورًا إن طُبِّق تأشير افتراضي جديد هذه المرة

  table.innerHTML = '';
  if (state.subjects.length === 0 || state.grades.length === 0) {
    empty.classList.add('show');
    return;
  }
  empty.classList.remove('show');

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th class="col-first-header">المادة \\ الصف</th>` + state.grades.map(g => `<th>${g}</th>`).join('');
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  state.subjects.forEach(subject => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${subject}</th>`;
    state.grades.forEach(grade => {
      const checked = state.constraints.subjectGrouping.some(g => g.subject === subject && g.grade === grade);
      tr.innerHTML += `<td class="block-cell"><input type="checkbox" data-subject="${subject}" data-grade="${grade}" ${checked ? 'checked' : ''} /></td>`;
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  table.querySelectorAll('input[type=checkbox][data-subject]').forEach(cb => {
    cb.addEventListener('change', () => {
      const subject = cb.dataset.subject;
      const grade = cb.dataset.grade;
      const idx = state.constraints.subjectGrouping.findIndex(g => g.subject === subject && g.grade === grade);
      if (cb.checked && idx === -1) state.constraints.subjectGrouping.push({ subject, grade });
      else if (!cb.checked && idx !== -1) state.constraints.subjectGrouping.splice(idx, 1);
      markDirty();
    });
  });
}

// ── ٤) تثبيت حصة مادة في مكان محدد — محرّر بشكل "الجدول التفصيلي" + تراي "الحصص غير المثبّتة" ────
// يعمل بالكامل قبل أي توليد (مرحلة القيود، الخطوة الرابعة) عبر buildFixedPlacementsContext (سياق تخيّلي
// معبَّأ فقط بالحصص المثبّتة يدويًا حاليًا)، ونفس دالة canPlaceAt المستخدمة على الجدول المولَّد فعليًا لاحقًا.

let fpEditSelection = null;   // { day, period, classKey } — خانة مثبّتة مختارة بالنقر، بانتظار خانة ثانية للتبديل/النقل
let fpTraySelection = null;   // فهرس عنصر من "الحصص غير المثبّتة" (ضمن computeUnfixedRequirementItems الكاملة، لا المُصفّاة) مختار بالنقر
let fpTrayFilterTeacher = 'all';
let fpTrayFilterClass = 'all';
let fpTrayFilterSubject = 'all';

function renderFixedPlacementEditor() {
  renderFixedPlacementTable();
  renderFixedPlacementTray();
}

// فهرس سريع: يوم -> حصة -> classKey -> {idx (في state.constraints.fixedPlacements), f}
function buildFixedPlacementLookup() {
  const map = {};
  state.school.days.forEach(day => {
    map[day] = {};
    for (let p = 1; p <= state.school.maxPeriods; p++) map[day][p] = {};
  });
  (state.constraints.fixedPlacements || []).forEach((f, idx) => {
    if (!map[f.day] || !map[f.day][f.period]) return;
    map[f.day][f.period][f.classKey] = { idx, f };
  });
  return map;
}

function renderFixedPlacementTable() {
  const table = document.getElementById('fp-table');
  const empty = document.getElementById('fp-table-empty');
  if (!table) return;

  const classes = getActiveClassList();
  const days = state.school.days;
  const maxPeriods = state.school.maxPeriods;

  if (classes.length === 0 || days.length === 0) {
    table.innerHTML = '';
    if (empty) empty.classList.add('show');
    return;
  }
  if (empty) empty.classList.remove('show');

  const lookup = buildFixedPlacementLookup();

  // نفس مبدأ تلوين الخانات الصالحة في "الجدول التفصيلي" بعد التوليد: عنصر من التراي محدَّد → الخانات الفارغة
  // الصالحة له؛ خانة مثبّتة محدَّدة → كل خانة أخرى يصحّ التبديل/النقل معها فعليًا
  const items = computeUnfixedRequirementItems();
  const validSet = new Set(); // "day|period|classKey"
  if (fpTraySelection !== null && items[fpTraySelection]) {
    getEmptyValidFpCellsForItem(items[fpTraySelection]).forEach(c => validSet.add(`${c.day}|${c.period}|${c.classKey}`));
  } else if (fpEditSelection) {
    computeValidFpSwapTargets(fpEditSelection).forEach(k => validSet.add(k));
  }

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th rowspan="2" class="tt-day-col">اليوم</th><th rowspan="2" class="tt-period-col">الحصة</th>`;
  classes.forEach(c => { row1.innerHTML += `<th colspan="2">${c.grade} - ${c.section}</th>`; });
  const row2 = document.createElement('tr');
  classes.forEach(() => { row2.innerHTML += `<th>المادة</th><th>المعلم</th>`; });
  thead.appendChild(row1);
  thead.appendChild(row2);

  const tbody = document.createElement('tbody');
  days.forEach(day => {
    for (let p = 1; p <= maxPeriods; p++) {
      const tr = document.createElement('tr');
      if (p === 1) {
        tr.className = 'tt-day-start';
        tr.innerHTML += `<th rowspan="${maxPeriods}" class="tt-day-col">${day}</th>`;
      }
      tr.innerHTML += `<th class="tt-period-col">${p}</th>`;
      classes.forEach(c => {
        const hit = lookup[day][p][c.key];
        const isSelected = !!(fpEditSelection && fpEditSelection.day === day && fpEditSelection.period === p && fpEditSelection.classKey === c.key);
        const isValidTarget = validSet.has(`${day}|${p}|${c.key}`);
        const cls = ['tt-cell'];
        if (isSelected) cls.push('selected');
        if (isValidTarget) cls.push('valid-target');
        const attrs = `data-day="${day}" data-period="${p}" data-class="${c.key}"`;
        if (hit) {
          const teacher = findTeacherForFixedPlacement(hit.f);
          const teacherName = teacher ? teacher.name : 'معلم محذوف';
          tr.innerHTML += `<td class="${cls.join(' ')} tt-subject-cell" ${attrs}>${hit.f.subject}<button type="button" class="unpin-btn" title="فك التثبيت" ${attrs}>×</button></td>` +
            `<td class="${cls.join(' ')} tt-teacher-cell" ${attrs}>${teacherName}</td>`;
        } else {
          cls.push('free-cell');
          tr.innerHTML += `<td class="${cls.join(' ')}" colspan="2" ${attrs}>فارغة</td>`;
        }
      });
      tbody.appendChild(tr);
    }
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);

  table.querySelectorAll('td[data-day]').forEach(td => {
    td.addEventListener('click', (e) => {
      if (e.target.classList.contains('unpin-btn')) return;
      handleFpCellPick({ day: td.dataset.day, period: parseInt(td.dataset.period, 10), classKey: td.dataset.class });
    });
  });
  table.querySelectorAll('.unpin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      unpinFp(btn.dataset.day, parseInt(btn.dataset.period, 10), btn.dataset.class);
    });
  });
}

// يُرجع كل الخانات الفارغة الصالحة (ضمن نفس الشعبة، بلا أي تعارض) لتثبيت حصة معيّنة من التراي فيها،
// بالسياق التخيّلي المبنيّ من الحصص المثبّتة الحالية فقط (لا جدول مولَّد)
function getEmptyValidFpCellsForItem(item) {
  const ctx = buildFixedPlacementsContext();
  const result = [];
  ctx.days.forEach(day => {
    for (let p = 1; p <= ctx.maxPeriods; p++) {
      const occupied = ctx.schedule[day][p][item.classKey];
      if (occupied) continue;
      if (canPlaceAt(item, day, p, item.classKey, null, ctx).ok) {
        result.push({ day, period: p, classKey: item.classKey });
      }
    }
  });
  return result;
}

// يُرجع كل خانة (فارغة أو مثبّتة) يصحّ تبديل/نقل الخانة المثبّتة المحدَّدة (from) إليها — بنفس السياق التخيّلي
function computeValidFpSwapTargets(from) {
  const ctx = buildFixedPlacementsContext();
  const result = new Set();
  const ck = from.classKey;
  const entryFrom = ctx.schedule[from.day][from.period][ck] || null;
  if (!entryFrom) return result; // لا معنى للتحديد من خانة فارغة هنا (التثبيت الجديد يأتي من التراي فقط، لا من نقل فراغ)

  ctx.days.forEach(day => {
    for (let p = 1; p <= ctx.maxPeriods; p++) {
      if (day === from.day && p === from.period) continue;
      const entryTo = ctx.schedule[day][p][ck] || null;
      let ok = canPlaceAt(entryFrom, day, p, ck, from, ctx).ok;
      if (ok && entryTo) ok = canPlaceAt(entryTo, from.day, from.period, ck, { day, period: p, classKey: ck }, ctx).ok;
      if (ok) result.add(`${day}|${p}|${ck}`);
    }
  });
  return result;
}

function handleFpCellPick(cellRef) {
  if (fpTraySelection !== null) {
    const idx = fpTraySelection;
    fpTraySelection = null;
    attemptFpPlaceFromTray(idx, cellRef);
    return;
  }
  const ctx = buildFixedPlacementsContext();
  const occupied = ctx.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (!fpEditSelection) {
    if (!occupied) { renderFixedPlacementEditor(); return; } // نقر على خانة فارغة بلا تحديد سابق لا يفعل شيئًا
    fpEditSelection = cellRef;
    renderFixedPlacementEditor();
    return;
  }
  const same = fpEditSelection.day === cellRef.day && fpEditSelection.period === cellRef.period && fpEditSelection.classKey === cellRef.classKey;
  if (same) {
    fpEditSelection = null;
    renderFixedPlacementEditor();
    return;
  }
  const from = fpEditSelection;
  fpEditSelection = null;
  attemptFpSwap(from, cellRef);
}

function handleFpTrayPick(index) {
  if (fpTraySelection === index) {
    fpTraySelection = null;
    renderFixedPlacementEditor();
    return;
  }
  fpEditSelection = null;
  fpTraySelection = index;
  renderFixedPlacementEditor();
}

function attemptFpPlaceFromTray(index, cellRef) {
  const items = computeUnfixedRequirementItems();
  const item = items[index];
  if (!item) { renderFixedPlacementEditor(); return; }

  if (item.classKey !== cellRef.classKey) {
    toast('هذه الحصة تعود لشعبة مختلفة. اختر خانة ضمن نفس الشعبة الموضحة على بطاقتها.', 'error');
    renderFixedPlacementEditor();
    return;
  }

  const ctx = buildFixedPlacementsContext();
  const existing = ctx.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (existing) {
    toast('هذه الخانة مثبّتة بالفعل. اختر خانة فارغة، أو بدّل الحصص المثبّتة مباشرة بالنقر.', 'error');
    renderFixedPlacementEditor();
    return;
  }

  const check = canPlaceAt(item, cellRef.day, cellRef.period, cellRef.classKey, null, ctx);
  if (!check.ok) {
    toast(check.reason, 'error');
    renderFixedPlacementEditor();
    return;
  }

  state.constraints.fixedPlacements.push({ classKey: cellRef.classKey, subject: item.subject, day: cellRef.day, period: cellRef.period });
  markDirty();
  renderFixedPlacementEditor();
  toast('تم تثبيت الحصة في هذا المكان بنجاح.', 'success');
}

function attemptFpSwap(from, to) {
  if (from.classKey !== to.classKey) {
    toast('لا يمكن تبديل حصص بين شعبتين مختلفتين.', 'error');
    renderFixedPlacementEditor();
    return;
  }
  const ctx = buildFixedPlacementsContext();
  const ck = from.classKey;
  const entryFrom = ctx.schedule[from.day][from.period][ck];
  if (!entryFrom) { renderFixedPlacementEditor(); return; }
  const entryTo = ctx.schedule[to.day][to.period][ck];

  const check1 = canPlaceAt(entryFrom, to.day, to.period, ck, from, ctx);
  if (!check1.ok) { toast(check1.reason, 'error'); renderFixedPlacementEditor(); return; }
  if (entryTo) {
    const check2 = canPlaceAt(entryTo, from.day, from.period, ck, to, ctx);
    if (!check2.ok) { toast(check2.reason, 'error'); renderFixedPlacementEditor(); return; }
  }

  const list = state.constraints.fixedPlacements;
  const fromIdx = list.findIndex(f => f.classKey === ck && f.day === from.day && f.period === from.period);
  const toIdx = list.findIndex(f => f.classKey === ck && f.day === to.day && f.period === to.period);
  if (fromIdx !== -1) { list[fromIdx].day = to.day; list[fromIdx].period = to.period; }
  if (toIdx !== -1) { list[toIdx].day = from.day; list[toIdx].period = from.period; }

  markDirty();
  renderFixedPlacementEditor();
  toast(entryTo ? 'تم تبديل الحصتين بنجاح.' : 'تم نقل الحصة إلى الخانة الجديدة بنجاح.', 'success');
}

function unpinFp(day, period, classKey) {
  const list = state.constraints.fixedPlacements;
  const idx = list.findIndex(f => f.day === day && f.period === period && f.classKey === classKey);
  if (idx === -1) return;
  list.splice(idx, 1);
  if (fpEditSelection && fpEditSelection.day === day && fpEditSelection.period === period && fpEditSelection.classKey === classKey) fpEditSelection = null;
  markDirty();
  renderFixedPlacementEditor();
  toast('تم فكّ تثبيت الحصة، وعادت إلى قائمة "الحصص غير المثبّتة".', 'success');
}

function renderFixedPlacementTray() {
  const list = document.getElementById('fp-tray-list');
  if (!list) return;

  const items = computeUnfixedRequirementItems();
  const classes = getActiveClassList();

  const teacherFilterEl = document.getElementById('fp-tray-filter-teacher');
  const classFilterEl = document.getElementById('fp-tray-filter-class');
  const subjectFilterEl = document.getElementById('fp-tray-filter-subject');

  if (teacherFilterEl) {
    const teachers = [...new Set(items.map(it => it.teacher))].sort((a, b) => a.localeCompare(b, 'ar'));
    teacherFilterEl.innerHTML = `<option value="all">كل المعلمين</option>` +
      teachers.map(t => `<option value="${t}"${t === fpTrayFilterTeacher ? ' selected' : ''}>${t}</option>`).join('');
    if (!teachers.includes(fpTrayFilterTeacher) && fpTrayFilterTeacher !== 'all') fpTrayFilterTeacher = 'all';
    teacherFilterEl.value = fpTrayFilterTeacher;
  }
  if (classFilterEl) {
    const classKeysPresent = [...new Set(items.map(it => it.classKey))];
    const classOptions = classKeysPresent.map(ck => {
      const c = classes.find(x => x.key === ck);
      return { key: ck, label: c ? `${c.grade} - ${c.section}` : ck };
    }).sort((a, b) => a.label.localeCompare(b.label, 'ar'));
    classFilterEl.innerHTML = `<option value="all">كل الشعب</option>` +
      classOptions.map(c => `<option value="${c.key}"${c.key === fpTrayFilterClass ? ' selected' : ''}>${c.label}</option>`).join('');
    if (!classKeysPresent.includes(fpTrayFilterClass) && fpTrayFilterClass !== 'all') fpTrayFilterClass = 'all';
    classFilterEl.value = fpTrayFilterClass;
  }
  if (subjectFilterEl) {
    const subjectsPresent = [...new Set(items.map(it => it.subject))].sort((a, b) => a.localeCompare(b, 'ar'));
    subjectFilterEl.innerHTML = `<option value="all">كل المواد</option>` +
      subjectsPresent.map(s => `<option value="${s}"${s === fpTrayFilterSubject ? ' selected' : ''}>${s}</option>`).join('');
    if (!subjectsPresent.includes(fpTrayFilterSubject) && fpTrayFilterSubject !== 'all') fpTrayFilterSubject = 'all';
    subjectFilterEl.value = fpTrayFilterSubject;
  }

  if (items.length === 0) {
    list.innerHTML = `<p class="tt-tray-empty">كل الحصص مثبّتة بالفعل — لا توجد حصص متبقية.</p>`;
    return;
  }

  const filtered = items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) =>
      (fpTrayFilterTeacher === 'all' || item.teacher === fpTrayFilterTeacher) &&
      (fpTrayFilterClass === 'all' || item.classKey === fpTrayFilterClass) &&
      (fpTrayFilterSubject === 'all' || item.subject === fpTrayFilterSubject)
    );

  if (filtered.length === 0) {
    list.innerHTML = `<p class="tt-tray-empty">لا توجد حصص مطابقة لهذه الفلترة.</p>`;
    return;
  }

  // تجميع حسب الشعبة أولًا، ثم المادة داخل كل شعبة — أقرب لطريقة مراجعة المستخدم الفعلية ("ماذا تبقّى لهذه
  // الشعبة تحديدًا؟") من عرض مسطّح غير مُجمَّع، خصوصًا وأن هذا التراي يحوي كل الحصص غير المثبّتة افتراضيًا،
  // لا فشلًا محدودًا كما في تراي "الجدول التفصيلي" بعد التوليد
  const grouped = new Map(); // classKey -> Map(subject -> [{item, idx}])
  filtered.forEach(entry => {
    const ck = entry.item.classKey;
    if (!grouped.has(ck)) grouped.set(ck, new Map());
    const bySubject = grouped.get(ck);
    if (!bySubject.has(entry.item.subject)) bySubject.set(entry.item.subject, []);
    bySubject.get(entry.item.subject).push(entry);
  });

  const classKeysSorted = [...grouped.keys()].sort((a, b) => {
    const ca = classes.find(x => x.key === a); const cb = classes.find(x => x.key === b);
    const la = ca ? `${ca.grade} - ${ca.section}` : a; const lb = cb ? `${cb.grade} - ${cb.section}` : b;
    return la.localeCompare(lb, 'ar');
  });

  let html = '';
  classKeysSorted.forEach(ck => {
    const c = classes.find(x => x.key === ck);
    const classLabel = c ? `${c.grade} - ${c.section}` : ck;
    html += `<div class="fp-tray-group-header">${classLabel}</div>`;
    const bySubject = grouped.get(ck);
    const subjectsSorted = [...bySubject.keys()].sort((a, b) => a.localeCompare(b, 'ar'));
    subjectsSorted.forEach(subj => {
      html += `<div class="fp-tray-subject-header">${subj}</div>`;
      bySubject.get(subj).forEach(({ item, idx }) => {
        const selCls = fpTraySelection === idx ? ' selected' : '';
        html += `<div class="tray-chip${selCls}" data-index="${idx}">
          <div class="tray-chip-subject">${item.subject}</div>
          <div class="tray-chip-teacher">${item.teacher}</div>
          <div class="tray-chip-class">${classLabel}</div>
        </div>`;
      });
    });
  });

  list.innerHTML = html;
  list.querySelectorAll('.tray-chip').forEach(chip => {
    chip.addEventListener('click', () => handleFpTrayPick(parseInt(chip.dataset.index, 10)));
  });
}

document.getElementById('fp-tray-filter-teacher').addEventListener('change', (e) => {
  fpTrayFilterTeacher = e.target.value;
  renderFixedPlacementTray();
});
document.getElementById('fp-tray-filter-class').addEventListener('change', (e) => {
  fpTrayFilterClass = e.target.value;
  renderFixedPlacementTray();
});
document.getElementById('fp-tray-filter-subject').addEventListener('change', (e) => {
  fpTrayFilterSubject = e.target.value;
  renderFixedPlacementTray();
});

// ═══════════════════════════════════════════════════════════════
// اكتشاف الحصص المثبّتة التي سيُبطلها تغيير آخر في القيود، قبل تطبيق ذلك التغيير فعليًا — لا بعده. كل دالة
// أدناه تُستدعى قبل تنفيذ فعل مدمِّر معيّن (حظر معلم، إزالة تعيين، حذف معلم/صف/شعبة/مادة، تعطيل شعبة)، وتُرجع
// قائمة الحصص المثبّتة التي سيُبطلها ذلك الفعل تحديدًا مع سبب واضح لكل واحدة — لا شيء يُطبَّق فعليًا هنا بعد.
// ═══════════════════════════════════════════════════════════════

function findFixedPlacementsBrokenByTeacherBlock(teacherId, day, period) {
  const broken = [];
  (state.constraints.fixedPlacements || []).forEach(f => {
    if (f.day !== day || f.period !== period) return;
    const teacher = findTeacherForFixedPlacement(f);
    if (teacher && teacher.id === teacherId) {
      broken.push({ f, reason: `المعلم "${teacher.name}" سيصبح ممنوعًا من التدريس في هذا الوقت تحديدًا` });
    }
  });
  return broken;
}

// removedAssignments: قائمة {subject, grade, section} كانت مُسنَدة لهذا المعلم ولن تعود كذلك بعد التغيير
// (سواء من تعديل تعييناته، أو حذفه بالكامل — عندها تُمرَّر كل تعييناته الحالية)
function findFixedPlacementsBrokenByAssignmentRemoval(teacherId, removedAssignments) {
  if (removedAssignments.length === 0) return [];
  const teacher = state.teachers.find(t => t.id === teacherId);
  const teacherName = teacher ? teacher.name : 'هذا المعلم';
  const broken = [];
  (state.constraints.fixedPlacements || []).forEach(f => {
    const [grade, section] = f.classKey.split('___');
    const wasRemoved = removedAssignments.some(a => a.subject === f.subject && a.grade === grade && a.section === section);
    if (wasRemoved) {
      broken.push({ f, reason: `لم يعد المعلم "${teacherName}" مُسندًا لتدريس هذه المادة لهذه الشعبة` });
    }
  });
  return broken;
}

function findFixedPlacementsBrokenByGradeDeletion(grade) {
  return (state.constraints.fixedPlacements || [])
    .filter(f => f.classKey.split('___')[0] === grade)
    .map(f => ({ f, reason: `الصف "${grade}" سيُحذَف` }));
}

function findFixedPlacementsBrokenBySectionDeletion(section) {
  return (state.constraints.fixedPlacements || [])
    .filter(f => f.classKey.split('___')[1] === section)
    .map(f => ({ f, reason: `الشعبة "${section}" ستُحذَف` }));
}

function findFixedPlacementsBrokenByClassDeactivation(ck) {
  return (state.constraints.fixedPlacements || [])
    .filter(f => f.classKey === ck)
    .map(f => ({ f, reason: 'ستُصبح هذه الشعبة غير مفعّلة' }));
}

function findFixedPlacementsBrokenBySubjectDeletion(subject) {
  return (state.constraints.fixedPlacements || [])
    .filter(f => f.subject === subject)
    .map(f => ({ f, reason: `المادة "${subject}" ستُحذَف` }));
}

// ── تصفير عدد حصص مادة لصف معيّن (الخطوة الثانية): يُستدعى عند اكتمال تعديل الحقل فعليًا (لا مع كل ضغطة
// زر — راجع الاستدعاء في renderSubjectsMatrix)، لا نقطة تحفيز إضافية من النقاط الست أعلاه، لكن بنفس الآلية
// والهيكل تمامًا؛ الاختلاف الوحيد أن هذا التغيير يمكن أن يُبطل نوعين معًا لا نوعًا واحدًا: تعيينات معلمين
// (أي شعبة من هذا الصف، أي معلم) وحصص مثبّتة مسبقًا — كلاهما يُعرَضان في نافذة تأكيد واحدة مشتركة ────────

function findFixedPlacementsBrokenBySubjectGradeZeroed(subject, grade) {
  return (state.constraints.fixedPlacements || [])
    .filter(f => f.subject === subject && f.classKey.split('___')[0] === grade)
    .map(f => ({ f, reason: `لم تعد المادة "${subject}" مقرَّرة لصف "${grade}" (عدد الحصص الآن صفر)` }));
}

function findTeacherAssignmentsForSubjectGradeZeroed(subject, grade) {
  const result = [];
  state.teachers.forEach(t => {
    (t.assignments || []).forEach(a => {
      if (a.subject === subject && a.grade === grade) result.push({ teacher: t, assignment: a });
    });
  });
  return result;
}

// ── نافذة تأكيد عامة: تعرض كل العناصر المتأثرة دفعة واحدة (لا نافذة منفصلة لكل عنصر) — يُستخدَم لكل من فكّ
// تثبيت حصص أُبطلت بتغيير آخر في القيود، وتغيير معلم مادة قد يُبطل حصصًا مجدولة فعليًا (نص/عنوان/تسمية زر
// الديناميكية تُميِّز السياقين، لكن الآلية والهيكل نفسهما تمامًا) ──────────────────────────────────

let __conflictModalResolve = null;

function showConflictConfirmModal(items, title, summaryText, confirmLabel) {
  return new Promise((resolve) => {
    __conflictModalResolve = resolve;
    document.getElementById('fp-conflict-title').textContent = title;
    document.getElementById('fp-conflict-summary').textContent = summaryText;
    document.getElementById('fp-conflict-list').innerHTML = items.map(({ label, reason }) =>
      `<div class="constraint-item"><span class="constraint-text">${label}
          <span class="constraint-sub">${reason}</span></span></div>`
    ).join('');
    document.getElementById('btn-fp-conflict-confirm').textContent = confirmLabel;
    document.getElementById('fp-conflict-modal').classList.add('show');
  });
}

function closeConflictModal(result) {
  document.getElementById('fp-conflict-modal').classList.remove('show');
  const resolve = __conflictModalResolve;
  __conflictModalResolve = null;
  if (resolve) resolve(result);
}

document.getElementById('btn-fp-conflict-confirm').addEventListener('click', () => closeConflictModal(true));
document.getElementById('btn-fp-conflict-cancel').addEventListener('click', () => closeConflictModal(false));
document.getElementById('btn-fp-conflict-close').addEventListener('click', () => closeConflictModal(false));

// نقطة الدخول المشتركة لكل نقاط التحفيز الست: إن كانت القائمة فارغة تُرجع true فورًا بلا أي نافذة (لا داعٍ
// لإزعاج المستخدم بلا سبب حقيقي). خلاف ذلك تعرض نافذة التأكيد وتنتظر قرار المستخدم؛ عند الموافقة تفكّ تثبيت
// كل الحصص المتأثرة فعليًا من state.constraints.fixedPlacements وتُرجع true (تابع التغيير الأصلي)؛ عند
// الرفض لا تُغيّر شيئًا وتُرجع false (لا يُطبَّق التغيير الأصلي إطلاقًا — يبقى كل شيء كما كان قبل المحاولة)
async function confirmAndUnpinBrokenFixedPlacements(brokenList) {
  if (brokenList.length === 0) return true;
  const count = brokenList.length;
  const items = brokenList.map(({ f, reason }) => {
    const c = getActiveClassList().find(x => x.key === f.classKey);
    const classLabel = c ? `${c.grade} - ${c.section}` : f.classKey;
    return { label: `${f.subject} — ${classLabel}`, reason: `${f.day} — الحصة ${f.period} — ${reason}` };
  });
  const summary = `هذا التغيير سيجعل ${count} ${count === 1 ? 'حصة مثبّتة' : 'حصص مثبّتة'} غير قابلة للتنفيذ. عند المتابعة، ستُفكّ هذه الحصص تلقائيًا (تعود إلى "الحصص غير المثبّتة" في محرّر التثبيت)، ويبقى بإمكانك تثبيتها من جديد في مكان آخر لاحقًا. لإلغاء هذا التغيير كليًا بدلًا من ذلك، اختر "إلغاء هذا التغيير".`;
  const proceed = await showConflictConfirmModal(items, 'هذا التغيير سيُبطل حصصًا مثبّتة', summary, 'متابعة وفكّ تثبيتها');
  if (!proceed) return false;
  const toRemove = new Set(brokenList.map(({ f }) => f));
  state.constraints.fixedPlacements = state.constraints.fixedPlacements.filter(f => !toRemove.has(f));
  return true;
}

// نظير الدالة أعلاه، لكن لتصفير عدد حصص مادة لصف معيّن تحديدًا — تُبطل نوعين معًا (تعيينات معلمين، وحصص
// مثبّتة) في نافذة تأكيد واحدة مشتركة بدل نافذتين منفصلتين. لا تمسّ أي جدول سبق توليده إطلاقًا (مبدأ قائم
// بالفعل في التطبيق: تغيير إعدادات التوليد لا يُغيِّر جدولًا سبق توليده) — فقط التعيينات والتثبيتات المسبقة.
async function confirmAndCleanupZeroedSubjectGrade(subject, grade) {
  const brokenPlacements = findFixedPlacementsBrokenBySubjectGradeZeroed(subject, grade);
  const affectedAssignments = findTeacherAssignmentsForSubjectGradeZeroed(subject, grade);
  if (brokenPlacements.length === 0 && affectedAssignments.length === 0) return true;

  const assignmentItems = affectedAssignments.map(({ teacher, assignment }) => ({
    label: `تعيين معلم: ${teacher.name}`,
    reason: `${assignment.subject} — ${assignment.grade} - ${assignment.section}`,
  }));
  const placementItems = brokenPlacements.map(({ f, reason }) => {
    const c = getActiveClassList().find(x => x.key === f.classKey);
    const classLabel = c ? `${c.grade} - ${c.section}` : f.classKey;
    return { label: `حصة مثبّتة: ${f.subject} — ${classLabel}`, reason: `${f.day} — الحصة ${f.period} — ${reason}` };
  });
  const items = [...assignmentItems, ...placementItems];
  const count = items.length;

  const summary = `تصفير عدد حصص "${subject}" لصف "${grade}" سيُلغي ${count} ${count === 1 ? 'ارتباطًا' : 'ارتباطات'} تعتمد على وجود حصص لها (تعيينات معلمين وحصص مثبّتة مسبقًا). لن يتأثر أي جدول سبق توليده. لإلغاء تصفير العدد كليًا بدلًا من ذلك، اختر "إلغاء هذا التغيير".`;
  const proceed = await showConflictConfirmModal(items, 'تصفير الحصص سيُلغي ارتباطات قائمة', summary, 'متابعة والإلغاء');
  if (!proceed) return false;

  affectedAssignments.forEach(({ teacher, assignment }) => {
    teacher.assignments = teacher.assignments.filter(a => a !== assignment);
  });
  const toRemove = new Set(brokenPlacements.map(({ f }) => f));
  state.constraints.fixedPlacements = state.constraints.fixedPlacements.filter(f => !toRemove.has(f));
  return true;
}

// ═══════════════════════════════════════════════════════════════
// الخطوة ٥ — توليد الجدول (خوارزمية البحث الرجعي)
// ═══════════════════════════════════════════════════════════════
document.getElementById('btn-generate').addEventListener('click', generateTimetable);
// btn-start-manual موجود فقط في نسخة الموقع الساكن (لا في تطبيق سطح المكتب) — بخلاف كل عنصر آخر في هذا
// الملف، يُستخدَم هنا فحص وجود صريح (لا استدعاء مباشر) حتى لا ينهار تطبيق سطح المكتب عند تحميل نفس app.js
// هذا دون أن يكون لديه هذا الزر إطلاقًا في index.html الخاص به
document.getElementById('btn-start-manual')?.addEventListener('click', () => {
  initializeBlankTimetable();
  toast('جدول فارغ جاهز — كل الحصص المطلوبة الآن في "الحصص غير المثبّتة"، رتِّبها بالسحب والإفلات.', 'success');
});
document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
document.getElementById('btn-export-official').addEventListener('click', exportOfficialTimetable);
document.getElementById('btn-export-teacher-load').addEventListener('click', exportTeacherLoadWorkbook);
document.getElementById('btn-export-teacher-schedules').addEventListener('click', exportTeacherSchedulesWorkbook);
document.getElementById('btn-fill-gaps').addEventListener('click', async () => {
  if (!state.timetable) { toast('لا يوجد جدول لإغلاق فجواته بعد. وَلِّد الجدول أولًا.', 'error'); return; }
  const result = await runGapCompactionPass();
  if (result.filled === 0 && result.remaining.length === 0) {
    toast('لا توجد فجوات في الجدول الحالي.', 'info');
  } else if (result.filled === 0) {
    toast(`تعذّر إغلاق أي فجوة إضافية (${result.remaining.length} فجوة متبقية بسبب تعارض أوقات المعلمين أو حصص مثبّتة).`, 'error');
  } else if (result.remaining.length === 0) {
    toast(`تم إغلاق ${result.filled} فجوة بنجاح، ولم تعد هناك أي فجوات في الجدول.`, 'success');
  } else {
    toast(`تم إغلاق ${result.filled} فجوة، وتبقّت ${result.remaining.length} فجوة تعذّر حلّها تلقائيًا.`, 'info');
  }
});
document.getElementById('btn-rescue-unplaced').addEventListener('click', async () => {
  if (!state.timetable) { toast('لا يوجد جدول بعد. وَلِّد الجدول أولًا.', 'error'); return; }
  const before = state.timetable.unpinned.length;
  if (before === 0) { toast('لا توجد حصص عالقة في "الحصص غير المثبّتة" حاليًا.', 'info'); return; }
  const rescued = await rescueUnplacedItems(3);
  if (rescued > 0) {
    await runGapCompactionPass();
    renderTimetableOutput();
  }
  const remaining = state.timetable.unpinned.length;
  if (rescued === 0) {
    toast(`تعذّر وضع أي من الحصص العالقة الـ${before} — لا خانة فارغة ولا سلسلة إزاحة ممكنة حاليًا ضمن القيود الحالية.`, 'error');
  } else if (remaining === 0) {
    toast(`تم وضع كل الحصص العالقة الـ${rescued} بنجاح.`, 'success');
  } else {
    toast(`تم وضع ${rescued} من ${before} حصة عالقة، وتبقّت ${remaining} حصة تعذّر وضعها.`, 'info');
  }
});

function setStatus(html, type) {
  const box = document.getElementById('generate-status');
  box.innerHTML = html ? `<div class="status-banner status-${type}">${html}</div>` : '';
}

// ═══════════════════════════════════════════════════════════════
// جسر التوليد عبر WebView2 (CP-SAT في الطبقة الأصلية C#) — الطريق الأساسي للتوليد
// ═══════════════════════════════════════════════════════════════
// إن كان التطبيق يعمل داخل غلاف WebView2 (Jadwalak.exe)، يُرسَل طلب توليد إلى الطبقة الأصلية بدل تشغيل
// الخوارزمية المحلية هنا. عند التشغيل خارج الغلاف (تطوير/اختبار في متصفح عادي)، لا وجود لـ
// window.chrome.webview، فيُستخدَم تلقائيًا المسار المحلي (generateTimetableLocally) كبديل — بلا أي فرق
// يلاحظه المستخدم عدا سرعة التوليد ونتيجته (المحرّك الأصلي يضمن عدم وجود فجوات من الأساس).

function isBridgeAvailable() {
  return !!(window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function');
}

let __bridgeRequestSeq = 0;
const __bridgePendingRequests = {}; // requestId -> { resolve, reject }

// يُسجَّل مستمع رسائل الجسر مرة واحدة فقط، ويوزّع كل رد وارد على الطلب المطابق له عبر requestId — بصرف
// النظر عن نوع الرد (type)، لأن كل مستدعٍ يعرف مسبقًا أي نوع ردّ ينتظر (هو من بدأ الطلب المطابق أصلًا)
if (isBridgeAvailable()) {
  console.log('[bridge] window.chrome.webview متاح — تسجيل مستمع الرسائل الآن.');
  window.chrome.webview.addEventListener('message', (event) => {
    const msg = event.data;
    // نطبع كل رسالة واردة بلا استثناء (سواء طابقت طلبًا معلَّقًا أم لا) — هذا أهم سطر تشخيصي هنا: إن ظهر في
    // الطرفية أن رسالة وصلت فعلًا لكنها لم تُطابَق، فالمشكلة في الـrequestId/type لا في الاتصال نفسه؛ وإن لم
    // تظهر أي رسالة واردة إطلاقًا رغم إرسال طلب، فالمشكلة أن معالج C# لم يُستدعَ أصلًا (غالبًا سطر الربط الناقص
    // في MainForm.cs)، أو أنه يتعطّل قبل أن يصل لاستدعاء PostWebMessageAsJson
    console.log('[bridge] رسالة واردة من الطبقة الأصلية:', msg);

    // طلب مبادَر به من C# نفسه، لا ردًّا على طلب بدأته JS — عكس اتجاه كل رسائل الجسر الأخرى تمامًا. يصل هذا
    // عند محاولة إغلاق النافذة (من الزر المُحقَن، أو Alt+F4، أو شريط المهام)؛ نُشغِّل نفس نافذة "تغييرات غير
    // محفوظة" المعتادة تمامًا (promptUnsavedChanges)، ثم نُرسل القرار الفعلي ردًّا صريحًا — لا عبر القيمة
    // المُعادة من ExecuteScriptAsync (تلك لا تنتظر تحقّق الوعد فعليًا رغم ما قد يُفترَض، فتُعيد فورًا الكائن
    // المعلَّق نفسه بلا انتظار حقيقي)، بل عبر نفس آلية postMessage المضمونة العمل والمُستخدَمة في كل مكان آخر
    if (msg && msg.type === 'confirmClose') {
      promptUnsavedChanges().then((canClose) => {
        window.chrome.webview.postMessage({ type: 'confirmCloseResult', canClose });
      });
      return;
    }

    // نطبع كل رسالة واردة بلا استثناء (سواء طابقت طلبًا معلَّقًا أم لا) — هذا أهم سطر تشخيصي هنا: إن ظهر في
    // الطرفية أن رسالة وصلت فعلًا لكنها لم تُطابَق، فالمشكلة في الـrequestId/type لا في الاتصال نفسه؛ وإن لم
    // تظهر أي رسالة واردة إطلاقًا رغم إرسال طلب، فالمشكلة أن معالج C# لم يُستدعَ أصلًا (غالبًا سطر الربط الناقص
    // في MainForm.cs)، أو أنه يتعطّل قبل أن يصل لاستدعاء PostWebMessageAsJson
    if (!msg || !msg.requestId) { console.warn('[bridge] رسالة واردة بلا requestId صالح — تُتجاهَل.'); return; }
    const pending = __bridgePendingRequests[msg.requestId];
    if (!pending) { console.warn(`[bridge] لا يوجد طلب معلَّق مطابق لـ requestId="${msg.requestId}" (ردّ متأخر بعد انتهاء المهلة، أو معرّف غير مطابق).`); return; }
    delete __bridgePendingRequests[msg.requestId];
    pending.resolve(msg.payload);
  });
} else {
  console.warn('[bridge] window.chrome.webview غير متاح على هذه الصفحة — إما أنها تعمل خارج غلاف WebView2 (متصفح عادي)، أو أن حقن الجسر لم يتم بعد وقت تحميل الصفحة.');
}

// دالة عامة لإرسال أي طلب إلى الطبقة الأصلية وانتظار الردّ المطابق (بمهلة زمنية احتياطية تمنع بقاء الواجهة
// عالقة إلى الأبد إن حدث خطأ غير متوقع في الطرف الآخر ولم يصل أي ردّ إطلاقًا). يُستخدَم هذا لأي نوع طلب
// جسر حاليًا وُلاحقًا (توليد الجدول، تصدير Excel، وأي إضافة مستقبلية)
function callBridge(requestType, payload, timeoutMs, idPrefix) {
  return new Promise((resolve, reject) => {
    const requestId = (idPrefix || 'req') + '-' + (++__bridgeRequestSeq) + '-' + Date.now();
    console.log(`[bridge] إرسال طلب type="${requestType}" requestId="${requestId}"`, payload);

    const timer = setTimeout(() => {
      delete __bridgePendingRequests[requestId];
      console.error(`[bridge] ⏱ انتهت المهلة بلا ردّ — type="${requestType}" requestId="${requestId}" بعد ${timeoutMs || 60000} مل ثانية. تحقّق من سجلّ C# (راجع BridgeDebugLog) لمعرفة إن كان الطلب وصل إليه أصلًا.`);
      reject(new Error('انتهت مهلة الانتظار — لم يصل ردّ من التطبيق الأصلي.'));
    }, timeoutMs || 60000);

    __bridgePendingRequests[requestId] = {
      resolve: (resultPayload) => {
        console.log(`[bridge] ✓ ردّ ناجح لـ requestId="${requestId}"`, resultPayload);
        clearTimeout(timer);
        resolve(resultPayload);
      },
      reject: (err) => { clearTimeout(timer); reject(err); }
    };

    try {
      window.chrome.webview.postMessage({ requestId, type: requestType, payload });
      console.log(`[bridge] postMessage نُفِّذت بلا استثناء لـ requestId="${requestId}" (هذا لا يعني وصولها لـ C#، فقط أن الإرسال من طرف الجافاسكربت لم يفشل).`);
    } catch (err) {
      console.error(`[bridge] فشلت postMessage نفسها لـ requestId="${requestId}"`, err);
      delete __bridgePendingRequests[requestId];
      clearTimeout(timer);
      reject(err);
    }
  });
}

function callGenerateTimetableBridge(payload, timeoutMs) {
  return callBridge('generateTimetable', payload, timeoutMs, 'gt');
}

function callExcelExportBridge(payload, timeoutMs) {
  return callBridge('exportExcel', payload, timeoutMs, 'xl');
}

function callSaveProjectFileBridge(payload, timeoutMs) {
  return callBridge('saveProjectFile', payload, timeoutMs, 'sf');
}
function callOpenProjectFileBridge(payload, timeoutMs) {
  return callBridge('openProjectFile', payload, timeoutMs, 'of');
}
function callReadProjectFileByPathBridge(payload, timeoutMs) {
  return callBridge('readProjectFileByPath', payload, timeoutMs, 'rf');
}
function callCheckFilesExistBridge(payload, timeoutMs) {
  return callBridge('checkProjectFilesExist', payload, timeoutMs, 'cfe');
}
function callRevealFileInFolderBridge(payload, timeoutMs) {
  return callBridge('revealFileInFolder', payload, timeoutMs, 'rvl');
}

// يبني قائمة "المتطلبات" (كل تعيين معلم-مادة-شعبة فعّال، بعدد حصصه الأسبوعي وحالة تجميعه) بنفس منطق
// الاشتقاق المستخدَم داخليًا في المسار المحلي، لتُرسَل للمحرّك الأصلي جاهزة دون تكرار منطق العمل هناك
function buildAssignmentsList() {
  const activeClasses = getActiveClassList();
  const list = [];
  state.teachers.forEach(t => {
    t.assignments.forEach(a => {
      const ck = classKey(a.grade, a.section);
      if (!activeClasses.some(c => c.key === ck)) return;
      const weeklyPeriods = state.subjectPeriods[subjectGradeKey(a.subject, a.grade)] || 0;
      if (weeklyPeriods <= 0) return;
      const isGrouped = state.constraints.subjectGrouping.some(g => g.subject === a.subject && g.grade === a.grade);
      list.push({
        teacherId: t.id, teacherName: t.name, subject: a.subject,
        grade: a.grade, section: a.section, weeklyPeriods, isGrouped
      });
    });
  });
  return list;
}

// يبني حمولة الطلب الكاملة المرسَلة إلى الجسر، مطابقة تمامًا للشكل الذي يتوقعه TimetableBridge.cs
function buildBridgePayload() {
  syncGradeDayCaps(); // تأكيد وجود صف/يوم لكل الصفوف والأيام الحالية قبل الإرسال
  return {
    days: state.school.days,
    maxPeriods: state.school.maxPeriods,
    activeClasses: getActiveClassList().map(c => ({ grade: c.grade, section: c.section })),
    assignments: buildAssignmentsList(),
    blockedSlots: (state.constraints.teacherBlocks || []).map(b => ({ teacherId: b.teacherId, day: b.day, period: b.period })),
    fixedPlacements: (state.constraints.fixedPlacements || []).map(f => ({
      classKey: f.classKey, subject: f.subject, teacherId: f.teacherId || null, day: f.day, period: f.period
    })),
    gradeDayCaps: state.gradeDayCaps,
    maxSolveSeconds: 20
  };
}

// يحوّل ردّ الجسر (schedule/unpinned بصيغة JSON) إلى الشكل الذي يتوقعه باقي التطبيق في state.timetable —
// لا حاجة لأي تحويل على مفاتيح رقم الحصة (نصوص أصلاً في JSON، ويتعامل معها JS بنفس الطريقة عند الوصول
// بصيغة schedule[day][p] سواء كان p رقمًا أو نصًا)
function applyBridgeResultToState(resultPayload) {
  const activeClasses = getActiveClassList();
  state.timetable = {
    schedule: resultPayload.schedule,
    days: state.school.days,
    maxPeriods: state.school.maxPeriods,
    activeClasses,
    unpinned: resultPayload.unpinned || []
  };
  // لازم هنا تحديدًا لا في دوال شبكة الأمان اللاحقة (إغلاق الفجوات/الإنقاذ) — فتلك الدوال تتجاهل الرسم إن
  // لم يكن هناك ما تفعله (وهي الحالة الشائعة الآن، لأن المحرّك الأصلي يضمن عدم وجود فجوات من الأساس)، فلا
  // يظهر الجدول الجديد في الواجهة إطلاقًا إلا عند أول تفاعل يدوي يستدعي الرسم لسبب آخر
  markDirty();
  renderTimetableOutput();
}

function showGenerationOverlay(text, subtext) {
  const overlay = document.getElementById('generation-overlay');
  if (text) document.getElementById('generation-overlay-text').textContent = text;
  document.getElementById('generation-overlay-subtext').textContent = subtext || 'قد تستغرق هذه العملية بضع ثوانٍ';
  overlay.classList.add('show');
}
function hideGenerationOverlay() {
  document.getElementById('generation-overlay').classList.remove('show');
}
function setGenerateButtonBusy(busy) {
  const btn = document.getElementById('btn-generate');
  btn.disabled = busy;
  const gapBtn = document.getElementById('btn-fill-gaps');
  const rescueBtn = document.getElementById('btn-rescue-unplaced');
  if (gapBtn) gapBtn.disabled = busy;
  if (rescueBtn) rescueBtn.disabled = busy;
}

let __generationInFlight = false;

// نقطة الدخول العامة لزر "توليد الجدول" — تُفضِّل المحرّك الأصلي (CP-SAT عبر الجسر) دائمًا عند توفره،
// وتتراجع تلقائيًا للخوارزمية المحلية فقط عند تشغيل التطبيق خارج غلاف WebView2 (تطوير/اختبار)
// ═══════════════════════════════════════════════════════════════
// "ابدأ يدويًا من الصفر" — بديل كامل للتوليد الآلي، لا مكمِّل له: يبني جدولًا فارغًا تمامًا وينقل كل الحصص
// المطلوبة إلى "الحصص غير المثبّتة" مباشرة، بلا أي محاولة توليد آلي إطلاقًا. يُستخدَم زر توليد الجدول (أعلاه)
// أو هذه الدالة، لا كلاهما معًا لنفس المشروع في نفس اللحظة.
// ═══════════════════════════════════════════════════════════════
// الناتج مطابق تمامًا لشكل ما تُنتجه applyBridgeResultToState (نفس الحقول: schedule/days/maxPeriods/
// activeClasses/unpinned)، فقط بجدول schedule فارغ بالكامل وunpinned يحوي كل حصة مطلوبة — لذلك يعمل كل ما
// بُني على الجدول من ميزات تحرير (السحب، التبديل، تغيير المعلم، البحث، التلوين) بلا أي تعديل إضافي عليها،
// إذ لا تفرّق تلك الميزات إطلاقًا بين جدول نتج عن توليد آلي وجدول بُدئ فارغًا يدويًا
function initializeBlankTimetable() {
  const activeClasses = getActiveClassList();
  const days = state.school.days;
  const maxPeriods = state.school.maxPeriods;

  const schedule = {};
  days.forEach(day => {
    schedule[day] = {};
    for (let p = 1; p <= maxPeriods; p++) schedule[day][p] = {}; // فارغة تمامًا لكل الشعب عند هذا اليوم/الحصة
  });

  // حصة واحدة منفصلة قابلة للسحب لكل حصة أسبوعية مطلوبة فعليًا (لا إدخال واحد "بعدد ٥" مثلًا) — بنفس
  // الشكل تمامًا الذي يُنتجه التوليد الآلي أو الإنقاذ التلقائي عند ترك حصة بلا مكان؛ التجميع (isGrouped)
  // لا يغيّر عدد هذه الإدخالات إطلاقًا — لا يزال أثره مقصورًا على تفضيل تتالي الأيام أثناء التوليد الآلي
  // فقط (أو التلوين اللطيف المخطَّط له لاحقًا في المحرِّر اليدوي)، لا على بنية عناصر القائمة الجانبية نفسها
  const unpinned = [];
  buildAssignmentsList().forEach(a => {
    const ck = classKey(a.grade, a.section);
    for (let i = 0; i < a.weeklyPeriods; i++) {
      unpinned.push({ classKey: ck, subject: a.subject, teacher: a.teacherName, teacherId: a.teacherId });
    }
  });

  state.timetable = { schedule, days, maxPeriods, activeClasses, unpinned };
  markDirty();
  renderTimetableOutput();
}

async function generateTimetable() {
  if (__generationInFlight) return; // تجاهل نقرة مزدوجة أثناء وجود طلب قائم بالفعل
  __generationInFlight = true;
  setGenerateButtonBusy(true);

  if (!isBridgeAvailable()) {
    // مسار احتياطي للتطوير خارج الغلاف — لا نافذة تحميل منفصلة له عادةً (يبقى الزر معطّلاً طوال تنفيذه فقط)،
    // لكنه الآن غير متزامن (async) وينفّس دوريًا لدورة أحداث المتصفح في الحالات الصعبة، فلا يُخشى تجميده لها
    try {
      await generateTimetableLocally();
    } finally {
      __generationInFlight = false;
      setGenerateButtonBusy(false);
    }
    return;
  }

  showGenerationOverlay('جارٍ توليد الجدول…', 'قد تستغرق هذه العملية بضع ثوانٍ');

  try {
    const payload = buildBridgePayload();
    const result = await callGenerateTimetableBridge(payload, 60000);

    applyBridgeResultToState(result);

    let gapResult = await runGapCompactionPass(); // شبكة أمان رخيصة: لا تفعل شيئًا عمليًا إن كان المحرّك الأصلي قد ضمن فعلاً عدم وجود فجوات
    const rescuedCount = await rescueUnplacedItems(3);
    if (rescuedCount > 0) {
      const secondGapPass = await runGapCompactionPass();
      gapResult = { filled: gapResult.filled + secondGapPass.filled, remaining: secondGapPass.remaining };
    }

    let statusHtml = '';
    let statusType = result.isSuccess ? 'success' : 'warning';

    if (result.isSuccess) {
      statusHtml = `تم توليد جدول كامل${state.timetable.unpinned.length === 0 ? ' وخالٍ من التعارضات' : ''} لجميع الحصص (${buildAssignmentsList().reduce((s, a) => s + a.weeklyPeriods, 0)} حصة).`;
    } else {
      statusHtml = `تم توليد أفضل جدول ممكن، لكن واجه المحرّك صعوبة في وضع كل الحصص دون تعارض.`;
    }

    if (result.validationErrors && result.validationErrors.length > 0) {
      statusHtml += `<br><br><small>${result.validationErrors.map(e => '• ' + e).join('<br>')}</small>`;
      if (statusType === 'success') statusType = 'warning';
    }

    if (rescuedCount > 0) {
      statusHtml += `<br><br>تم أيضًا وضع ${rescuedCount} من الحصص المتبقية تلقائيًا بعد إغلاق الفجوات.`;
    }
    if (gapResult.filled > 0) {
      statusHtml += `<br><br>تم إغلاق ${gapResult.filled} فجوة تلقائيًا داخل جداول الشعب بإعادة ترتيب الحصص.`;
    }
    if (gapResult.remaining.length > 0) {
      statusType = 'warning';
      const shownGaps = gapResult.remaining.slice(0, 6).map(g => {
        const cls = state.timetable.activeClasses.find(c => c.key === g.classKey);
        const label = cls ? `${cls.grade} - ${cls.section}` : g.classKey;
        return `• ${label} — يوم ${g.day} — الحصة ${g.period}`;
      }).join('<br>');
      statusHtml += `<br><br><strong>فجوات تعذّر إغلاقها تلقائيًا:</strong><br>${shownGaps}`;
    }
    if (state.timetable.unpinned.length > 0) {
      statusType = 'warning';
      statusHtml += `<br><br>${state.timetable.unpinned.length} حصة لا تزال في قائمة "الحصص غير المثبّتة" أسفل الجدول، ليمكنك وضعها يدويًا.`;
    }

    setStatus(statusHtml, statusType);
  } catch (err) {
    setStatus(`تعذّر الاتصال بمحرّك التوليد: ${err.message || err}. يمكنك المحاولة مجددًا.`, 'error');
    toast('تعذّر توليد الجدول — راجع رسالة الحالة للتفاصيل.', 'error');
  } finally {
    hideGenerationOverlay();
    setGenerateButtonBusy(false);
    __generationInFlight = false;
  }
}

async function generateTimetableLocally() {
  const days = state.school.days;
  const maxPeriods = state.school.maxPeriods;

  if (days.length === 0) { setStatus('الرجاء تحديد يوم دوام واحد على الأقل في الخطوة الأولى.', 'error'); return; }

  const activeClasses = getActiveClassList();
  if (activeClasses.length === 0) { setStatus('لا توجد شعب مفعّلة. راجع الخطوة الثانية.', 'error'); return; }

  // نقاط تنفّس دورية بين المراحل الكبرى للتوليد المحلي (المرحلتين، كل محاولة ترتيب، إغلاق الفجوات، الإنقاذ)
  // — راجع createYielder لشرح لماذا هذا ضروري لتفادي تحذير "الصفحة لا تستجيب" في الحالات الصعبة
  const localYielder = createYielder();

  // 1. خريطة قيود التجميع المعرّفة
  const groupingMap = {};
  if (state.constraints && state.constraints.subjectGrouping) {
    state.constraints.subjectGrouping.forEach(g => {
      groupingMap[subjectGradeKey(g.subject, g.grade)] = true;
    });
  }

  // 1ب. قيد صارم: أوقات ممنوعة على معلم معيّن (لا يجوز جدولته فيها إطلاقًا)
  const teacherBlockSet = new Set();
  if (state.constraints && state.constraints.teacherBlocks) {
    state.constraints.teacherBlocks.forEach(b => {
      teacherBlockSet.add(`${b.teacherId}|${b.day}|${b.period}`);
    });
  }
  function isTeacherBlocked(tid, day, period) {
    return teacherBlockSet.has(`${tid}|${day}|${period}`);
  }

  // 1ج. توازن أرقام الحصص لكل معلم (افتراضي دائمًا، بلا أي إعداد يدوي مطلوب). بعض أرقام الحصص نادرة جدًا
  // (كحصة ثامنة يصل إليها صف واحد فقط بينما تتوقف بقية الصفوف عند السابعة) — طيّها ضمن أقرب رقم حصة شائع
  // فعليًا (يصل إليه صفّان مختلفان على الأقل) يمنع معاملتها كفئة توازن مستقلة لا معنى حقيقيًا لموازنتها
  function computePeriodBucketCeiling() {
    const gradesReachingPeriod = {}; // period -> Set(grade)
    const activeGrades = new Set(activeClasses.map(c => c.grade)); // الصفوف ذات الشعب المفعّلة فقط، لا كل صف مُعرَّف
    activeGrades.forEach(grade => {
      days.forEach(day => {
        const cap = getGradeDayCap(grade, day);
        for (let p = 1; p <= cap && p <= maxPeriods; p++) {
          gradesReachingPeriod[p] = gradesReachingPeriod[p] || new Set();
          gradesReachingPeriod[p].add(grade);
        }
      });
    });
    let ceiling = 1;
    for (let p = 1; p <= maxPeriods; p++) {
      const count = gradesReachingPeriod[p] ? gradesReachingPeriod[p].size : 0;
      if (count >= 2) ceiling = p;
    }
    return ceiling;
  }
  const periodBucketCeiling = computePeriodBucketCeiling();
  function periodBucket(p) { return Math.min(p, periodBucketCeiling); }

  const BALANCE_PENALTY = 6; // وزن العقوبة لكل مرة استُخدمت فيها فئة هذه الحصة مسبقًا لنفس المعلم
  const GAP_PENALTY = 9; // وزن العقوبة لكل حصة فارغة تسبق الحصة المُرشَّحة في نفس اليوم لنفس الشعبة (لتفادي الفجوات في جدول الشعبة)
  const DAY_FIT_WEIGHT = 12; // وزن تفضيل الأيام الأبعد عن سقفها اليومي، لضمان بلوغ كل يوم سقفه بالضبط عند انعدام الفائض الأسبوعي
  const TEACHER_DAY_BALANCE_WEIGHT = 6; // وزن تفادي تكديس حصص معلم في يوم واحد بينما أيام أخرى شبه فارغة له
  const teacherPeriodUsage = {}; // { teacherId: { bucket: count } }
  function teacherPeriodCount(tid, bucket) {
    return (teacherPeriodUsage[tid] && teacherPeriodUsage[tid][bucket]) || 0;
  }
  function bumpTeacherPeriodUsage(tid, bucket, delta) {
    teacherPeriodUsage[tid] = teacherPeriodUsage[tid] || {};
    teacherPeriodUsage[tid][bucket] = (teacherPeriodUsage[tid][bucket] || 0) + delta;
  }
  const teacherDayUsage = {}; // { teacherId: { day: count } }
  function teacherDayCount(tid, day) {
    return (teacherDayUsage[tid] && teacherDayUsage[tid][day]) || 0;
  }
  function bumpTeacherDayUsage(tid, day, delta) {
    teacherDayUsage[tid] = teacherDayUsage[tid] || {};
    teacherDayUsage[tid][day] = (teacherDayUsage[tid][day] || 0) + delta;
  }

  // 2. بناء قائمة المتطلبات (حصة مادة/معلم/شعبة)
  let requirements = [];
  const activeKeys = new Set(activeClasses.map(c => c.key));

  state.teachers.forEach(t => {
    t.assignments.forEach(a => {
      const key = classKey(a.grade, a.section);
      if (!activeKeys.has(key)) return;
      if (!state.subjects.includes(a.subject)) return;

      const weeklyPeriods = state.subjectPeriods[subjectGradeKey(a.subject, a.grade)] || 0;
      if (weeklyPeriods <= 0) return;

      const isGrouped = !!groupingMap[subjectGradeKey(a.subject, a.grade)];

      requirements.push({
        teacherId: t.id,
        teacherName: t.name,
        subject: a.subject,
        grade: a.grade,
        section: a.section,
        classKey: key,
        weeklyPeriods: weeklyPeriods,
        isGrouped: isGrouped,
        maxPerDay: isGrouped ? Math.min(maxPeriods, Math.max(2, Math.ceil(weeklyPeriods / Math.max(1, days.length - 1)))) : Math.max(1, Math.ceil(weeklyPeriods / days.length))
      });
    });
  });

  if (requirements.length === 0) {
    setStatus('لا توجد حصص معرّفة للمعلمين بعد. أضف المواد وتعيين المعلمين.', 'error');
    return;
  }

  // فحص طاقة الشعبة الاستيعابية (تحذير غير مانع)
  const warnings = [];
  const capacity = days.length * maxPeriods;
  const classLoad = {};
  requirements.forEach(r => { classLoad[r.classKey] = (classLoad[r.classKey] || 0) + r.weeklyPeriods; });
  Object.keys(classLoad).forEach(k => {
    if (classLoad[k] > capacity) {
      const [g, s] = k.split('___');
      warnings.push(`الشعبة "${g} - ${s}" يتطلب لها ${classLoad[k]} حصة أسبوعيًا، لكن السعة المتاحة ${capacity} فقط.`);
    }
  });

  // تحذير إضافي: هل تتسع الحدود اليومية المخصّصة لكل صف (الخطوة الثانية) لعدد حصصه الأسبوعية الفعلي؟
  const warnedGrades = new Set();
  Object.keys(classLoad).forEach(k => {
    const [g] = k.split('___');
    if (warnedGrades.has(g)) return;
    const gradeCapacity = days.reduce((s, d) => s + getGradeDayCap(g, d), 0);
    if (classLoad[k] > gradeCapacity) {
      warnedGrades.add(g);
      warnings.push(`الحدود اليومية المحدَّدة للصف "${g}" (الخطوة الثانية) تسمح بـ${gradeCapacity} حصة أسبوعيًا فقط، بينما يحتاج ${classLoad[k]} حصة — راجع جدول "الحد الأقصى اليومي للحصص لكل صف".`);
    }
  });

  const teacherLoad = {};
  requirements.forEach(r => { teacherLoad[r.teacherId] = (teacherLoad[r.teacherId] || 0) + r.weeklyPeriods; });
  Object.keys(teacherLoad).forEach(tid => {
    if (teacherLoad[tid] > capacity) {
      const t = state.teachers.find(x => x.id === tid);
      warnings.push(`المعلم "${t ? t.name : tid}" لديه ${teacherLoad[tid]} حصة أسبوعيًا، تتجاوز السعة المتاحة ${capacity}.`);
    }
  });

  // الحمل اليومي "العادل" لكل معلم، محسوبًا من نصابه الأسبوعي الفعلي هو تحديدًا (لا من متوسط عام موحَّد
  // لكل المعلمين) — معلم بحمل منخفض له هدف يومي أقل تبعًا لذلك، لا نفس هدف معلم بحمل كامل
  const teacherDailyTarget = {}; // { teacherId: { low, high } }
  Object.keys(teacherLoad).forEach(tid => {
    const total = teacherLoad[tid];
    teacherDailyTarget[tid] = {
      low: Math.floor(total / days.length),
      high: Math.ceil(total / days.length)
    };
  });

  // ترتيب المتطلبات: إعطاء الأولوية للمواد التي بها قيد تجميع، ثم المواد ذات الحصص الأكثر
  requirements.sort((a, b) => {
    if (a.isGrouped !== b.isGrouped) return b.isGrouped ? 1 : -1;
    return b.weeklyPeriods - a.weeklyPeriods;
  });

  const teacherBusy = {};
  const classBusy = {};
  const schedule = {};
  days.forEach(d => { schedule[d] = {}; for (let p = 1; p <= maxPeriods; p++) schedule[d][p] = {}; });

  function isTeacherFree(tid, day, period) { return !(teacherBusy[tid] && teacherBusy[tid][day] && teacherBusy[tid][day].has(period)); }
  function isClassFree(ck, day, period) { return !(classBusy[ck] && classBusy[ck][day] && classBusy[ck][day].has(period)); }

  function markTeacher(tid, day, period, on) {
    teacherBusy[tid] = teacherBusy[tid] || {};
    teacherBusy[tid][day] = teacherBusy[tid][day] || new Set();
    on ? teacherBusy[tid][day].add(period) : teacherBusy[tid][day].delete(period);
  }

  function markClass(ck, day, period, on) {
    classBusy[ck] = classBusy[ck] || {};
    classBusy[ck][day] = classBusy[ck][day] || new Set();
    on ? classBusy[ck][day].add(period) : classBusy[ck][day].delete(period);
  }

  // 1د. تثبيت حصص مادة في مكان محدد بالجدول (صف/شعبة + يوم + حصة) — قيد صارم يُطبَّق قبل بدء البحث،
  // ويُعاد تطبيقه أيضًا إذا لجأ المولّد للتوليد الاحتياطي (لأن ذلك المسار يصفّر الجدول بالكامل قبل إعادة بنائه)
  const fixedSlotKeys = new Set(); // "classKey|day|period" لحصص مثبّتة يدويًا، يجب ألا يحرّكها أي تحسين لاحق
  let applyFixedPlacements = () => {}; // دالة افتراضية لا تفعل شيئًا إن لم توجد أي حصص مثبّتة
  const fixedList = (state.constraints && state.constraints.fixedPlacements) || [];
  if (fixedList.length > 0) {
    const fixedErrors = [];
    const slotSubjectMap = {}; // "classKey|day|period" -> subject (لاكتشاف تعارض مادتين في نفس الخانة)
    const slotTeacherMap = {}; // "teacherId|day|period" -> classKey (لاكتشاف تعارض معلم في شعبتين معًا بنفس الوقت)
    const perReqFixed = {}; // reqIdx -> [{day,period}]

    fixedList.forEach(f => {
      const cls = activeClasses.find(c => c.key === f.classKey);
      const classLabel = cls ? `${cls.grade} - ${cls.section}` : f.classKey;

      const slotKey = `${f.classKey}|${f.day}|${f.period}`;
      if (slotSubjectMap[slotKey] && slotSubjectMap[slotKey] !== f.subject) {
        fixedErrors.push(`تعارض: تم تثبيت أكثر من مادة في نفس الخانة (${classLabel} — يوم ${f.day} — الحصة ${f.period}).`);
        return;
      }
      slotSubjectMap[slotKey] = f.subject;

      const reqIdx = requirements.findIndex(r => r.classKey === f.classKey && r.subject === f.subject);
      if (reqIdx === -1) {
        fixedErrors.push(`تعذّر تثبيت مادة "${f.subject}" (${classLabel}): لا يوجد معلم معيّن لتدريسها لهذه الشعبة.`);
        return;
      }
      const req = requirements[reqIdx];

      if (isTeacherBlocked(req.teacherId, f.day, f.period)) {
        fixedErrors.push(`تعارض: مادة "${f.subject}" مثبّتة يوم ${f.day} الحصة ${f.period}، لكن معلمها "${req.teacherName}" ممنوع من التدريس في هذا الوقت حسب قيد آخر.`);
        return;
      }

      const teacherSlotKey = `${req.teacherId}|${f.day}|${f.period}`;
      if (slotTeacherMap[teacherSlotKey] && slotTeacherMap[teacherSlotKey] !== f.classKey) {
        fixedErrors.push(`تعارض: المعلم "${req.teacherName}" مثبّت في شعبتين مختلفتين في نفس الوقت (يوم ${f.day} — الحصة ${f.period}).`);
        return;
      }
      slotTeacherMap[teacherSlotKey] = f.classKey;

      perReqFixed[reqIdx] = perReqFixed[reqIdx] || [];
      if (perReqFixed[reqIdx].some(x => x.day === f.day && x.period === f.period)) return; // تكرار مطابق، يُتجاهَل بصمت
      perReqFixed[reqIdx].push({ day: f.day, period: f.period });
    });

    Object.keys(perReqFixed).forEach(reqIdxStr => {
      const reqIdx = parseInt(reqIdxStr, 10);
      const req = requirements[reqIdx];
      if (perReqFixed[reqIdx].length > req.weeklyPeriods) {
        fixedErrors.push(`تعذّر تثبيت مادة "${req.subject}" (${req.grade} - ${req.section}): عدد الحصص المثبّتة (${perReqFixed[reqIdx].length}) يتجاوز نصابها الأسبوعي (${req.weeklyPeriods}).`);
      }
    });

    if (fixedErrors.length > 0) {
      const shown = fixedErrors.slice(0, 6).join('<br>');
      const extra = fixedErrors.length > 6 ? `<br>... و${fixedErrors.length - 6} تعارضًا إضافيًا.` : '';
      setStatus('تعذّر توليد الجدول بسبب تعارض في الحصص المثبّتة (راجع الخطوة الرابعة):<br>' + shown + extra, 'error');
      return;
    }

    // لا تعارضات — نجهّز دالة تثبيت الحصص لتُستخدم قبل البحث الرجعي، وتُعاد أيضًا عند اللجوء للتوليد الاحتياطي
    applyFixedPlacements = function () {
      Object.keys(perReqFixed).forEach(reqIdxStr => {
        const reqIdx = parseInt(reqIdxStr, 10);
        const req = requirements[reqIdx];
        const presetDailyCounts = {};
        perReqFixed[reqIdx].forEach(({ day, period }) => {
          markTeacher(req.teacherId, day, period, true);
          markClass(req.classKey, day, period, true);
          schedule[day][period][req.classKey] = { teacher: req.teacherName, subject: req.subject, teacherId: req.teacherId };
          presetDailyCounts[day] = (presetDailyCounts[day] || 0) + 1;
          fixedSlotKeys.add(`${req.classKey}|${day}|${period}`);
        });
        req.presetPlacedCount = perReqFixed[reqIdx].length;
        req.presetDailyCounts = presetDailyCounts;
      });
    };
    // ملاحظة: لا يُستدعى applyFixedPlacements() هنا مباشرة — كل محاولة توليد (بالترتيب الافتراضي أو أي ترتيب
    // بديل لاحقًا) تبدأ بتصفير الجدول ثم استدعائه من جديد عبر resetAttemptState()، فتُطبَّق الحصص المثبّتة
    // بالتساوي على كل محاولة دون تكرار غير ضروري في الحالة الشائعة (بلا حصص مثبّتة أصلًا).
  }

  let iterations = 0;
  const ITER_LIMIT = 400000; // سقف محاولات لكل ترتيب على حدة (انظر orderingStrategies أدناه)
  let aborted = false;
  // ميزانية زمنية إجمالية مشتركة بين كل محاولات الترتيب البديلة معًا (وليست لكل محاولة على حدة)، لضمان أن
  // إضافة ترتيبات بديلة لا تُطيل وقت الاستجابة بشكل غير محدود في الحالات الصعبة أصلًا — إن استُنفدت، تتوقف
  // المحاولات الحالية والمتبقية فورًا وينتقل التوليد مباشرة للمسار الاحتياطي المرن
  const generationDeadline = Date.now() + 3000;

  // الترتيب الذي يسير عليه البحث الرجعي الحالي — يتغيّر بين محاولة وأخرى (انظر حلقة orderingStrategies بالأسفل)،
  // لذا يعتمد عليه backtrackAll/placeReq بدل الاعتماد مباشرة على مصفوفة requirements الثابتة
  let currentOrder = requirements;

  function backtrackAll(idx) {
    if (idx === currentOrder.length) return true;
    const req = currentOrder[idx];
    return placeReq(idx, req.presetPlacedCount || 0, Object.assign({}, req.presetDailyCounts || {}));
  }

  function placeReq(reqIdx, placedCount, dailyCounts) {
    iterations++;
    if (iterations > ITER_LIMIT) { aborted = true; return false; }
    if ((iterations & 2047) === 0 && Date.now() > generationDeadline) { aborted = true; return false; }
    const req = currentOrder[reqIdx];
    if (placedCount === req.weeklyPeriods) return backtrackAll(reqIdx + 1);

    const candidates = [];
    days.forEach((day, di) => {
      const currentCount = dailyCounts[day] || 0;
      if (currentCount >= req.maxPerDay) return;

      // قيد صارم: الحد الأقصى اليومي لعدد حصص هذا الصف تحديدًا في هذا اليوم (من إعدادات الخطوة الثانية)،
      // محسوب على إجمالي حصص الشعبة من كل المواد في هذا اليوم، لا حصص هذه المادة فقط
      const gradeDayCap = getGradeDayCap(req.grade, day);
      const classDayTotal = (classBusy[req.classKey] && classBusy[req.classKey][day]) ? classBusy[req.classKey][day].size : 0;
      if (classDayTotal >= gradeDayCap) return;

      for (let p = 1; p <= maxPeriods; p++) {
        if (isTeacherBlocked(req.teacherId, day, p)) continue; // قيد صارم: وقت ممنوع لهذا المعلم
        if (isTeacherFree(req.teacherId, day, p) && isClassFree(req.classKey, day, p)) {
          let score = 0;

          // إذا كانت المادة محددة للتجميع، يتم إعطاء تفضيل وأولوية قصوى للحصص المتتالية في نفس اليوم
          if (req.isGrouped && currentCount > 0) {
            const isPrevSame = (p > 1 && schedule[day][p - 1][req.classKey] && schedule[day][p - 1][req.classKey].subject === req.subject);
            const isNextSame = (p < maxPeriods && schedule[day][p + 1][req.classKey] && schedule[day][p + 1][req.classKey].subject === req.subject);
            if (isPrevSame || isNextSame) {
              score -= 1000; // أولوية مرتفعة جداً للتتابع المباشر
            }
          }

          // توازن أرقام الحصص: كلما زاد عدد مرات وضع هذا المعلم في فئة هذه الحصة تحديدًا سابقًا، زادت "كلفة"
          // اختيارها مجددًا، ما يدفع الخوارزمية لتوزيع حصصه على أرقام حصص مختلفة عبر الأسبوع بدل تكرار نفس
          // الرقم — تلقائيًا لكل معلم، بلا حاجة لأي إعداد يدوي (وبمعزل عن معلمين آخرين: كل معلم يُقاس مقابل
          // نمط توزيعه هو فقط)
          score += teacherPeriodCount(req.teacherId, periodBucket(p)) * BALANCE_PENALTY;

          // تفادي الفجوات: كلما زاد عدد الحصص الفارغة قبل هذه الحصة في نفس اليوم لهذه الشعبة، زادت كلفة اختيارها،
          // ما يدفع الخوارزمية لملء حصص الشعبة تصاعديًا (١، ٢، ٣...) دون ترك فراغ في المنتصف (مثل حصة فارغة بين حصتين مشغولتين)
          let gapCount = 0;
          for (let q = 1; q < p; q++) {
            if (!schedule[day][q][req.classKey]) gapCount++;
          }
          score += gapCount * GAP_PENALTY;

          // توازن توزيع الأسبوع: نحسب عدد الحصص المشغولة فعليًا في هذا اليوم لكل من الشعبة والمعلم
          // (من أي مادة، وليس فقط هذا المتطلب) لتفادي تكديس الحصص في أول أيام الأسبوع
          const classDayLoad = (classBusy[req.classKey] && classBusy[req.classKey][day]) ? classBusy[req.classKey][day].size : 0;
          const teacherDayLoad = (teacherBusy[req.teacherId] && teacherBusy[req.teacherId][day]) ? teacherBusy[req.teacherId][day].size : 0;

          // أولوية أهم من مجرّد "الأخف عبئًا": تفضيل اليوم الأبعد عن سقفه اليومي لهذا الصف (المتبقي له أكبر)،
          // وليس فقط الأقل ازدحامًا بصرف النظر عن سقف كل يوم. هذا حاسم عندما تكون الحدود اليومية "بلا فائض"
          // (مجموعها الأسبوعي = الحمل المطلوب بالضبط تمامًا، وهي الحالة الافتراضية المقترحة في جدول "الحد
          // الأقصى اليومي للحصص لكل صف") — عندها يجب أن يبلغ كل يوم سقفه بالضبط لا محالة. تفضيل الأيام الأقل
          // ازدحامًا وحده (بصرف النظر عن اختلاف سقف كل يوم) يُشبع الأيام ذات السقف المنخفض مبكرًا بينما تبقى
          // الأيام ذات السقف المرتفع شبه فارغة، فيتعذّر لاحقًا إكمالها بعد نفاد حصص مواد أخرى في أماكن أخرى
          const remainingDayCapacity = getGradeDayCap(req.grade, day) - classDayLoad;
          // إدماج هذا العامل ضمن النقاط مباشرة (لا فقط كترجيح لاحق عند تعادل النقاط)، بوزن مقارب لوزن تفادي
          // الفجوات — ليكون مؤثرًا فعليًا في القرار من البداية، لا مجرد كاسر تعادل نادر التأثير عمليًا
          score -= remainingDayCapacity * DAY_FIT_WEIGHT;

          // توازن الحمل اليومي لهذا المعلم تحديدًا، بمعيارين معًا لا عقوبة تجاوز فقط:
          //   • عقوبة تجاوز هدفه اليومي الأعلى "العادل" (المحسوب من نصابه الأسبوعي هو) — تفادي التكديس.
          //   • تفضيل إيجابي (خفض نقاط) لأي يوم ما يزال دون هدفه الأدنى بعد — بلا هذا الشق، لا فرق في نظر
          //     الخوارزمية بين يوم فارغ تمامًا له ويوم فيه له حصتان بالفعل طالما كلاهما لم يتجاوز السقف
          //     بعد، فتميل لملء الأيام بترتيبها بدل توزيع حصصه عبرها فعليًا (وهو بالضبط ما كان يحدث قبل
          //     إضافة هذا الشق: تكديس في الأيام الأولى وترك يوم أخير بلا أي حصة رغم توفر سعة فيه)
          const teacherTarget = teacherDailyTarget[req.teacherId];
          if (teacherTarget) {
            const overshoot = Math.max(0, (teacherDayLoad + 1) - teacherTarget.high);
            const underfillBonus = teacherDayLoad < teacherTarget.low ? -(teacherTarget.low - teacherDayLoad) : 0;
            score += (overshoot + underfillBonus) * TEACHER_DAY_BALANCE_WEIGHT;
          }

          candidates.push({ day, p, di, count: currentCount, score, remainingDayCapacity, dayLoad: classDayLoad + teacherDayLoad });
        }
      }
    });

    // ترتيب المرشحات: التتابع أولاً، ثم الأبعد عن سقفه اليومي (الأكثر احتياجًا للامتلاء)، ثم الأقل تكرارًا
    // لهذا المتطلب في اليوم، ثم الأيام الأقل ازدحامًا عمومًا، ثم رقم الحصة، وأخيرًا ترتيب الأيام (لضمان نتيجة
    // حتمية عند تساوي كل شيء)
    candidates.sort((a, b) => a.score - b.score || (b.remainingDayCapacity - a.remainingDayCapacity) || a.count - b.count || a.dayLoad - b.dayLoad || a.p - b.p || a.di - b.di);

    for (const c of candidates) {
      if (aborted) return false;
      markTeacher(req.teacherId, c.day, c.p, true);
      markClass(req.classKey, c.day, c.p, true);
      schedule[c.day][c.p][req.classKey] = { teacher: req.teacherName, subject: req.subject, teacherId: req.teacherId };
      dailyCounts[c.day] = (dailyCounts[c.day] || 0) + 1;
      bumpTeacherPeriodUsage(req.teacherId, periodBucket(c.p), 1);
      bumpTeacherDayUsage(req.teacherId, c.day, 1);

      if (placeReq(reqIdx, placedCount + 1, dailyCounts)) return true;

      bumpTeacherPeriodUsage(req.teacherId, periodBucket(c.p), -1);
      bumpTeacherDayUsage(req.teacherId, c.day, -1);
      dailyCounts[c.day]--;
      delete schedule[c.day][c.p][req.classKey];
      markTeacher(req.teacherId, c.day, c.p, false);
      markClass(req.classKey, c.day, c.p, false);
    }
    return false;
  }

  // يصفّر الجدول وخرائط الانشغال بالكامل استعدادًا لمحاولة توليد جديدة، ثم يعيد تطبيق الحصص المثبّتة يدويًا
  // فورًا (قبل بدء أي بحث) حتى تبقى حاضرة كنقطة انطلاق ثابتة في كل محاولة على حدة
  function resetAttemptState() {
    days.forEach(d => { schedule[d] = {}; for (let p = 1; p <= maxPeriods; p++) schedule[d][p] = {}; });
    Object.keys(teacherBusy).forEach(k => delete teacherBusy[k]);
    Object.keys(classBusy).forEach(k => delete classBusy[k]);
    Object.keys(teacherPeriodUsage).forEach(k => delete teacherPeriodUsage[k]);
    applyFixedPlacements();
  }

  // ═══════════════════════════════════════════════════════════════
  // محاولات متعددة بترتيبات أولوية مختلفة لنفس المتطلبات — إن فشل الترتيب الافتراضي في إيجاد جدول كامل
  // خالٍ من التعارضات خلال ميزانية المحاولات (ITER_LIMIT)، تُجرَّب ترتيبات بديلة قبل اللجوء للتوليد
  // الاحتياطي المرن (الذي يضمن حلًا لكنه قد يترك حصصًا غير موضوعة). كل ترتيب هو نفس خوارزمية البحث الرجعي
  // بالضبط، فقط بترتيب مختلف لأولوية "أي متطلب يُعالَج أولًا" — أحيانًا يكفي هذا وحده لإيجاد حل كامل كان
  // الترتيب الافتراضي سيحتاج معه لتراجع أعمق مما يسمح به سقف المحاولات.
  const orderingStrategies = [
    {
      name: 'الترتيب الافتراضي (المواد المجمّعة أولًا، فالأكثر حصصًا أسبوعيًا)',
      compare: (a, b) => (a.isGrouped !== b.isGrouped) ? (b.isGrouped ? 1 : -1) : (b.weeklyPeriods - a.weeklyPeriods)
    },
    {
      name: 'المعلمون الأكثر ازدحامًا أولًا',
      compare: (a, b) => {
        if (a.isGrouped !== b.isGrouped) return b.isGrouped ? 1 : -1;
        const loadDiff = (teacherLoad[b.teacherId] || 0) - (teacherLoad[a.teacherId] || 0);
        return loadDiff !== 0 ? loadDiff : (b.weeklyPeriods - a.weeklyPeriods);
      }
    },
    {
      name: 'المواد الأقل حصصًا أسبوعيًا أولًا',
      compare: (a, b) => (a.isGrouped !== b.isGrouped) ? (b.isGrouped ? 1 : -1) : (a.weeklyPeriods - b.weeklyPeriods)
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  // محاولة أولى: التوليد بمرحلتين (تحديد الأيام أولاً بمعزل عن تعارضات المعلمين، ثم تحديد الحصص داخل كل
  // يوم بمعالجة التعارضات). أرخص وأكثر ملاءمة للحالات "بلا فائض أسبوعي" (حيث مجموع الحدود اليومية = الحمل
  // المطلوب بالضبط) التي تُتعب البحث الرجعي التقليدي أعلاه. انظر شرح الدالتين لاحقًا في الملف.
  resetAttemptState(); // يملأ presetPlacedCount/presetDailyCounts على كل متطلب، ويهيئ الجدول بالحصص المثبّتة فقط
  const twoPhaseDeadline = Date.now() + 3000;
  const twoPhaseResult = attemptTwoPhaseGeneration(requirements, days, maxPeriods, schedule, teacherBusy, twoPhaseDeadline);

  let success = false;
  let successStrategyIndex = -1;
  const strategyAttemptsLog = []; // لتسجيل ما جُرِّب فعليًا من الترتيبات ونتيجته، لعرضه للمستخدم لاحقًا مهما كانت النتيجة
  let usedTwoPhase = false;

  if (twoPhaseResult.success) {
    success = true;
    usedTwoPhase = true;
  } else {
    for (let s = 0; s < orderingStrategies.length; s++) {
      if (Date.now() > generationDeadline) break; // انتهت الميزانية الزمنية المشتركة — لا داعٍ لبدء محاولة جديدة
      await localYielder(); // نقطة تنفّس بين كل محاولة ترتيب وأخرى (كل محاولة نفسها تبقى متزامنة داخليًا)
      currentOrder = requirements.slice().sort(orderingStrategies[s].compare);
      iterations = 0;
      aborted = false;
      resetAttemptState();
      const ok = backtrackAll(0);
      strategyAttemptsLog.push({ name: orderingStrategies[s].name, success: ok, aborted });
      if (ok) { success = true; successStrategyIndex = s; break; }
    }
  }

  let unplacedItems = []; // كل حصة تعذّر وضعها تصبح عنصرًا في "الحصص غير المثبّتة" ليضعها المستخدم يدويًا

  // في حال فشلت كل ترتيبات البحث الرجعي، يتم استخدام التوليد المرن الاحتياطي
  if (!success) {
    resetAttemptState();

    requirements.forEach(req => {
      let placed = req.presetPlacedCount || 0; // الحصص المثبّتة مسبقًا مُحتسَبة، لا حاجة لإعادة وضعها
      const dailyCounts = Object.assign({}, req.presetDailyCounts || {});

      // نرتّب الأيام حسب الأخف ازدحامًا حاليًا (للشعبة والمعلم معًا) بدل الترتيب الثابت،
      // لتفادي حشر الحصص في أول أيام الأسبوع وتوزيعها بشكل أقرب للتساوي
      const orderedDays = days.slice().sort((d1, d2) => {
        const load1 = ((classBusy[req.classKey] && classBusy[req.classKey][d1]) ? classBusy[req.classKey][d1].size : 0)
          + ((teacherBusy[req.teacherId] && teacherBusy[req.teacherId][d1]) ? teacherBusy[req.teacherId][d1].size : 0);
        const load2 = ((classBusy[req.classKey] && classBusy[req.classKey][d2]) ? classBusy[req.classKey][d2].size : 0)
          + ((teacherBusy[req.teacherId] && teacherBusy[req.teacherId][d2]) ? teacherBusy[req.teacherId][d2].size : 0);
        return load1 - load2;
      });

      outer:
      for (let pass = 0; pass < 2; pass++) {
        for (const day of orderedDays) {
          if (placed >= req.weeklyPeriods) break outer;
          if (pass === 0 && (dailyCounts[day] || 0) >= req.maxPerDay) continue;

          for (let p = 1; p <= maxPeriods; p++) {
            if (placed >= req.weeklyPeriods) break outer;
            if (pass === 0 && (dailyCounts[day] || 0) >= req.maxPerDay) break; // توقف عن هذا اليوم فور بلوغ الحد الأقصى المسموح لكل يوم
            // قيد صارم أيضًا في المسار الاحتياطي: لا نتجاوز الحد الأقصى اليومي لهذا الصف مهما حدث
            const gradeDayCap = getGradeDayCap(req.grade, day);
            const classDayTotal = (classBusy[req.classKey] && classBusy[req.classKey][day]) ? classBusy[req.classKey][day].size : 0;
            if (classDayTotal >= gradeDayCap) break;
            if (isTeacherBlocked(req.teacherId, day, p)) continue;
            if (isTeacherFree(req.teacherId, day, p) && isClassFree(req.classKey, day, p)) {
              markTeacher(req.teacherId, day, p, true);
              markClass(req.classKey, day, p, true);
              schedule[day][p][req.classKey] = { teacher: req.teacherName, subject: req.subject, teacherId: req.teacherId };
              dailyCounts[day] = (dailyCounts[day] || 0) + 1;
              placed++;
            }
          }
        }
      }

      if (placed < req.weeklyPeriods) {
        const missing = req.weeklyPeriods - placed;
        for (let i = 0; i < missing; i++) {
          unplacedItems.push({ classKey: req.classKey, teacher: req.teacherName, subject: req.subject, teacherId: req.teacherId });
        }
      }
    });
  }

  state.timetable = { schedule, days, maxPeriods, activeClasses, unpinned: unplacedItems };
  markDirty();
  renderTimetableOutput();

  // خطوة منفصلة بعد التوليد: إغلاق الفجوات الداخلية (حصة فارغة بين حصتين مشغولتين) قدر الإمكان.
  // هذه عملية مستقلة تمامًا عن خوارزمية التوليد أعلاه (انظر runGapCompactionPass لاحقًا في الملف) — يمكن
  // تطويرها أو تحسينها بمعزل عن البحث الرجعي الأساسي، وتُستدعى أيضًا يدويًا من زر "دمج الفراغات" بعد أي تعديل يدوي.
  let gapResult = await runGapCompactionPass();

  // محاولة أخيرة قبل عرض النتيجة للمستخدم: أي حصة ما تزال في "الحصص غير المثبّتة" تُختبر أولًا على أي خانة
  // فارغة صالحة فعليًا في الجدول النهائي، وإن لم توجد، تُجرَّب "إزاحة متسلسلة" (chain relocation) — نقل حصة
  // أخرى مشغولة في نفس الشعبة إلى فراغ آخر يناسبها لتحرير مكان للحصة العالقة، وقد يتسلسل ذلك عدة مستويات
  // (انظر attemptChainRelocation لاحقًا في الملف). هذه ليست مجرد إعادة محاولة للتوليد الاحتياطي — فالتوليد
  // الاحتياطي يمر على المتطلبات مرة واحدة فقط بترتيب ثابت ولا يعود لمراجعة خانات فاتته أو لإعادة ترتيب ما
  // وضعه بالفعل، بينما هذه المحاولة تعمل على النتيجة النهائية مباشرة بعد إغلاق الفجوات. إن نجحت أي حصة،
  // تُعاد محاولة إغلاق الفجوات مرة أخرى احتياطًا (الإزاحة قد تفتح فجوة صغيرة في مكان آخر نادرًا).
  const CHAIN_RELOCATION_MAX_DEPTH = 3;
  const rescuedCount = await rescueUnplacedItems(CHAIN_RELOCATION_MAX_DEPTH);
  if (rescuedCount > 0) {
    const secondGapPass = await runGapCompactionPass();
    gapResult = { filled: gapResult.filled + secondGapPass.filled, remaining: secondGapPass.remaining };
  }

  // إعادة بناء قائمة "تعذّر وضعها" من الحصص المتبقية فعليًا بعد الإنقاذ أعلاه، لا من محاولة التوليد الاحتياطي
  // الأولى — حتى لا يُخبَر المستخدم بحصص تعذّر وضعها بينما هي موجودة بالفعل في الجدول الآن
  const stillUnplaced = state.timetable.unpinned;
  const unplacedSummary = [];
  if (stillUnplaced.length > 0) {
    const counts = {};
    stillUnplaced.forEach(it => {
      const k = `${it.classKey}|||${it.subject}|||${it.teacher}`;
      counts[k] = (counts[k] || 0) + 1;
    });
    Object.keys(counts).forEach(k => {
      const [ck, subject, teacher] = k.split('|||');
      const cls = activeClasses.find(c => c.key === ck);
      const label = cls ? `${cls.grade} - ${cls.section}` : ck;
      const req = requirements.find(r => r.classKey === ck && r.subject === subject && r.teacherName === teacher);
      const totalNote = req ? ` من أصل ${req.weeklyPeriods}` : '';
      unplacedSummary.push(`${teacher} — ${subject} (${label}): تعذّر وضع ${counts[k]}${totalNote} حصة.`);
    });
  }

  let statusHtml = '';
  let statusType = 'success';
  if (success) {
    statusHtml = `تم توليد جدول كامل وخالٍ من التعارضات لجميع الحصص (${requirements.reduce((s, r) => s + r.weeklyPeriods, 0)} حصة).`;
    if (usedTwoPhase) {
      statusHtml += `<br><small>(تم التوليد بأسلوب المرحلتين: تحديد توزيع الأيام أولًا ثم الحصص داخل كل يوم — أسرع من البحث الرجعي التقليدي في حال انعدام الفائض الأسبوعي.)</small>`;
    } else if (successStrategyIndex > 0) {
      statusHtml += `<br><small>(تعذّر الترتيب الافتراضي للأولويات، فتم إيجاد الحل عبر ترتيب بديل: "${orderingStrategies[successStrategyIndex].name}".)</small>`;
    }
  } else if (stillUnplaced.length === 0) {
    // فشلت كل محاولات البحث الرجعي، لكن التوليد الاحتياطي ثم الإنقاذ التلقائي نجحا معًا في وضع كل الحصص رغم ذلك
    statusHtml = `تم توليد جدول كامل لجميع الحصص (${requirements.reduce((s, r) => s + r.weeklyPeriods, 0)} حصة) عبر المسار الاحتياطي بعد تعذّر الترتيبات الأساسية.`;
  } else {
    statusType = 'warning';
    statusHtml = `تم توليد أفضل جدول ممكن، لكن تعذّر وضع بعض الحصص دون تعارض:<br>` + unplacedSummary.slice(0, 8).map(x => '• ' + x).join('<br>');
    if (unplacedSummary.length > 8) statusHtml += `<br>… و${unplacedSummary.length - 8} حالة إضافية.`;
    statusHtml += `<br><br>تمت إضافة هذه الحصص إلى قائمة "الحصص غير المثبّتة" أسفل الجدول، ليمكنك سحبها أو النقر عليها لوضعها يدويًا في خانة مناسبة.`;
  }

  // شفافية: أي ترتيبات أولوية جُرِّبت فعليًا وما نتيجة كل منها — تُعرض دائمًا عند وجود أكثر من محاولة، نجحت
  // الأولى أم لا، حتى يعرف المستخدم أن البحث لم يتوقف عند أول محاولة فاشلة فحسب
  if (strategyAttemptsLog.length > 1 || (strategyAttemptsLog.length === 1 && !strategyAttemptsLog[0].success)) {
    const triedLines = strategyAttemptsLog.map((a, i) =>
      `${i + 1}. ${a.name}: ${a.success ? 'نجح ✓' : (a.aborted ? 'تعذّر (استُنفدت المحاولات)' : 'تعذّر')}`
    ).join('<br>');
    const skippedNote = strategyAttemptsLog.length < orderingStrategies.length
      ? `<br>(لم تُجرَّب باقي الترتيبات لانتهاء الميزانية الزمنية المخصصة للبحث.)` : '';
    statusHtml += `<br><br><small><strong>ترتيبات الأولوية المجرَّبة:</strong><br>${triedLines}${skippedNote}</small>`;
  }

  if (rescuedCount > 0) {
    statusHtml += `<br><br>تم أيضًا وضع ${rescuedCount} من الحصص المتبقية تلقائيًا (مباشرة في خانة فارغة، أو بإزاحة حصة أخرى لمكان آخر لإفساح المجال لها) بعد إغلاق الفجوات.`;
  }

  if (gapResult.filled > 0) {
    statusHtml += `<br><br>تم إغلاق ${gapResult.filled} فجوة تلقائيًا داخل جداول الشعب بإعادة ترتيب الحصص.`;
  }
  if (gapResult.remaining.length > 0) {
    statusType = statusType === 'success' ? 'warning' : statusType;
    const shownGaps = gapResult.remaining.slice(0, 6).map(g => {
      const cls = activeClasses.find(c => c.key === g.classKey);
      const label = cls ? `${cls.grade} - ${cls.section}` : g.classKey;
      return `• ${label} — يوم ${g.day} — الحصة ${g.period}`;
    }).join('<br>');
    const extra = gapResult.remaining.length > 6 ? `<br>… و${gapResult.remaining.length - 6} فجوة إضافية.` : '';
    statusHtml += `<br><br><strong>فجوات تعذّر إغلاقها تلقائيًا (بسبب تعارض أوقات المعلمين أو حصص مثبّتة):</strong><br>${shownGaps}${extra}`;
  }

  if (warnings.length) {
    statusHtml += `<br><br><strong>تنبيهات السعة:</strong><br>` + warnings.map(w => '• ' + w).join('<br>');
    if (statusType === 'success') statusType = 'warning';
  }

  setStatus(statusHtml, statusType);
}

// ═══════════════════════════════════════════════════════════════
// إغلاق فجوات الجدول (Gap Compaction) — عملية منفصلة تمامًا عن خوارزمية التوليد أعلاه
// ═══════════════════════════════════════════════════════════════
// تعمل مباشرة على state.timetable.schedule (النتيجة النهائية المحفوظة)، بعد التوليد أو بعد أي تعديل يدوي.
// الفكرة: لكل شعبة ولكل يوم، إن وُجدت حصة فارغة بين حصتين مشغولتين ("فجوة داخلية")، حاول إعادة ترتيب حصص
// ذلك اليوم (ضمن المقطع المحصور بين الحصص المثبّتة يدويًا إن وُجدت) بحيث تتراص الحصص من بداية اليوم دون فجوات،
// وتنتقل أي حصة فارغة متبقية إلى نهاية اليوم (حيث لا تُعتبر "فجوة").
//
// القيود الصارمة التي لا تُخترق أبدًا:
//   • الحصص المثبّتة يدويًا (تثبيت حصة في مكان محدد) لا تُحرَّك إطلاقًا، وتُعامل كحاجز يقسّم اليوم إلى مقاطع منفصلة.
//   • لا تُنقل حصة معلم إلى وقت مدرج ضمن "أوقات ممنوعة" لذلك المعلم تحديدًا.
//   • لا يجوز أن يتعارض معلم مع نفسه في شعبتين مختلفتين بنفس الوقت (نفس فحص canPlaceAt المستخدم في التعديل اليدوي).
//   • مادة مضبوطة على "تجميع حصص مادة في نفس اليوم" تبقى حصصها المتتالية كتلة واحدة لا تتفكك أثناء إعادة الترتيب.
// أما "توازن حصص فترة معينة بين المعلمين" فهو قيد ليّن بطبيعته (يخص توزيع الأسبوع ككل)، ولا يوجد ما يمنع إعادة
// الترتيب هنا من تحسينه لاحقًا؛ يمكن إضافة تفضيل له مستقبلًا كطبقة تحسين إضافية فوق هذا الأساس دون التأثير عليه.
// ═══════════════════════════════════════════════════════════════
// التوليد بمرحلتين (Two-Phase Generation) — بديل يُجرَّب أولًا قبل البحث الرجعي التقليدي
// ═══════════════════════════════════════════════════════════════
// الفكرة: بدل حل مشكلة "أي يوم؟" و"أي حصة تعارض معلمًا؟" معًا دفعة واحدة (كما يفعل البحث الرجعي التقليدي)،
// نفصلهما إلى مرحلتين أسهل بكثير كل على حدة:
//   المرحلة ١ (توزيع الأيام): لكل شعبة على حدة، حدّد كم حصة من كل مادة تقع في كل يوم، بمعزل تام عن تعارضات
//     المعلمين — مجرد "حزم" أعداد صحيحة ضمن حدود يومية معروفة. هذا سريع جدًا (تجربة عملية: أجزاء من الثانية)
//     لأنه لا يتعامل مع أي شعبة أو معلم آخر إطلاقًا في هذه الخطوة.
//   المرحلة ٢ (توزيع الحصص): يومًا بيوم، بعد أن بات معروفًا بالضبط كم حصة تحتاجها كل شعبة في هذا اليوم تحديدًا،
//     وزّع تلك الحصص على أرقام حصص فعلية (١..الحد الأقصى) بلا تعارض معلمين بين الشعب المختلفة. بما أن إجمالي
//     حصص كل شعبة في اليوم بات معروفًا مسبقًا، تُختار دائمًا أول N حصة شاغرة بالترتيب كهدف — ما يضمن عدم وجود
//     أي فجوة داخلية إطلاقًا دون الحاجة لأي معالجة لاحقة، لأنه ببساطة لا مجال لحدوثها بهذا البناء.
// هذا الفصل يجعل كل مرحلة على حدة أسهل بكثير من المسألة المدمجة التي يحلّها البحث الرجعي التقليدي دفعة واحدة،
// وهو تحديدًا ما يعالج حالات "انعدام الفائض الأسبوعي" (مجموع الحدود اليومية = الحمل المطلوب بالضبط) التي
// تُتعب ذلك البحث التقليدي رغم كل تحسينات الترتيب المطبَّقة عليه.
//
// إن فشلت أي مرحلة لأي شعبة أو يوم، تُلغى المحاولة بأكملها فورًا (بلا نتائج جزئية) ويُترك الأمر للبحث الرجعي
// التقليدي كما كان يعمل تمامًا من قبل — هذا الأسلوب إضافة تُجرَّب أولًا، لا استبدال يُغامَر به.

function attemptTwoPhaseGeneration(requirements, days, maxPeriods, schedule, teacherBusy, deadline) {
  // ── المرحلة ١: توزيع الأيام لكل شعبة على حدة ──
  const byClass = {};
  requirements.forEach(req => { (byClass[req.classKey] = byClass[req.classKey] || []).push(req); });

  for (const classKey in byClass) {
    if (Date.now() > deadline) return { success: false, reason: 'انتهت الميزانية الزمنية أثناء المرحلة الأولى (توزيع الأيام).' };
    const reqs = byClass[classKey];
    const grade = reqs[0].grade;

    // السعة المتبقية لكل يوم لهذه الشعبة بعد خصم ما هو مثبّت يدويًا فعلاً (من أي مادة)
    const fixedPerDay = {};
    days.forEach(d => {
      fixedPerDay[d] = reqs.reduce((s, r) => s + ((r.presetDailyCounts && r.presetDailyCounts[d]) || 0), 0);
    });
    const remainCap = {};
    days.forEach(d => { remainCap[d] = getGradeDayCap(grade, d) - fixedPerDay[d]; });

    const needList = reqs
      .map(r => ({ req: r, remaining: r.weeklyPeriods - (r.presetPlacedCount || 0) }))
      .filter(x => x.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining); // الأكبر أولًا (أكثر تقييدًا) — استرشادي فقط

    const dayIndex = {};
    days.forEach((d, i) => { dayIndex[d] = i; });
    const assignment = new Map(); // req -> [count لكل يوم بترتيب days]

    function placeReqAt(idx) {
      if (idx === needList.length) return true;
      const { req, remaining } = needList[idx];

      function distribute(dayIdx, left, counts) {
        if (left === 0) {
          assignment.set(req, counts.slice());
          if (placeReqAt(idx + 1)) return true;
          assignment.delete(req);
          return false;
        }
        if (dayIdx === days.length) return false;
        const day = days[dayIdx];
        const already = (req.presetDailyCounts && req.presetDailyCounts[day]) || 0;
        const maxHere = Math.min(req.maxPerDay - already, remainCap[day], left);
        if (maxHere < 0) return false;

        // الترتيب الذي تُجرَّب فيه القيم الممكنة لهذا اليوم: الأقرب لحصته "العادلة" أولًا، لا الأكبر ثم
        // الأصغر تنازليًا كما كان سابقًا — ذلك الترتيب القديم كان يُشبع كل يوم لأقصى ما يمكنه قبل الانتقال
        // للتالي (فيمتلئ الأحد والاثنين والثلاثاء كاملًا بينما يبقى الخميس بلا أي حصة رغم توفر سعة فيه).
        // الحصة "العادلة" هنا = توزيع ما تبقى (left) بالتساوي على ما تبقى من أيام (بما فيها هذا اليوم)،
        // بنفس منطق القسمة بالباقي الأكبر المستخدَم أصلًا في الحدود اليومية الافتراضية للصف (الخطوة الثانية)
        const daysLeftIncludingThis = days.length - dayIdx;
        const idealHere = Math.min(maxHere, Math.ceil(left / daysLeftIncludingThis));
        const block = req.isGrouped ? 2 : 1;
        const idealAligned = idealHere - (idealHere % block);

        const validValues = [];
        for (let c = 0; c <= maxHere; c += block) validValues.push(c);
        validValues.sort((a, b) => Math.abs(a - idealAligned) - Math.abs(b - idealAligned) || (b - a));

        for (const c of validValues) {
          if (c > 0) remainCap[day] -= c;
          counts[dayIdx] = c;
          if (distribute(dayIdx + 1, left - c, counts)) return true;
          if (c > 0) remainCap[day] += c;
          counts[dayIdx] = 0;
        }
        return false;
      }

      return distribute(0, remaining, new Array(days.length).fill(0));
    }

    if (!placeReqAt(0)) {
      return { success: false, reason: `تعذّر توزيع أيام حصص شعبة "${classKey}" حتى بتجاهل تعارضات المعلمين — الحدود اليومية الحالية لا تتسع لعدد حصصها الأسبوعي مهما كان الترتيب.` };
    }

    reqs.forEach(req => {
      const dist = assignment.get(req) || new Array(days.length).fill(0);
      const total = {};
      days.forEach((d, i) => { total[d] = ((req.presetDailyCounts && req.presetDailyCounts[d]) || 0) + dist[i]; });
      req.phaseOneDaily = total; // إجمالي حصص هذه المادة (مثبّت + موزَّع) في كل يوم — تُستهلَك في المرحلة ٢
    });
  }

  // ── المرحلة ٢: توزيع الحصص الفعلية يومًا بيوم ──
  for (const day of days) {
    if (Date.now() > deadline) return { success: false, reason: 'انتهت الميزانية الزمنية أثناء المرحلة الثانية (توزيع الحصص داخل الأيام).' };
    if (!solveDayPlacement(day, requirements, maxPeriods, schedule, teacherBusy, deadline)) {
      return { success: false, reason: `تعذّر ترتيب حصص يوم "${day}" بلا تعارض معلمين، رغم أن توزيع الأيام بحد ذاته كان ممكنًا.` };
    }
  }

  return { success: true };
}

// يوزّع الحصص "الجديدة" (غير المثبّتة) المستحقة على يوم واحد محدد فقط، عبر كل الشعب معًا، بلا أي تعارض معلمين،
// وبلا أي فجوة داخلية (كل شعبة تأخذ دائمًا أول عدد حصصها الشاغرة بالترتيب — انظر الشرح أعلى الملف)
function solveDayPlacement(day, requirements, maxPeriods, schedule, teacherBusy, deadline) {
  const byClass = {};
  requirements.forEach(req => {
    const already = (req.presetDailyCounts && req.presetDailyCounts[day]) || 0;
    const target = (req.phaseOneDaily && req.phaseOneDaily[day]) || 0;
    const newCount = target - already;
    if (newCount <= 0) return;
    (byClass[req.classKey] = byClass[req.classKey] || []).push({ req, newCount });
  });

  const classKeys = Object.keys(byClass);
  if (classKeys.length === 0) return true; // لا جديد لوضعه في هذا اليوم

  const classPlans = classKeys.map(classKey => {
    const items = byClass[classKey];
    const totalNew = items.reduce((s, x) => s + x.newCount, 0);
    const targetPeriods = [];
    for (let p = 1; p <= maxPeriods && targetPeriods.length < totalNew; p++) {
      if (!schedule[day][p][classKey]) targetPeriods.push(p);
    }
    if (targetPeriods.length < totalNew) return null; // احتياط: لا يجب أن يحدث فعليًا بعد نجاح المرحلة ١

    const units = [];
    items.forEach(({ req, newCount }) => {
      if (req.isGrouped) {
        units.push({ req, size: 2 });
      } else {
        for (let i = 0; i < newCount; i++) units.push({ req, size: 1 });
      }
    });

    return { classKey, targetPeriods, units };
  });

  if (classPlans.some(p => p === null)) return false;
  classPlans.sort((a, b) => b.units.length - a.units.length); // الأكثر وحدات أولًا (أكثر تقييدًا) — استرشادي فقط

  function isTeacherFreeDay(tid, p) {
    return !(teacherBusy[tid] && teacherBusy[tid][day] && teacherBusy[tid][day].has(p));
  }
  function markTeacherDay(tid, p, on) {
    teacherBusy[tid] = teacherBusy[tid] || {};
    teacherBusy[tid][day] = teacherBusy[tid][day] || new Set();
    on ? teacherBusy[tid][day].add(p) : teacherBusy[tid][day].delete(p);
  }

  // بحث رجعي واحد متواصل عبر كل الشعب معًا (لا شعبة بشعبة بشكل منفصل): عند إكمال ترتيب صالح لوحدات شعبة
  // معيّنة، يُطبَّق فورًا في الجدول وتُستكمَل بقية الشعب مباشرة ضمن نفس شجرة البحث. إن فشلت بقية الشعب، لا
  // نتخلّى عن هذه الشعبة كليًا — بل نتراجع عن هذا الترتيب تحديدًا ونواصل البحث عن ترتيب آخر صالح لوحداتها هي
  // نفسها قبل الاستسلام. هذا ما كان ناقصًا في نسخة سابقة اكتفت بأول ترتيب صالح لكل شعبة بمعزل عن أثره على
  // ما بعدها من شعب، فكانت تفشل أحيانًا رغم وجود حل كامل يتطلب ترتيبًا مختلفًا لشعبة سابقة فقط.
  let attempts = 0;
  const ATTEMPT_LIMIT = 500000;

  function placeClass(idx) {
    if (idx === classPlans.length) return true;
    const plan = classPlans[idx];
    const { targetPeriods, units, classKey } = plan;
    const n = units.length;
    const usedUnit = new Array(n).fill(false);

    function tryUnits(offset, order) {
      if (attempts > ATTEMPT_LIMIT || Date.now() > deadline) return false;
      if (order.length === n) {
        order.forEach(({ unit, slice }) => {
          slice.forEach(p => {
            schedule[day][p][classKey] = { teacher: unit.req.teacherName, subject: unit.req.subject, teacherId: unit.req.teacherId };
          });
        });
        if (placeClass(idx + 1)) return true;
        // فشلت بقية الشعب رغم هذا الترتيب لوحدات هذه الشعبة — تراجع عنه في الجدول (حجز المعلمين يبقى، سيُزال
        // من قِبَل حلقة البحث أدناه عند العودة من هذا الفرع) وواصل البحث عن ترتيب آخر
        order.forEach(({ unit, slice }) => {
          slice.forEach(p => { delete schedule[day][p][classKey]; });
        });
        return false;
      }
      for (let k = 0; k < n; k++) {
        if (usedUnit[k]) continue;
        attempts++;
        if (attempts > ATTEMPT_LIMIT) return false;
        const unit = units[k];
        const slice = targetPeriods.slice(offset, offset + unit.size);
        if (slice.length < unit.size) continue;
        if (unit.size === 2 && slice[1] !== slice[0] + 1) continue; // كتلة مجمّعة تحتاج حصتين متجاورتين فعليًا
        const tid = unit.req.teacherId;
        const feasible = slice.every(p => !isTeacherBlockedGlobal(tid, day, p) && isTeacherFreeDay(tid, p));
        if (!feasible) continue;

        usedUnit[k] = true;
        slice.forEach(p => markTeacherDay(tid, p, true));
        order.push({ unit, slice });

        if (tryUnits(offset + unit.size, order)) return true;

        slice.forEach(p => markTeacherDay(tid, p, false));
        order.pop();
        usedUnit[k] = false;
      }
      return false;
    }

    return tryUnits(0, []);
  }

  return placeClass(0);
}

function detectScheduleGaps() {
  const tt = state.timetable;
  if (!tt) return [];
  const gaps = [];
  tt.activeClasses.forEach(c => {
    tt.days.forEach(day => {
      for (let p = 1; p <= tt.maxPeriods; p++) {
        if (tt.schedule[day][p][c.key]) continue;
        let hasLaterLecture = false;
        for (let q = p + 1; q <= tt.maxPeriods; q++) {
          if (tt.schedule[day][q][c.key]) { hasLaterLecture = true; break; }
        }
        if (hasLaterLecture) gaps.push({ classKey: c.key, day, period: p });
      }
    });
  });
  return gaps;
}

function buildGroupingMapGlobal() {
  const map = {};
  if (state.constraints && state.constraints.subjectGrouping) {
    state.constraints.subjectGrouping.forEach(g => { map[subjectGradeKey(g.subject, g.grade)] = true; });
  }
  return map;
}

function isTeacherBlockedGlobal(teacherId, day, period) {
  return !!(teacherId && state.constraints && state.constraints.teacherBlocks &&
    state.constraints.teacherBlocks.some(b => b.teacherId === teacherId && b.day === day && b.period === period));
}

function isFixedSlotGlobal(classKey, day, period) {
  return !!(state.constraints && state.constraints.fixedPlacements &&
    state.constraints.fixedPlacements.some(f => f.classKey === classKey && f.day === day && f.period === period));
}

// ═══════════════════════════════════════════════════════════════
// محرّر "تثبيت حصة في مكان محدد" — يعمل قبل أي توليد إطلاقًا، على مرحلة القيود (الخطوة الرابعة) مباشرة
// ═══════════════════════════════════════════════════════════════

// يُرجع المعلم المُسنَد فعليًا لهذه المادة ولهذه الشعبة تحديدًا حاليًا (حسب تعيينات المعلمين في الخطوة
// الثالثة)، أو null إن لم يوجد أي معلم مُسنَد لهذا المزيج — عندها هذا التثبيت "يتيم" (يُكتشَف لاحقًا ضمن
// تدفّق "تغييرات لاحقة تُبطل تثبيتًا قائمًا"، لا هنا)
function findTeacherForFixedPlacement(f) {
  const [grade, section] = f.classKey.split('___');
  return state.teachers.find(t =>
    t.assignments.some(a => a.subject === f.subject && a.grade === grade && a.section === section)
  ) || null;
}

// يبني سياقًا بنفس شكل state.timetable ({days, maxPeriods, activeClasses, schedule})، لكن معبَّأً فقط
// بالحصص المثبّتة يدويًا حاليًا (state.constraints.fixedPlacements) — لا شيء آخر. يُستخدَم مع canPlaceAt
// للتحقق من صحة أي تثبيت جديد أو تبديل بين تثبيتين، بمعزل تام عن وجود جدول مولَّد فعليًا من عدمه
function buildFixedPlacementsContext() {
  const days = state.school.days;
  const maxPeriods = state.school.maxPeriods;
  const activeClasses = getActiveClassList();

  const schedule = {};
  days.forEach(day => {
    schedule[day] = {};
    for (let p = 1; p <= maxPeriods; p++) schedule[day][p] = {};
  });

  (state.constraints.fixedPlacements || []).forEach(f => {
    if (!schedule[f.day] || !schedule[f.day][f.period]) return; // يوم/حصة لم تعد صالحة (مثلًا بعد تقليص أيام الدوام أو الحصص اليومية)
    const teacher = findTeacherForFixedPlacement(f);
    if (!teacher) return; // تثبيت يتيم — يُتجاهَل هنا (لا يشارك في فحوصات التعارض)، يُكتشَف عبر مسار آخر
    schedule[f.day][f.period][f.classKey] = { subject: f.subject, teacher: teacher.name, teacherId: teacher.id };
  });

  return { days, maxPeriods, activeClasses, schedule };
}

// كل "الحصص" المطلوبة أسبوعيًا (معلم × مادة × شعبة، بعدد = نصابها الأسبوعي من الخطوة الثانية)، مطروحًا منها
// ما ثُبِّت منها فعليًا لكل مزيج (شعبة، مادة) — الباقي هو ما يظهر في تراي "الحصص غير المثبّتة" في هذا المحرّر
function computeUnfixedRequirementItems() {
  const items = [];
  const activeClasses = getActiveClassList();

  const fixedCountByKey = {}; // "classKey|subject" -> عدد الحصص المثبّتة فعليًا لهذا المزيج
  (state.constraints.fixedPlacements || []).forEach(f => {
    const key = `${f.classKey}|${f.subject}`;
    fixedCountByKey[key] = (fixedCountByKey[key] || 0) + 1;
  });

  state.teachers.forEach(t => {
    t.assignments.forEach(a => {
      const ck = classKey(a.grade, a.section);
      if (!activeClasses.some(c => c.key === ck)) return;
      const weeklyPeriods = state.subjectPeriods[subjectGradeKey(a.subject, a.grade)] || 0;
      if (weeklyPeriods <= 0) return;
      const fixedCount = fixedCountByKey[`${ck}|${a.subject}`] || 0;
      const remaining = Math.max(0, weeklyPeriods - fixedCount);
      for (let i = 0; i < remaining; i++) {
        items.push({ classKey: ck, subject: a.subject, teacher: t.name, teacherId: t.id, grade: a.grade, section: a.section });
      }
    });
  });

  return items;
}

// خريطة انشغال كل معلم (يوم → مجموعة الحصص) مبنية من الجدول الحالي فعليًا، بمعزل عن أي حالة توليد سابقة
function buildTeacherBusyMapFromTimetable(tt) {
  const map = {};
  tt.activeClasses.forEach(c => {
    tt.days.forEach(day => {
      for (let p = 1; p <= tt.maxPeriods; p++) {
        const entry = tt.schedule[day][p][c.key];
        if (!entry) continue;
        const tid = resolveTeacherId(entry);
        if (!tid) continue;
        map[tid] = map[tid] || {};
        map[tid][day] = map[tid][day] || new Set();
        map[tid][day].add(p);
      }
    });
  });
  return map;
}

// يفسح المجال دوريًا لدورة أحداث المتصفح أثناء عمليات حسابية طويلة متزامنة نسبيًا (إغلاق الفجوات، إنقاذ
// الحصص العالقة، التوليد المحلي) — بلا هذا، قد يبقى خيط الواجهة مشغولًا بلا انقطاع لعدة ثوانٍ متتالية في
// الحالات الصعبة (جداول كبيرة أو قيود متشابكة)، فيظن WebView2/المتصفح أن الصفحة "لا تستجيب" ويُظهر تحذيرًا
// لذلك رغم أن الحساب يسير بشكل طبيعي تمامًا ولم يتعطّل فعليًا. تُستدعى بانتظام من داخل الحلقات الرئيسية لتلك
// العمليات (لا من داخل كل بحث رجعي داخلي بمفرده، حرصًا على عدم إبطاء المقطع الواحد بلا داعٍ) — كل استدعاء
// فعلي (وليس كل استدعاء للدالة) يُدخِل توقفًا قصيرًا فعليًا (0 مل ثانية Timeout) يكفي لإعادة السيطرة للمتصفح.
function createYielder(intervalMs) {
  let last = Date.now();
  return async function maybeYield() {
    const now = Date.now();
    if (now - last >= (intervalMs || 40)) {
      await new Promise(resolve => setTimeout(resolve, 0));
      last = Date.now();
    }
  };
}

async function runGapCompactionPass() {
  const tt = state.timetable;
  if (!tt) return { filled: 0, remaining: [] };

  const before = detectScheduleGaps();
  if (before.length === 0) return { filled: 0, remaining: [] };

  const groupingMap = buildGroupingMapGlobal();
  const teacherBusy = buildTeacherBusyMapFromTimetable(tt);

  function isTeacherFreeAt(tid, day, p) {
    return !(teacherBusy[tid] && teacherBusy[tid][day] && teacherBusy[tid][day].has(p));
  }
  function markTeacherBusy(tid, day, p, on) {
    if (!tid) return;
    teacherBusy[tid] = teacherBusy[tid] || {};
    teacherBusy[tid][day] = teacherBusy[tid][day] || new Set();
    on ? teacherBusy[tid][day].add(p) : teacherBusy[tid][day].delete(p);
  }

  // ميزانية زمنية إجمالية لكل عملية إغلاق فجوات (تشمل كل الشعب والأيام معًا، وليس كل مقطع على حدة)، حماية
  // لاستجابة الواجهة في أسوأ الحالات النظرية إن تراكمت مقاطع كثيرة كثيفة الحصص معًا في نفس التشغيلة
  const searchDeadline = Date.now() + 4000;
  let timeExceeded = false;
  const yielder = createYielder(); // يفسح المجال لدورة أحداث المتصفح دوريًا — راجع تعريفها لشرح السبب

  for (const c of tt.activeClasses) {
    for (const day of tt.days) {
      await yielder(); // نقطة تنفّس دورية: مرة واحدة على الأكثر لكل شعبة/يوم، لا داخل البحث الرجعي نفسه (يبقى متزامنًا وسريعًا لمقطع واحد)

      // تقسيم اليوم إلى مقاطع تفصلها الحصص المثبّتة يدويًا — لا يُعاد ترتيب أي شيء عبر حاجز مثبّت
      const segments = [];
      let current = [];
      for (let p = 1; p <= tt.maxPeriods; p++) {
        if (isFixedSlotGlobal(c.key, day, p)) {
          if (current.length) segments.push(current);
          current = [];
        } else {
          current.push(p);
        }
      }
      if (current.length) segments.push(current);

      segments.forEach(segmentPeriods => {
        if (timeExceeded) return; // انتهت الميزانية الزمنية — نترك ما تبقّى من مقاطع كما هي (تظهر كفجوات غير محلولة)

        const occupiedPeriods = segmentPeriods.filter(p => tt.schedule[day][p][c.key]);
        if (occupiedPeriods.length === 0) return; // مقطع فارغ بالكامل، لا شيء لفعله

        const targetPeriods = segmentPeriods.slice(0, occupiedPeriods.length);
        const alreadyCompact = targetPeriods.every(p => !!tt.schedule[day][p][c.key]);
        if (alreadyCompact) return; // هذا المقطع مرصوص فعلًا بلا فجوات داخلية

        // بناء "الوحدات": حصة منفردة لكل مادة بشكل افتراضي، إلا إن كانت المادة مضبوطة على قيد التجميع
        // الإلزامي لهذا الصف تحديدًا — عندها تُبنى كتلتها المتتالية ككتلة واحدة غير قابلة للتفكك
        const units = [];
        let i = 0;
        while (i < segmentPeriods.length) {
          const p0 = segmentPeriods[i];
          const entry0 = tt.schedule[day][p0][c.key];
          if (!entry0) { i++; continue; }
          const mustGroup = !!groupingMap[subjectGradeKey(entry0.subject, c.grade)];
          let j = i;
          if (mustGroup) {
            while (
              j + 1 < segmentPeriods.length &&
              segmentPeriods[j + 1] === segmentPeriods[j] + 1 &&
              tt.schedule[day][segmentPeriods[j + 1]][c.key] &&
              tt.schedule[day][segmentPeriods[j + 1]][c.key].subject === entry0.subject &&
              tt.schedule[day][segmentPeriods[j + 1]][c.key].teacherId === entry0.teacherId
            ) { j++; }
          }
          const unitPeriods = segmentPeriods.slice(i, j + 1);
          units.push({ periods: unitPeriods, entries: unitPeriods.map(p => tt.schedule[day][p][c.key]) });
          i = j + 1;
        }

        // ترتيب استرشادي فقط (لا يؤثر على شمولية البحث): تجربة الكتل الأكبر (المواد المجمّعة) أولًا، لأنها
        // الأكثر تقييدًا من حيث أماكن ملاءمتها — يسرّع الوصول لحل أو لإثبات استحالته، دون حذف أي احتمال
        units.sort((a, b) => b.periods.length - a.periods.length);

        // بحث رجعي (Backtracking) شامل يجرّب كل ترتيب ممكن للوحدات ضمن الحصص الهدف المرصوصة، ويتوقف عند
        // أول ترتيب لا يوجد فيه أي تعارض في جدول أي معلم. لا حد أقصى مصطنع لعدد الوحدات: بما أن حجم المقطع
        // محكوم أصلًا بالحد الأقصى العام لعدد حصص اليوم (١٠ كحد أقصى ممكن في الخطوة الأولى)، فإن أسوأ حالة
        // نظريًا (١٠! ≈ 3.6 مليون احتمال) ما تزال قابلة للتنفيذ الكامل خلال أجزاء من الثانية بلا حاجة لتقييد
        // مصطنع يُسقط حالات حقيقية بلا محاولة أصلًا — بحث مبني على تبديل الفهارس مباشرة (بلا نسخ مصفوفات) لأداء أفضل
        const n = units.length;
        const usedUnit = new Array(n).fill(false);
        const order = [];
        let solution = null;
        let attempts = 0;
        const ATTEMPT_LIMIT = 4000000;

        function backtrack(offset) {
          if (solution) return;
          if ((attempts & 4095) === 0 && Date.now() > searchDeadline) { timeExceeded = true; return; }
          if (order.length === n) { solution = order.slice(); return; }
          for (let idx = 0; idx < n; idx++) {
            if (usedUnit[idx] || solution || timeExceeded) continue;
            attempts++;
            if (attempts > ATTEMPT_LIMIT) return;
            const unit = units[idx];
            const targets = targetPeriods.slice(offset, offset + unit.periods.length);
            const feasible = unit.entries.every((e, k) => {
              const tid = resolveTeacherId(e);
              const tp = targets[k];
              return !isTeacherBlockedGlobal(tid, day, tp) && isTeacherFreeAt(tid, day, tp);
            });
            if (!feasible) continue;
            usedUnit[idx] = true;
            order.push(idx);
            targets.forEach((tp, k) => markTeacherBusy(resolveTeacherId(unit.entries[k]), day, tp, true));
            backtrack(offset + unit.periods.length);
            if (!solution) {
              targets.forEach((tp, k) => markTeacherBusy(resolveTeacherId(unit.entries[k]), day, tp, false));
              order.pop();
              usedUnit[idx] = false;
            }
          }
        }
        backtrack(0);

        if (solution) {
          segmentPeriods.forEach(p => { delete tt.schedule[day][p][c.key]; });
          let offset = 0;
          solution.forEach(idx => {
            const unit = units[idx];
            const targets = targetPeriods.slice(offset, offset + unit.periods.length);
            targets.forEach((tp, k) => { tt.schedule[day][tp][c.key] = unit.entries[k]; });
            offset += unit.periods.length;
          });
        } else {
          // تعذّر إيجاد ترتيب بلا تعارض لهذا المقطع (أو انتهت الميزانية الزمنية) — نعيد حجز الوحدات كما كانت
          units.forEach(u => u.entries.forEach((e, idx) => {
            markTeacherBusy(resolveTeacherId(e), day, u.periods[idx], true);
          }));
        }
      });
    }
  }

  const after = detectScheduleGaps();
  markDirty();
  renderTimetableOutput();
  return { filled: before.length - after.length, remaining: after };
}

// ── تحرير الجدول يدويًا: اختيار خانتين (نقر أو سحب/إفلات) لتبديلهما أو نقل حصة إلى خانة فارغة ──
let editSelection = null;   // { day, period, classKey } — خانة من الجدول مختارة أولًا بالنقر، بانتظار خانة ثانية للتبديل معها
let traySelection = null;   // فهرس عنصر من القائمة الجانبية (الحصص غير المثبّتة) مختار بالنقر، بانتظار خانة فارغة لوضعه فيها
let activeTimetableTab = 'detailed'; // 'detailed' | 'simple'
let trayFilterTeacher = 'all'; // فلترة القائمة الجانبية حسب المعلم
let trayFilterClass = 'all';   // فلترة القائمة الجانبية حسب الصف/الشعبة

// فلاتر البحث في "الجدول التفصيلي" نفسه — بحث سلبي بحت (لا يُقصي أي خانة، فقط يُبرزها) عبر تظليل أصفر،
// بخلاف فلاتر التراي أعلاه التي تُقصي عناصر القائمة كليًا (لا معنى لإقصاء خانة من شبكة جدول بلا كسر بنيتها)
let searchFilterTeacher = 'all';
let searchFilterClass = 'all';
let searchFilterSubject = 'all';

// ═══════════════════════════════════════════════════════════════
// تراجع/إعادة (Ctrl+Z / Ctrl+Y) لتعديلات "الجدول التفصيلي" بعد التوليد فقط — لا يمتد لأي خطوة أخرى من
// خطوات الإعداد. لقطات كاملة للحالة (لا عكس محسوب لكل نوع إجراء على حدة)، لأنها بسيطة وصحيحة ببنائها ولا
// تحتاج تحديثًا يدويًا مع كل إجراء جديد يُضاف لاحقًا (كميزة تغيير المعلم القادمة) — بخلاف عكس مخصَّص لكل
// إجراء، الذي يسهل نسيان تحديثه فيصبح تراجعًا خاطئًا صامتًا. مقتصرة على الجلسة الحالية عمدًا (لا تُحفَظ في
// الملف المُصدَّر) بمحدودية عمق معقولة، تمامًا كسلوك التراجع المعتاد في أي برنامج.
let __undoStack = [];
let __redoStack = [];
const UNDO_STACK_MAX = 50;

function snapshotForUndo() {
  return {
    timetable: state.timetable ? JSON.parse(JSON.stringify(state.timetable)) : null,
    teachers: JSON.parse(JSON.stringify(state.teachers)),
  };
}

// يُستدعى من داخل كل دالة تُغيِّر الجدول (تبديل، وضع من التراي، فكّ تثبيت، تغيير معلم مادة لاحقًا) في اللحظة
// التي تُقرَّر فيها المتابعة فعليًا — بعد نجاح كل فحوصات الصحة، لا قبلها، حتى لا تُسجَّل محاولات فاشلة كخطوة
// تراجع بلا فائدة. أي إجراء جديد يُفرِّغ مكدّس "الإعادة" فورًا (سلوك تراجع/إعادة معتاد في كل مكان)
function pushUndoSnapshot() {
  __undoStack.push(snapshotForUndo());
  if (__undoStack.length > UNDO_STACK_MAX) __undoStack.shift();
  __redoStack = [];
}

function undoTimetableChange() {
  if (__undoStack.length === 0) { toast('لا يوجد ما يمكن التراجع عنه.', 'info'); return; }
  __redoStack.push(snapshotForUndo());
  const prev = __undoStack.pop();
  state.timetable = prev.timetable;
  state.teachers = prev.teachers;
  editSelection = null;
  traySelection = null;
  markDirty();
  renderTimetableOutput();
  renderTeacherList(); // قد تكون بيانات المعلمين تغيّرت أيضًا (كتغيير معلم مادة)
  toast('تم التراجع عن آخر تغيير في الجدول.', 'info');
}

function redoTimetableChange() {
  if (__redoStack.length === 0) { toast('لا يوجد ما يمكن إعادته.', 'info'); return; }
  __undoStack.push(snapshotForUndo());
  const next = __redoStack.pop();
  state.timetable = next.timetable;
  state.teachers = next.teachers;
  editSelection = null;
  traySelection = null;
  markDirty();
  renderTimetableOutput();
  renderTeacherList();
  toast('تمت إعادة التغيير.', 'info');
}

document.addEventListener('keydown', (e) => {
  // نتجاهل الاختصار إن كان المستخدم يكتب داخل حقل نصي — نحترم تراجع/إعادة المتصفح الافتراضي هناك بدل
  // اعتراضه، إذ لا علاقة له بتعديلات الجدول إطلاقًا
  const active = document.activeElement;
  const tag = active && active.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable)) return;
  if (!e.ctrlKey && !e.metaKey) return;
  if (e.key === 'z' || e.key === 'Z') {
    e.preventDefault();
    undoTimetableChange();
  } else if (e.key === 'y' || e.key === 'Y') {
    e.preventDefault();
    redoTimetableChange();
  }
});


function renderTimetableOutput() {
  const card = document.getElementById('timetable-card');
  const tt = state.timetable;
  if (!tt) { card.style.display = 'none'; editSelection = null; traySelection = null; return; }
  if (!tt.unpinned) tt.unpinned = []; // توافق مع جداول محفوظة قبل إضافة هذه الميزة
  card.style.display = 'block';

  renderSearchFilters();
  renderDetailedTable();
  renderUnpinnedTray();
  renderSimplifiedTable();
  renderTeacherFreeTable();
  renderTeacherPeriodLoadTable();
  renderTeacherMasterScheduleTable();
  renderTeacherClassTable();
  applyTimetableTab();
}

// يملأ قوائم فلاتر البحث الثلاث بما هو موجود فعليًا في الجدول الحالي فقط (لا كل معلمي/مواد المدرسة)، فتبقى
// القوائم مختصرة وذات صلة دومًا. بحث سلبي بحت — لا يُنشئ أي تغيير في البيانات، فقط يُبرز الخانات المطابقة.
function renderSearchFilters() {
  const tt = state.timetable;
  const teacherEl = document.getElementById('tt-search-teacher');
  const classEl = document.getElementById('tt-search-class');
  const subjectEl = document.getElementById('tt-search-subject');
  if (!teacherEl || !tt) return;

  const teachers = getScheduledTeachers(tt);
  teacherEl.innerHTML = `<option value="all">كل المعلمين</option>` +
    teachers.map(t => `<option value="${t.teacherId}"${t.teacherId === searchFilterTeacher ? ' selected' : ''}>${t.name}</option>`).join('');
  if (!teachers.some(t => t.teacherId === searchFilterTeacher) && searchFilterTeacher !== 'all') searchFilterTeacher = 'all';
  teacherEl.value = searchFilterTeacher;

  const classOptions = tt.activeClasses.slice().sort((a, b) => `${a.grade} ${a.section}`.localeCompare(`${b.grade} ${b.section}`, 'ar'));
  classEl.innerHTML = `<option value="all">كل الشعب</option>` +
    classOptions.map(c => `<option value="${c.key}"${c.key === searchFilterClass ? ' selected' : ''}>${c.grade} - ${c.section}</option>`).join('');
  if (!tt.activeClasses.some(c => c.key === searchFilterClass) && searchFilterClass !== 'all') searchFilterClass = 'all';
  classEl.value = searchFilterClass;

  const subjectsPresent = new Set();
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (e) subjectsPresent.add(e.subject);
      });
    }
  });
  const subjectsSorted = [...subjectsPresent].sort((a, b) => a.localeCompare(b, 'ar'));
  subjectEl.innerHTML = `<option value="all">كل المواد</option>` +
    subjectsSorted.map(s => `<option value="${s}"${s === searchFilterSubject ? ' selected' : ''}>${s}</option>`).join('');
  if (!subjectsPresent.has(searchFilterSubject) && searchFilterSubject !== 'all') searchFilterSubject = 'all';
  subjectEl.value = searchFilterSubject;
}

document.getElementById('tt-search-teacher').addEventListener('change', (e) => {
  searchFilterTeacher = e.target.value;
  renderDetailedTable();
});
document.getElementById('tt-search-class').addEventListener('change', (e) => {
  searchFilterClass = e.target.value;
  renderDetailedTable();
});
document.getElementById('tt-search-subject').addEventListener('change', (e) => {
  searchFilterSubject = e.target.value;
  renderDetailedTable();
});

// يُرجع مجموعة "day|period|classKey" لكل خانة تحمل نفس (classKey, subject) المُعطاة — باستثناء الخانة
// نفسها إن مُرِّرت (حالة التبديل: لا معنى لتحذير المستخدم بأن الخانة التي اختارها للتو "مطابقة لنفسها"؛ أما
// حالة عنصر التراي فليس لها خانة أصل أصلًا، فلا استثناء هناك). راجع الرد على سبب عدم استثناء المواد المجمَّعة:
// لا قاعدة خاصة بها هنا عمدًا — التحذير مجرّد إشارة بصرية، وتقدير ما إذا كان التكرار مقصودًا متروك للمستخدم
function computeSameSubjectCells(classKey, subject, excludeDay, excludePeriod) {
  const tt = state.timetable;
  const result = new Set();
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      if (day === excludeDay && p === excludePeriod) continue;
      const e = tt.schedule[day][p][classKey];
      if (e && e.subject === subject) result.add(`${day}|${p}|${classKey}`);
    }
  });
  return result;
}

// يُرجع مجموعة "day|period|classKey" لكل خانة تطابق كل فلاتر البحث المفعَّلة حاليًا (غير "الكل") معًا —
// فلتر واحد أو أكثر أو لا شيء؛ إن كانت كل الفلاتر على "الكل" تُرجَع مجموعة فارغة (لا تظليل بلا بحث فعلي)
function computeSearchMatchCells() {
  const result = new Set();
  if (searchFilterTeacher === 'all' && searchFilterClass === 'all' && searchFilterSubject === 'all') return result;
  const tt = state.timetable;
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e) return;
        if (searchFilterTeacher !== 'all' && e.teacherId !== searchFilterTeacher) return;
        if (searchFilterClass !== 'all' && c.key !== searchFilterClass) return;
        if (searchFilterSubject !== 'all' && e.subject !== searchFilterSubject) return;
        result.add(`${day}|${p}|${c.key}`);
      });
    }
  });
  return result;
}

// تلميح بصري بحت (ليس تحذير خطأ ولا قيدًا مفروضًا) لمادة مُجمَّعة (subjectGrouping) وقعت حصتها معزولة فعليًا
// عن أي حصة أخرى لنفس المادة لنفس الشعبة في نفس اليوم — يذكِّر المستخدم بأنه أثناء التحرير اليدوي وحده
// (المولّد الآلي CP-SAT يفرض هذا التفضيل عبر هدفه الخاص، لا حاجة لأي تذكير هناك، لكن قرارًا بشريًا لاحقًا —
// كسحب حصة من مكانها المزدوج — قد يُفكِّك تجميعًا كان سليمًا أصلًا بلا أن يتنبّه صاحبه). عزلة يوم واحد قد
// تكون سليمة تمامًا وحتمية أصلًا حين يكون عدد الحصص الأسبوعي فرديًا (يستحيل تجميعها أزواجًا بالكامل عندئذٍ)؛
// القرار النهائي دومًا للمستخدم، هذا مجرّد تذكير — يُطبَّق بنفس منطق الأولوية البصرية الحالي: علامة إضافية
// صغيرة تتراكب فوق أي حالة أخرى (تحديد/تبديل صالح/بحث)، لا تُنافسها ولا تحلّ محلّها
function computeGroupingHintCells() {
  const tt = state.timetable;
  const result = new Set();
  if (!tt) return result;

  tt.activeClasses.forEach(c => {
    const grade = c.key.split('___')[0];
    tt.days.forEach(day => {
      for (let p = 1; p <= tt.maxPeriods; p++) {
        const entry = tt.schedule[day][p][c.key];
        if (!entry) continue;
        const isGrouped = (state.constraints.subjectGrouping || []).some(g => g.subject === entry.subject && g.grade === grade);
        if (!isGrouped) continue;
        const prevSame = p > 1 && tt.schedule[day][p - 1][c.key] && tt.schedule[day][p - 1][c.key].subject === entry.subject;
        const nextSame = p < tt.maxPeriods && tt.schedule[day][p + 1][c.key] && tt.schedule[day][p + 1][c.key].subject === entry.subject;
        if (!prevSame && !nextSame) result.add(`${day}|${p}|${c.key}`);
      }
    });
  });
  return result;
}

function renderDetailedTable() {
  const table = document.getElementById('timetable-output');
  const tt = state.timetable;
  const classes = tt.activeClasses;

  // إن كان هناك عنصر من القائمة الجانبية مُحدَّد، نحسب الخانات الفارغة الصالحة لوضعه فيها لتلوينها. وإن كانت
  // خانة من الجدول نفسها هي المحدَّدة (لتبديلها)، نحسب بدلًا من ذلك كل خانة أخرى يصح التبديل معها فعليًا،
  // فلا يحتاج المستخدم لتجربة كل خانة يدويًا حتى يجد واحدة صالحة
  const validSet = new Set(); // أخضر: "day|period|classKey"
  const sameSubjectSet = new Set(); // أزرق: نفس المادة لنفس الشعبة في مكان آخر من الأسبوع
  if (traySelection !== null && tt.unpinned[traySelection]) {
    const item = tt.unpinned[traySelection];
    getEmptyValidCellsForItem(item, false).forEach(c => validSet.add(`${c.day}|${c.period}|${c.classKey}`));
    computeSameSubjectCells(item.classKey, item.subject, null, null).forEach(k => sameSubjectSet.add(k));
  } else if (editSelection) {
    computeValidSwapTargets(editSelection).forEach(k => validSet.add(k));
    const selEntry = tt.schedule[editSelection.day][editSelection.period][editSelection.classKey];
    if (selEntry) {
      computeSameSubjectCells(editSelection.classKey, selEntry.subject, editSelection.day, editSelection.period)
        .forEach(k => sameSubjectSet.add(k));
    }
  }
  const searchMatchSet = computeSearchMatchCells(); // أصفر
  const groupingHintSet = computeGroupingHintCells(); // علامة زرقاء صغيرة إضافية — لا تدخل ضمن سلسلة الأولوية أدناه إطلاقًا

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th rowspan="2" class="tt-day-col">اليوم</th><th rowspan="2" class="tt-period-col">الحصة</th>`;
  classes.forEach(c => { row1.innerHTML += `<th colspan="2">${c.grade} - ${c.section}</th>`; });
  const row2 = document.createElement('tr');
  classes.forEach(() => { row2.innerHTML += `<th>المادة</th><th>المعلم</th>`; });
  thead.appendChild(row1);
  thead.appendChild(row2);

  const tbody = document.createElement('tbody');
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const tr = document.createElement('tr');
      if (p === 1) {
        tr.className = 'tt-day-start'; // فاصل بصري واضح بين كل يوم والذي يليه
        tr.innerHTML += `<th rowspan="${tt.maxPeriods}" class="tt-day-col">${day}</th>`;
      }
      tr.innerHTML += `<th class="tt-period-col">${p}</th>`;
      classes.forEach(c => {
        const entry = tt.schedule[day][p][c.key];
        const cellKey = `${day}|${p}|${c.key}`;
        const isSelected = !!(editSelection && editSelection.day === day && editSelection.period === p && editSelection.classKey === c.key);
        const cls = ['tt-cell'];
        if (isSelected) cls.push('selected');
        // أولوية العرض عند تطابق أكثر من حالة معًا: أزرق (تحذير فعلي بسبب إجراء) > أخضر (هدف تبديل صالح
        // بسبب إجراء) > أصفر (نتيجة بحث سلبي، أقل إلحاحًا من الاثنين أعلاه)
        if (sameSubjectSet.has(cellKey)) cls.push('same-subject');
        else if (validSet.has(cellKey)) cls.push('valid-target');
        else if (searchMatchSet.has(cellKey)) cls.push('search-match');
        // علامة تجميع منفصلة تمامًا عن السلسلة أعلاه — إضافية لا حصرية، تظهر بصرف النظر عن أيٍّ من الحالات
        // الأخرى (حتى فوق التحديد نفسه)، إذ إنها معلومة عن محتوى الخانة ذاتها لا عن تفاعل جارٍ معها حاليًا
        if (groupingHintSet.has(cellKey)) cls.push('grouping-hint');
        const attrs = `data-day="${day}" data-period="${p}" data-class="${c.key}"`;
        if (entry) {
          tr.innerHTML += `<td class="${cls.join(' ')} tt-subject-cell" draggable="true" ${attrs}>${entry.subject}<button type="button" class="unpin-btn" title="فك التثبيت" ${attrs}>×</button></td>` +
            `<td class="${cls.join(' ')} tt-teacher-cell" draggable="true" ${attrs}>${entry.teacher}</td>`;
        } else {
          cls.push('free-cell');
          tr.innerHTML += `<td class="${cls.join(' ')}" colspan="2" ${attrs}>فارغة</td>`;
        }
      });
      tbody.appendChild(tr);
    }
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

function renderUnpinnedTray() {
  const list = document.getElementById('tt-tray-list');
  const teacherFilterEl = document.getElementById('tt-tray-filter-teacher');
  const classFilterEl = document.getElementById('tt-tray-filter-class');
  if (!list) return;
  const tt = state.timetable;
  const items = (tt && tt.unpinned) || [];

  // بناء خيارات الفلاتر من الحصص الموجودة فعليًا في القائمة الجانبية حاليًا
  if (teacherFilterEl) {
    const teachers = [...new Set(items.map(it => it.teacher))].sort((a, b) => a.localeCompare(b, 'ar'));
    teacherFilterEl.innerHTML = `<option value="all">كل المعلمين</option>` +
      teachers.map(t => `<option value="${t}"${t === trayFilterTeacher ? ' selected' : ''}>${t}</option>`).join('');
    if (!teachers.includes(trayFilterTeacher) && trayFilterTeacher !== 'all') trayFilterTeacher = 'all';
    teacherFilterEl.value = trayFilterTeacher;
  }
  if (classFilterEl) {
    const classKeysPresent = [...new Set(items.map(it => it.classKey))];
    const classOptions = classKeysPresent.map(ck => {
      const c = (tt && tt.activeClasses.find(x => x.key === ck));
      return { key: ck, label: c ? `${c.grade} - ${c.section}` : ck };
    }).sort((a, b) => a.label.localeCompare(b.label, 'ar'));
    classFilterEl.innerHTML = `<option value="all">كل الشعب</option>` +
      classOptions.map(c => `<option value="${c.key}"${c.key === trayFilterClass ? ' selected' : ''}>${c.label}</option>`).join('');
    if (!classKeysPresent.includes(trayFilterClass) && trayFilterClass !== 'all') trayFilterClass = 'all';
    classFilterEl.value = trayFilterClass;
  }

  if (items.length === 0) {
    list.innerHTML = `<p class="tt-tray-empty">لا توجد حصص غير مثبّتة حاليًا.</p>`;
    return;
  }

  const filteredIdx = items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) =>
      (trayFilterTeacher === 'all' || item.teacher === trayFilterTeacher) &&
      (trayFilterClass === 'all' || item.classKey === trayFilterClass)
    );

  if (filteredIdx.length === 0) {
    list.innerHTML = `<p class="tt-tray-empty">لا توجد حصص مطابقة لهذه الفلترة.</p>`;
    return;
  }

  list.innerHTML = filteredIdx.map(({ item, idx }) => {
    const cls = item.classKey && tt.activeClasses.find(c => c.key === item.classKey);
    const classLabel = cls ? `${cls.grade} - ${cls.section}` : item.classKey;
    const selCls = traySelection === idx ? ' selected' : '';
    return `<div class="tray-chip${selCls}" draggable="true" data-index="${idx}">
      <div class="tray-chip-subject">${item.subject}</div>
      <div class="tray-chip-teacher">${item.teacher}</div>
      <div class="tray-chip-class">${classLabel}</div>
    </div>`;
  }).join('');
}

function computeSimplifiedData(tt) {
  const bySubject = new Set();
  const data = {}; // data[classKey][subject] = { teacher, count }
  tt.activeClasses.forEach(c => { data[c.key] = {}; });
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e) return;
        bySubject.add(e.subject);
        if (!data[c.key][e.subject]) data[c.key][e.subject] = { teacher: e.teacher, count: 0 };
        data[c.key][e.subject].count++;
      });
    }
  });
  const subjectsOrdered = (state.subjects || []).filter(s => bySubject.has(s));
  bySubject.forEach(s => { if (!subjectsOrdered.includes(s)) subjectsOrdered.push(s); });
  return { data, subjects: subjectsOrdered };
}

function renderSimplifiedTable() {
  const table = document.getElementById('timetable-simple-output');
  const tt = state.timetable;
  if (!table || !tt) return;

  const { data, subjects } = computeSimplifiedData(tt);

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th>الصف - الشعبة</th>` + subjects.map(s => `<th>${s}</th>`).join('');
  thead.appendChild(row1);

  const tbody = document.createElement('tbody');
  tt.activeClasses.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${c.grade} - ${c.section}</th>` + subjects.map(s => {
      const cell = data[c.key][s];
      return `<td>${cell ? `${cell.teacher} (${cell.count})` : '—'}</td>`;
    }).join('');
    tbody.appendChild(tr);
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

// ═══════════════════════════════════════════════════════════════
// جداول تقارير إضافية مبنية على المعلمين — كلها للعرض فقط (بلا سحب/إفلات)، تُحدَّث تلقائيًا مع كل رسم
// لجدول النتيجة. المعلمون المعروضون في كل جدول هم فقط من لهم حصة واحدة فعلية على الأقل في الجدول الحالي.
// ═══════════════════════════════════════════════════════════════

// يُرجع قائمة المعلمين الظاهرين فعليًا في الجدول الحالي (معرّف + اسم)، مرتبة أبجديًا عربيًا
function getScheduledTeachers(tt) {
  const map = new Map(); // teacherId -> name
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e) return;
        if (!map.has(e.teacherId)) map.set(e.teacherId, e.teacher);
      });
    }
  });
  return [...map.entries()]
    .map(([teacherId, name]) => ({ teacherId, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

// ── جدول ١: أوقات فراغ المعلمين (مرآة الجدول التفصيلي — يُظهر الفراغ بدل الإشغال) ──────────────

function computeTeacherBusySlots(tt) {
  const busy = {}; // teacherId -> Set("يوم|حصة")
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e) return;
        if (!busy[e.teacherId]) busy[e.teacherId] = new Set();
        busy[e.teacherId].add(`${day}|${p}`);
      });
    }
  });
  return busy;
}

function renderTeacherFreeTable() {
  const table = document.getElementById('timetable-free-output');
  const tt = state.timetable;
  if (!table || !tt) return;

  const teachers = getScheduledTeachers(tt);
  const busy = computeTeacherBusySlots(tt);

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th class="tt-day-col">اليوم</th><th class="tt-period-col">الحصة</th>` +
    teachers.map(t => `<th>${t.name}</th>`).join('');
  thead.appendChild(row1);

  const tbody = document.createElement('tbody');
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const tr = document.createElement('tr');
      if (p === 1) {
        tr.className = 'tt-day-start'; // فاصل بصري واضح بين كل يوم والذي يليه
        tr.innerHTML += `<th rowspan="${tt.maxPeriods}" class="tt-day-col">${day}</th>`;
      }
      tr.innerHTML += `<th class="tt-period-col">${p}</th>`;
      teachers.forEach(t => {
        const isFree = !(busy[t.teacherId] && busy[t.teacherId].has(`${day}|${p}`));
        tr.innerHTML += isFree ? `<td class="tt-free-yes">متاح</td>` : `<td class="tt-free-no">مشغول</td>`;
      });
      tbody.appendChild(tr);
    }
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

// ── جدول ٢: عدد حصص كل معلم في كل رقم حصة (مجموعًا عبر كل الأيام) ─────────────────────────────

function computeTeacherPeriodLoad(tt) {
  const teachers = getScheduledTeachers(tt);
  const counts = {}; // teacherId -> { period: count }
  teachers.forEach(t => {
    counts[t.teacherId] = {};
    for (let p = 1; p <= tt.maxPeriods; p++) counts[t.teacherId][p] = 0;
  });
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e || !counts[e.teacherId]) return;
        counts[e.teacherId][p]++;
      });
    }
  });
  return { teachers, counts };
}

function renderTeacherPeriodLoadTable() {
  const table = document.getElementById('timetable-load-output');
  const tt = state.timetable;
  if (!table || !tt) return;

  const { teachers, counts } = computeTeacherPeriodLoad(tt);
  const periods = Array.from({ length: tt.maxPeriods }, (_, i) => i + 1);

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th>المعلم</th>` + periods.map(p => `<th>الحصة ${p}</th>`).join('');
  thead.appendChild(row1);

  const tbody = document.createElement('tbody');
  teachers.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${t.name}</th>` + periods.map(p => {
      const c = counts[t.teacherId][p] || 0;
      return `<td class="${c > 0 ? 'tt-load-has' : 'free-cell'}">${c || '—'}</td>`;
    }).join('');
    tbody.appendChild(tr);
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

// ── جدول ٣: الجدول الرئيسي حسب المعلم (يوم/حصة × معلم ← الشعبة المُسنَد إليها) ──────────────────

function computeTeacherAssignments(tt) {
  const assign = {}; // teacherId -> "يوم|حصة" -> classKey
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e) return;
        if (!assign[e.teacherId]) assign[e.teacherId] = {};
        assign[e.teacherId][`${day}|${p}`] = c.key;
      });
    }
  });
  return assign;
}

function renderTeacherMasterScheduleTable() {
  const table = document.getElementById('timetable-byteacher-output');
  const tt = state.timetable;
  if (!table || !tt) return;

  const teachers = getScheduledTeachers(tt);
  const assign = computeTeacherAssignments(tt);

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th class="tt-day-col">اليوم</th><th class="tt-period-col">الحصة</th>` +
    teachers.map(t => `<th>${t.name}</th>`).join('');
  thead.appendChild(row1);

  const tbody = document.createElement('tbody');
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const tr = document.createElement('tr');
      if (p === 1) {
        tr.className = 'tt-day-start'; // فاصل بصري واضح بين كل يوم والذي يليه
        tr.innerHTML += `<th rowspan="${tt.maxPeriods}" class="tt-day-col">${day}</th>`;
      }
      tr.innerHTML += `<th class="tt-period-col">${p}</th>`;
      teachers.forEach(t => {
        const ck = assign[t.teacherId] && assign[t.teacherId][`${day}|${p}`];
        if (ck) {
          const cls = tt.activeClasses.find(c => c.key === ck);
          const label = cls ? `${cls.grade} - ${cls.section}` : ck;
          tr.innerHTML += `<td class="tt-load-has">${label}</td>`;
        } else {
          tr.innerHTML += `<td class="free-cell">—</td>`;
        }
      });
      tbody.appendChild(tr);
    }
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

// ── جدول ٤: المعلمون × الشعب (المادة وعدد حصصها الأسبوعية لكل معلم في كل شعبة يُدرِّسها) ──────────

function computeTeacherClassData(tt) {
  const teachers = getScheduledTeachers(tt);
  const data = {}; // teacherId -> classKey -> { subject: count }
  teachers.forEach(t => { data[t.teacherId] = {}; });
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (!e || !data[e.teacherId]) return;
        if (!data[e.teacherId][c.key]) data[e.teacherId][c.key] = {};
        data[e.teacherId][c.key][e.subject] = (data[e.teacherId][c.key][e.subject] || 0) + 1;
      });
    }
  });
  return { teachers, data };
}

// إجمالي حصص كل معلم (مجموع كل الشعب)، وإجمالي كل شعبة (مجموع كل المعلمين)، والإجمالي الكلي — من نفس بنية
// data التي يبنيها computeTeacherClassData أعلاه، بجمع أعداد كل مادة داخل كل خانة (المعلم × الشعبة)
function computeTeacherClassTotals(teachers, classes, data) {
  const rowTotals = {};
  const colTotals = {};
  let grandTotal = 0;
  teachers.forEach(t => { rowTotals[t.teacherId] = 0; });
  classes.forEach(c => { colTotals[c.key] = 0; });

  teachers.forEach(t => {
    classes.forEach(c => {
      const subs = data[t.teacherId][c.key];
      if (!subs) return;
      const cellSum = Object.values(subs).reduce((s, v) => s + v, 0);
      rowTotals[t.teacherId] += cellSum;
      colTotals[c.key] += cellSum;
      grandTotal += cellSum;
    });
  });

  return { rowTotals, colTotals, grandTotal };
}

function renderTeacherClassTable() {
  const table = document.getElementById('timetable-teacherclass-output');
  const tt = state.timetable;
  if (!table || !tt) return;

  const { teachers, data } = computeTeacherClassData(tt);
  const classes = tt.activeClasses;
  const { rowTotals, colTotals, grandTotal } = computeTeacherClassTotals(teachers, classes, data);

  const thead = document.createElement('thead');
  const row1 = document.createElement('tr');
  row1.innerHTML = `<th>المعلم</th>` + classes.map(c => `<th>${c.grade} - ${c.section}</th>`).join('') + `<th>الإجمالي</th>`;
  thead.appendChild(row1);

  const tbody = document.createElement('tbody');
  teachers.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${t.name}</th>` + classes.map(c => {
      const subs = data[t.teacherId][c.key];
      if (!subs) return `<td class="free-cell">—</td>`;
      const parts = Object.keys(subs).map(s => `${s} (${subs[s]})`);
      return `<td class="tt-load-has">${parts.join('<br>')}</td>`;
    }).join('') + `<td class="tt-total-cell">${rowTotals[t.teacherId]}</td>`;
    tbody.appendChild(tr);
  });

  // صف الإجمالي الأخير: مجموع كل عمود (شعبة)، وخانة التقاطع أسفل عمود الإجمالي تحمل الإجمالي الكلي
  const totalTr = document.createElement('tr');
  totalTr.innerHTML = `<th>الإجمالي</th>` +
    classes.map(c => `<td class="tt-total-cell">${colTotals[c.key]}</td>`).join('') +
    `<td class="tt-total-cell tt-grand-total">${grandTotal}</td>`;
  tbody.appendChild(totalTr);

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
}

// ═══════════════════════════════════════════════════════════════
// تصدير Excel عبر الجسر — يبني نفس محتوى الجداول الستة أعلاه بصيغة خلايا/دمج محايدة (بدل HTML)، ليُرسَل
// إلى الطبقة الأصلية (C#) فتحوّله إلى ملف .xlsx حقيقي بدل الاعتماد على طباعة المتصفح (window.print)
// ═══════════════════════════════════════════════════════════════
// كل دالة buildXxxSheet تعيد {name, headerRows, bodyRows} — كل صف مصفوفة خلايا {text, colSpan, rowSpan,
// style}، بنفس دلالة rowspan/colspan في HTML بالضبط، وتُبنى من نفس دوال الحساب المستخدَمة أصلًا في رسم
// الجداول على الشاشة (computeSimplifiedData، getScheduledTeachers، إلخ) — لا منطق عمل جديد، فقط تمثيل مختلف
// للمخرجات نفسها.

function cell(text, opts) {
  return Object.assign({ text: text === undefined || text === null ? '' : String(text), colSpan: 1, rowSpan: 1 }, opts || {});
}

function buildDetailedSheet() {
  const tt = state.timetable;
  const classes = tt.activeClasses;

  const row1 = [cell('اليوم', { rowSpan: 2, style: 'header' }), cell('الحصة', { rowSpan: 2, style: 'header' })];
  classes.forEach(c => row1.push(cell(`${c.grade} - ${c.section}`, { colSpan: 2, style: 'header' })));
  const row2 = [];
  classes.forEach(() => { row2.push(cell('المادة', { style: 'header' })); row2.push(cell('المعلم', { style: 'header' })); });

  const bodyRows = [];
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const row = [];
      if (p === 1) row.push(cell(day, { rowSpan: tt.maxPeriods, style: 'rowheader' }));
      row.push(cell(p, { style: 'rowheader' }));
      classes.forEach(c => {
        const entry = tt.schedule[day][p][c.key];
        if (entry) { row.push(cell(entry.subject)); row.push(cell(entry.teacher, { style: 'muted' })); }
        else { row.push(cell('فارغة', { colSpan: 2, style: 'muted' })); }
      });
      bodyRows.push(row);
    }
  });

  return { name: 'الجدول التفصيلي', headerRows: [row1, row2], bodyRows };
}

function buildSimplifiedSheet() {
  const tt = state.timetable;
  const { data, subjects } = computeSimplifiedData(tt);

  const headerRow = [cell('الصف - الشعبة', { style: 'header' })];
  subjects.forEach(s => headerRow.push(cell(s, { style: 'header' })));

  const bodyRows = tt.activeClasses.map(c => {
    const row = [cell(`${c.grade} - ${c.section}`, { style: 'rowheader' })];
    subjects.forEach(s => {
      const d = data[c.key][s];
      row.push(d ? cell(`${d.teacher} (${d.count})`) : cell('—', { style: 'muted' }));
    });
    return row;
  });

  return { name: 'الجدول المبسّط', headerRows: [headerRow], bodyRows };
}

function buildFreeSheet() {
  const tt = state.timetable;
  const teachers = getScheduledTeachers(tt);
  const busy = computeTeacherBusySlots(tt);

  const headerRow = [cell('اليوم', { style: 'header' }), cell('الحصة', { style: 'header' })];
  teachers.forEach(t => headerRow.push(cell(t.name, { style: 'header' })));

  const bodyRows = [];
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const row = [];
      if (p === 1) row.push(cell(day, { rowSpan: tt.maxPeriods, style: 'rowheader' }));
      row.push(cell(p, { style: 'rowheader' }));
      teachers.forEach(t => {
        const isFree = !(busy[t.teacherId] && busy[t.teacherId].has(`${day}|${p}`));
        row.push(isFree ? cell('متاح', { style: 'free' }) : cell('مشغول', { style: 'muted' }));
      });
      bodyRows.push(row);
    }
  });

  return { name: 'أوقات فراغ المعلمين', headerRows: [headerRow], bodyRows };
}

function buildLoadSheet() {
  const tt = state.timetable;
  const { teachers, counts } = computeTeacherPeriodLoad(tt);
  const periods = Array.from({ length: tt.maxPeriods }, (_, i) => i + 1);

  const headerRow = [cell('المعلم', { style: 'header' })];
  periods.forEach(p => headerRow.push(cell(`الحصة ${p}`, { style: 'header' })));

  const bodyRows = teachers.map(t => {
    const row = [cell(t.name, { style: 'rowheader' })];
    periods.forEach(p => {
      const c = counts[t.teacherId][p] || 0;
      row.push(c > 0 ? cell(c) : cell('—', { style: 'muted' }));
    });
    return row;
  });

  return { name: 'التحميل حسب الحصة', headerRows: [headerRow], bodyRows };
}

function buildByTeacherSheet() {
  const tt = state.timetable;
  const teachers = getScheduledTeachers(tt);
  const assign = computeTeacherAssignments(tt);

  const headerRow = [cell('اليوم', { style: 'header' }), cell('الحصة', { style: 'header' })];
  teachers.forEach(t => headerRow.push(cell(t.name, { style: 'header' })));

  const bodyRows = [];
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const row = [];
      if (p === 1) row.push(cell(day, { rowSpan: tt.maxPeriods, style: 'rowheader' }));
      row.push(cell(p, { style: 'rowheader' }));
      teachers.forEach(t => {
        const ck = assign[t.teacherId] && assign[t.teacherId][`${day}|${p}`];
        if (ck) {
          const cls = tt.activeClasses.find(c => c.key === ck);
          row.push(cell(cls ? `${cls.grade} - ${cls.section}` : ck));
        } else {
          row.push(cell('—', { style: 'muted' }));
        }
      });
      bodyRows.push(row);
    }
  });

  return { name: 'الجدول حسب المعلم', headerRows: [headerRow], bodyRows };
}

function buildTeacherClassSheet() {
  const tt = state.timetable;
  const { teachers, data } = computeTeacherClassData(tt);
  const classes = tt.activeClasses;
  const { rowTotals, colTotals, grandTotal } = computeTeacherClassTotals(teachers, classes, data);

  const headerRow = [cell('المعلم', { style: 'header' })];
  classes.forEach(c => headerRow.push(cell(`${c.grade} - ${c.section}`, { style: 'header' })));
  headerRow.push(cell('الإجمالي', { style: 'header' }));

  const bodyRows = teachers.map(t => {
    const row = [cell(t.name, { style: 'rowheader' })];
    classes.forEach(c => {
      const subs = data[t.teacherId][c.key];
      if (!subs) { row.push(cell('—', { style: 'muted' })); return; }
      // فاصل الأسطر هنا سطر جديد فعلي (Excel يعرضه بشكل صحيح بفضل التفاف النص المُفعَّل تلقائيًا)، لا <br>
      row.push(cell(Object.keys(subs).map(s => `${s} (${subs[s]})`).join('\n')));
    });
    row.push(cell(rowTotals[t.teacherId], { style: 'rowheader' }));
    return row;
  });

  // صف الإجمالي الأخير (نفس تنسيق الرأس، بوضعه ضمن bodyRows مع style:'header' على كل خلاياه)
  const totalRow = [cell('الإجمالي', { style: 'header' })];
  classes.forEach(c => totalRow.push(cell(colTotals[c.key], { style: 'header' })));
  totalRow.push(cell(grandTotal, { style: 'header' }));
  bodyRows.push(totalRow);

  return { name: 'المعلمون والشعب', headerRows: [headerRow], bodyRows };
}

function buildExcelExportRequest() {
  return {
    sheets: [
      buildDetailedSheet(),
      buildSimplifiedSheet(),
      buildFreeSheet(),
      buildLoadSheet(),
      buildByTeacherSheet(),
      buildTeacherClassSheet()
    ],
    suggestedFileName: `جدول الحصص ${new Date().toISOString().slice(0, 10)}.xlsx`
  };
}

let __exportInFlight = false;

async function exportToExcel() {
  if (!state.timetable) { toast('لا يوجد جدول لتصديره بعد. وَلِّد الجدول أولًا.', 'error'); return; }
  if (__exportInFlight) return;

  if (!isBridgeAvailable()) {
    // مسار احتياطي للتطوير خارج غلاف WebView2 — لا محرّك Excel أصلي متاح هناك
    window.print();
    return;
  }

  __exportInFlight = true;
  const btn = document.getElementById('btn-export-excel');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'جارٍ التصدير…';

  try {
    const payload = buildExcelExportRequest();
    console.log('[exportToExcel] الحمولة المبنية:', { sheetsCount: payload.sheets.length, suggestedFileName: payload.suggestedFileName });
    const result = await callExcelExportBridge(payload, 30000);
    console.log('[exportToExcel] النتيجة المستلَمة من الجسر:', result);

    if (result.cancelled) {
      // المستخدم ألغى نافذة "حفظ باسم" — لا حاجة لإظهار أي رسالة خطأ
    } else if (result.isSuccess) {
      toast('تم تصدير الجدول إلى Excel بنجاح.', 'success');
    } else {
      toast(`تعذّر تصدير الجدول: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    }
  } catch (err) {
    console.error('[exportToExcel] استثناء أثناء التصدير:', err);
    toast(`تعذّر الاتصال بمحرّك التصدير: ${err.message || err}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
    __exportInFlight = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// تصدير "نصاب المعلمين" — ورقة مستقلة لكل معلم (الصف/الشعبة، المادة، عدد الحصص الأسبوعية)
// ═══════════════════════════════════════════════════════════════
// يُبنى من التعيينات المُعدَّة في الخطوة الرابعة وعدد الحصص المقرَّر لكل مادة/صف في الخطوة الثانية — لا من
// الجدول المُولَّد نفسه إطلاقًا. هذا مقصود: هذا مستند "ما يجب أن يكون" (النصاب المُخطَّط) لا "ما تحقّق فعليًا
// بالتوليد" (الذي قد يختلف لو بقيت حصص غير موضوعة) — فيبقى صحيحًا وذا معنى حتى قبل أي توليد، ويصلح كنموذج
// يُرسَل لمدرسة لمراجعته وتصحيح تعييناتها يدويًا قبل التوليد (راجع النقاش) — بلا أي محاولة لاحقًا لقراءة
// نسخة مُعدَّلة عادت من المدرسة تلقائيًا؛ هذا تصدير فقط، عمدًا بلا استيراد مقابل.
function buildTeacherLoadSheets() {
  // ترتيب أبجدي لأسهل تصفّح بين أوراق العمل، لا ترتيب إدخال عشوائي يعتمد على متى أُضيف كل معلم
  const teachersSorted = state.teachers.slice().sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  return teachersSorted.map(t => {
    const titleRow = [cell(`توزيع الحصص الأسبوعي — ${t.name}`, { colSpan: 3, style: 'header' })];
    const colHeaderRow = [
      cell('الصف - الشعبة', { style: 'header' }),
      cell('المادة', { style: 'header' }),
      cell('عدد الحصص الأسبوعية', { style: 'header' }),
    ];

    // بترتيب الصف/الشعبة كما أُدخلا في إعدادات المدرسة، لا أبجديًا — أسماء الصفوف الترتيبية العربية ("الأول"،
    // "الثاني"، ...) لا تُرتَّب أبجديًا بصورة صحيحة، فيُستخدَم موضعها الفعلي ضمن state.grades/state.sections بدلًا
    const sortedAssignments = (t.assignments || []).slice().sort((a, b) => {
      const gi = state.grades.indexOf(a.grade) - state.grades.indexOf(b.grade);
      if (gi !== 0) return gi;
      return state.sections.indexOf(a.section) - state.sections.indexOf(b.section);
    });

    let total = 0;
    const dataRows = sortedAssignments.map(a => {
      const periods = state.subjectPeriods[subjectGradeKey(a.subject, a.grade)] || 0;
      total += periods;
      return [cell(`${a.grade} - ${a.section}`), cell(a.subject), cell(periods)];
    });

    // معلم بلا أي تعيينات: يحصل على ورقته أيضًا (جدول فارغ، إجمالي صفر) بدل استبعاده كليًا من الملف — حتى
    // لا يغيب أي معلم عن الملف صامتًا عند إرساله لمدرسة لمراجعته، مهما كان نصابه الحالي قليلًا أو معدومًا
    const totalRow = [cell('الإجمالي', { colSpan: 2, style: 'rowheader' }), cell(total, { style: 'rowheader' })];

    return { name: t.name, headerRows: [titleRow, colHeaderRow], bodyRows: [...dataRows, totalRow] };
  });
}

let __teacherLoadExportInFlight = false;

async function exportTeacherLoadWorkbook() {
  if (state.teachers.length === 0) { toast('لا يوجد معلمون مُضافون بعد.', 'error'); return; }
  if (__teacherLoadExportInFlight) return;

  if (!isBridgeAvailable()) {
    window.print();
    return;
  }

  __teacherLoadExportInFlight = true;
  const btn = document.getElementById('btn-export-teacher-load');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'جارٍ التصدير…';

  try {
    const payload = {
      sheets: buildTeacherLoadSheets(),
      suggestedFileName: `نصاب المعلمين ${new Date().toISOString().slice(0, 10)}.xlsx`,
    };
    console.log('[exportTeacherLoadWorkbook] الحمولة المبنية:', { sheetsCount: payload.sheets.length, suggestedFileName: payload.suggestedFileName });
    const result = await callExcelExportBridge(payload, 30000);
    console.log('[exportTeacherLoadWorkbook] النتيجة المستلَمة من الجسر:', result);

    if (result.cancelled) {
      // المستخدم ألغى نافذة "حفظ باسم" — لا حاجة لإظهار أي رسالة خطأ
    } else if (result.isSuccess) {
      toast('تم تصدير نصاب المعلمين بنجاح.', 'success');
    } else {
      toast(`تعذّر تصدير الملف: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    }
  } catch (err) {
    console.error('[exportTeacherLoadWorkbook] استثناء أثناء التصدير:', err);
    toast(`تعذّر الاتصال بمحرّك التصدير: ${err.message || err}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
    __teacherLoadExportInFlight = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// تصدير "جداول المعلمين" — ورقة مستقلة لكل معلم، جدوله الأسبوعي الفعلي من الجدول المُولَّد
// ═══════════════════════════════════════════════════════════════
// عكس محاور "الجدول حسب المعلم" (buildByTeacherSheet): تلك ورقة واحدة مشتركة بعمود لكل معلم؛ هذه ورقة واحدة
// لكل معلم بعمود لكل يوم — بما أن كل ورقة مخصَّصة لمعلم واحد فلا حاجة لعمود منفصل لكل معلم بعد الآن، وعمود
// لكل يوم أقرب لشكل جدول حقيقي يقرؤه المعلم نفسه مباشرة. يعتمد على الجدول المُولَّد فعليًا (بخلاف "نصاب
// المعلمين" أعلاه المبني من التعيينات المُعدَّة فقط) — فلا معنى له قبل التوليد.
function buildTeacherSchedulesSheets() {
  const tt = state.timetable;
  const teachers = getScheduledTeachers(tt).slice().sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  const assign = computeTeacherAssignments(tt);

  return teachers.map(t => {
    const titleRow = [cell(`الجدول الأسبوعي — ${t.name}`, { colSpan: tt.days.length + 1, style: 'header' })];
    const colHeaderRow = [cell('الحصة', { style: 'header' })];
    tt.days.forEach(day => colHeaderRow.push(cell(day, { style: 'header' })));

    const bodyRows = [];
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const row = [cell(p, { style: 'rowheader' })];
      tt.days.forEach(day => {
        const ck = assign[t.teacherId] && assign[t.teacherId][`${day}|${p}`];
        if (ck) {
          const cls = tt.activeClasses.find(c => c.key === ck);
          row.push(cell(cls ? `${cls.grade} - ${cls.section}` : ck));
        } else {
          row.push(cell('—', { style: 'muted' }));
        }
      });
      bodyRows.push(row);
    }

    return {
      name: t.name,
      headerRows: [titleRow, colHeaderRow],
      bodyRows,
      // A4 أفقي (Landscape) — الأعمدة (الحصة + حتى ٦-٧ أيام) أعرض من الصفوف عادةً، فيناسبها الاتجاه الأفقي
      // أكثر من الرأسي. fitToOnePage يُقلِّص المحتوى تلقائيًا ليلائم صفحة واحدة، فلا حاجة لأي تقسيم يدوي
      // للصفحات — وبما أن كل معلم على ورقة منفصلة أصلًا، فحدود الورقة نفسها تُصبح حدّ الصفحة عند الطباعة،
      // فتُطبَع كل ورقة (كل معلم) في صفحة واحدة مستقلة تلقائيًا دون أي إعداد إضافي مطلوب
      printOrientation: 'landscape',
      fitToOnePage: true,
    };
  });
}

let __teacherSchedulesExportInFlight = false;

async function exportTeacherSchedulesWorkbook() {
  if (!state.timetable) { toast('لا يوجد جدول لتصديره بعد. وَلِّد الجدول أولًا.', 'error'); return; }
  if (__teacherSchedulesExportInFlight) return;

  if (!isBridgeAvailable()) {
    window.print();
    return;
  }

  __teacherSchedulesExportInFlight = true;
  const btn = document.getElementById('btn-export-teacher-schedules');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'جارٍ التصدير…';

  try {
    const payload = {
      sheets: buildTeacherSchedulesSheets(),
      suggestedFileName: `جداول المعلمين ${new Date().toISOString().slice(0, 10)}.xlsx`,
    };
    console.log('[exportTeacherSchedulesWorkbook] الحمولة المبنية:', { sheetsCount: payload.sheets.length, suggestedFileName: payload.suggestedFileName });
    const result = await callExcelExportBridge(payload, 30000);
    console.log('[exportTeacherSchedulesWorkbook] النتيجة المستلَمة من الجسر:', result);

    if (result.cancelled) {
      // المستخدم ألغى نافذة "حفظ باسم" — لا حاجة لإظهار أي رسالة خطأ
    } else if (result.isSuccess) {
      toast('تم تصدير جداول المعلمين بنجاح.', 'success');
    } else {
      toast(`تعذّر تصدير الملف: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    }
  } catch (err) {
    console.error('[exportTeacherSchedulesWorkbook] استثناء أثناء التصدير:', err);
    toast(`تعذّر الاتصال بمحرّك التصدير: ${err.message || err}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
    __teacherSchedulesExportInFlight = false;
  }
}

function callOfficialTimetableExportBridge(payload, timeoutMs) {
  return callBridge('exportOfficialTimetable', payload, timeoutMs, 'ot');
}

// يبني حمولة تصدير النموذج الرسمي من جدول النتيجة الحالي (نفس بيانات "الجدول التفصيلي" بالضبط) وبيانات
// المدرسة الإدارية المخصَّصة (الخطوة الأولى) — راجع OfficialTimetableExcelService.cs على الجانب الآخر
function buildOfficialTimetableExportRequest() {
  const tt = state.timetable;
  const schedule = {};
  tt.days.forEach(day => {
    schedule[day] = {};
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const perClass = {};
      tt.activeClasses.forEach(c => {
        const e = tt.schedule[day][p][c.key];
        if (e) perClass[c.key] = { subject: e.subject, teacher: e.teacher };
      });
      schedule[day][p] = perClass;
    }
  });

  return {
    header: {
      schoolYear: state.schoolInfo.schoolYear || '',
      directorateName: state.schoolInfo.directorateName || '',
      schoolName: state.schoolInfo.schoolName || '',
      cityName: state.schoolInfo.cityName || '',
      formNumber: state.schoolInfo.formNumber || 'نموذج (11)',
    },
    days: tt.days,
    maxPeriods: tt.maxPeriods,
    classes: tt.activeClasses.map(c => ({ grade: c.grade, section: c.section })),
    schedule,
    suggestedFileName: `جدول ترتيب الدروس ${new Date().toISOString().slice(0, 10)}.xlsx`
  };
}

let __officialExportInFlight = false;

async function exportOfficialTimetable() {
  if (!state.timetable) { toast('لا يوجد جدول لتصديره بعد. وَلِّد الجدول أولًا.', 'error'); return; }
  if (__officialExportInFlight) return;

  if (!isBridgeAvailable()) {
    toast('تصدير النموذج الرسمي متاح فقط داخل تطبيق سطح المكتب.', 'error');
    return;
  }

  __officialExportInFlight = true;
  const btn = document.getElementById('btn-export-official');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'جارٍ التصدير…';

  try {
    const payload = buildOfficialTimetableExportRequest();
    console.log('[exportOfficialTimetable] الحمولة المبنية:', { classesCount: payload.classes.length, days: payload.days, maxPeriods: payload.maxPeriods, suggestedFileName: payload.suggestedFileName });
    const result = await callOfficialTimetableExportBridge(payload, 30000);
    console.log('[exportOfficialTimetable] النتيجة المستلَمة من الجسر:', result);

    if (result.cancelled) {
      // المستخدم ألغى نافذة "حفظ باسم" — لا حاجة لإظهار أي رسالة خطأ
    } else if (result.isSuccess) {
      toast('تم تصدير النموذج الرسمي بنجاح.', 'success');
    } else {
      toast(`تعذّر تصدير النموذج: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    }
  } catch (err) {
    console.error('[exportOfficialTimetable] استثناء أثناء التصدير:', err);
    toast(`تعذّر الاتصال بمحرّك التصدير: ${err.message || err}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
    __officialExportInFlight = false;
  }
}

function applyTimetableTab() {
  document.querySelectorAll('.tt-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === activeTimetableTab));
  document.querySelectorAll('.tt-view').forEach(view => {
    const tab = view.id.replace('tt-view-', '');
    view.classList.toggle('active', tab === activeTimetableTab);
  });
}

// يربط أحداث النقر والسحب/الإفلات بجدول النتيجة والقائمة الجانبية والتبويبات مرة واحدة فقط عند بدء التطبيق
// (العناصر نفسها لا تُستبدل بين عمليات إعادة الرسم، فقط محتواها الداخلي)
// ═══════════════════════════════════════════════════════════════
// تغيير معلم مادة لشعبة معيّنة (بعد التوليد) — عبر القائمة السياقية (زر الفأرة الأيمن) على "الجدول التفصيلي"
// ═══════════════════════════════════════════════════════════════
// التغيير يشمل علاقة "هذا المعلم يُدرِّس هذه المادة لهذه الشعبة" كاملةً عبر الأسبوع، لا خانة واحدة بعينها —
// فحصة واحدة منقورة عليها هي مجرّد نقطة انطلاق لتحديد أي (مادة، شعبة) يقصدها المستخدم بالضبط.

let __contextMenuCellRef = null;

// x/y هنا إحداثيات نسبية لإطار العرض (viewport) — أي clientX/clientY، لا pageX/pageY — لأن القائمة الآن
// position:fixed (راجع سبب ذلك في styles.css: #app-viewport نفسه position:relative وله تمرير داخلي خاص
// به، فكانت pageX/pageY تُحسَب بمعزل عن مقدار ذلك التمرير، ما يُبعد القائمة عن موضع النقر فعليًا كلما نزل
// المستخدم في الصفحة). تُحاط القيم أيضًا بحد أقصى لعرض/ارتفاع النافذة، حتى لا تخرج القائمة جزئيًا عن الشاشة
// عند النقر قرب حافتها اليمنى أو السفلى.
function showCellContextMenu(x, y, cellRef) {
  __contextMenuCellRef = cellRef;
  const menu = document.getElementById('cell-context-menu');
  const menuWidth = 220; // تقدير معقول قبل القياس الفعلي (العرض الأدنى المضبوط في CSS هو 210px)
  const menuHeight = 44; // عنصر واحد حاليًا؛ يُعاد النظر في هذا التقدير إن أُضيفت عناصر أخرى للقائمة لاحقًا
  const maxLeft = Math.max(0, window.innerWidth - menuWidth);
  const maxTop = Math.max(0, window.innerHeight - menuHeight);
  menu.style.left = Math.min(x, maxLeft) + 'px';
  menu.style.top = Math.min(y, maxTop) + 'px';
  menu.classList.add('show');
}
function hideCellContextMenu() {
  document.getElementById('cell-context-menu').classList.remove('show');
  __contextMenuCellRef = null;
}
document.addEventListener('click', hideCellContextMenu);
document.addEventListener('contextmenu', (e) => {
  // إغلاق أي قائمة سياقية مفتوحة سابقًا إن نُقر بالزر الأيمن خارج جدول التفصيل تمامًا
  if (!e.target.closest('#timetable-output')) hideCellContextMenu();
});

document.getElementById('ctx-change-teacher').addEventListener('click', (e) => {
  e.stopPropagation();
  const cellRef = __contextMenuCellRef;
  hideCellContextMenu();
  if (cellRef) openReassignTeacherModal(cellRef);
});

let __reassignCellRef = null;

function openReassignTeacherModal(cellRef) {
  const tt = state.timetable;
  const entry = tt.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (!entry) return;
  __reassignCellRef = cellRef;

  const c = tt.activeClasses.find(x => x.key === cellRef.classKey);
  const classLabel = c ? `${c.grade} - ${c.section}` : cellRef.classKey;

  document.getElementById('reassign-teacher-desc').textContent =
    `المادة "${entry.subject}" لشعبة ${classLabel}، المُدرِّس الحالي: ${entry.teacher}. اختر المعلم الجديد — سيُطبَّق هذا على كل حصص هذه المادة لهذه الشعبة عبر الأسبوع، لا هذه الحصة وحدها.`;

  const select = document.getElementById('reassign-teacher-select');
  const otherTeachers = state.teachers.filter(t => t.id !== entry.teacherId).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  select.innerHTML = otherTeachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

  document.getElementById('reassign-teacher-modal').classList.add('show');
}
function closeReassignTeacherModal() {
  document.getElementById('reassign-teacher-modal').classList.remove('show');
  __reassignCellRef = null;
}
document.getElementById('btn-reassign-teacher-cancel').addEventListener('click', closeReassignTeacherModal);
document.getElementById('btn-reassign-teacher-close').addEventListener('click', closeReassignTeacherModal);
document.getElementById('btn-reassign-teacher-confirm').addEventListener('click', async () => {
  const cellRef = __reassignCellRef;
  const newTeacherId = document.getElementById('reassign-teacher-select').value;
  closeReassignTeacherModal();
  if (cellRef && newTeacherId) await attemptReassignTeacher(cellRef, newTeacherId);
});

// أي معلم بلا شرط سابق بتدريس هذه المادة (لا قائمة مقيَّدة بمن يُدرِّسها فعلًا في مكان آخر) — القرار مسؤولية
// المستخدم الكاملة. تُجمَع كل حصص (هذه المادة، هذه الشعبة) عبر الأسبوع، وتُفحَص كل واحدة عبر canPlaceAt نفسها
// المستخدَمة في كل مكان آخر بالجدول؛ ما يتعارض منها (المعلم الجديد مشغول بشعبة أخرى، أو ممنوع في ذلك الوقت)
// يُعرَض على المستخدم أولًا للتأكيد، لا يُطبَّق صامتًا — وعند الموافقة تُنقَل تلك الحصص تحديدًا إلى "الحصص
// غير المثبّتة" ليحلّها المستخدم يدويًا، بدل محاولة إيجاد مكان بديل تلقائيًا لها (قرار المستخدم، لا الخوارزمية)
async function attemptReassignTeacher(cellRef, newTeacherId) {
  const tt = state.timetable;
  if (!tt) return;
  const currentEntry = tt.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (!currentEntry) return;

  const oldTeacherId = currentEntry.teacherId;
  const subject = currentEntry.subject;
  const classKeyVal = cellRef.classKey;
  const [grade, section] = classKeyVal.split('___');

  const newTeacher = state.teachers.find(t => t.id === newTeacherId);
  if (!newTeacher) return;
  if (newTeacherId === oldTeacherId) { toast('هذا هو المعلم الحالي أصلًا لهذه المادة.', 'info'); return; }

  const occurrences = [];
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const e = tt.schedule[day][p][classKeyVal];
      if (e && e.subject === subject && e.teacherId === oldTeacherId) occurrences.push({ day, period: p });
    }
  });

  const okList = [];
  const conflicts = [];
  occurrences.forEach(({ day, period }) => {
    const check = canPlaceAt({ subject, teacher: newTeacher.name, teacherId: newTeacherId }, day, period, classKeyVal, null, null, false);
    if (check.ok) okList.push({ day, period });
    else conflicts.push({ day, period, reason: check.reason });
  });

  const c = getActiveClassList().find(x => x.key === classKeyVal);
  const classLabel = c ? `${c.grade} - ${c.section}` : classKeyVal;

  if (conflicts.length > 0) {
    const items = conflicts.map(({ day, period, reason }) => ({
      label: `${subject} — ${classLabel}`,
      reason: `${day} — الحصة ${period} — ${reason}`
    }));
    const summary = `إسناد "${newTeacher.name}" لمادة "${subject}" لشعبة ${classLabel} سيتعذّر في ${conflicts.length} ${conflicts.length === 1 ? 'حصة' : 'حصص'} بسبب تعارض وقت المعلم الجديد. عند المتابعة ستُنقَل هذه الحصص تحديدًا إلى "الحصص غير المثبّتة" ليتم حلّها يدويًا، بينما تُطبَّق بقية الحصص (${okList.length} من ${occurrences.length}) بلا مشكلة. لإلغاء التغيير كليًا بدلًا من ذلك، اختر "إلغاء هذا التغيير".`;
    const proceed = await showConflictConfirmModal(items, 'تغيير المعلم سيُعطِّل بعض الحصص', summary, 'متابعة ونقل المتعارضة لغير المثبّتة');
    if (!proceed) return;
  }

  pushUndoSnapshot();

  const oldTeacher = state.teachers.find(t => t.id === oldTeacherId);
  if (oldTeacher) {
    oldTeacher.assignments = oldTeacher.assignments.filter(a => !(a.subject === subject && a.grade === grade && a.section === section));
  }
  if (!newTeacher.assignments.some(a => a.subject === subject && a.grade === grade && a.section === section)) {
    newTeacher.assignments.push({ subject, grade, section });
  }

  okList.forEach(({ day, period }) => {
    tt.schedule[day][period][classKeyVal] = { subject, teacher: newTeacher.name, teacherId: newTeacherId };
  });
  conflicts.forEach(({ day, period }) => {
    delete tt.schedule[day][period][classKeyVal];
    if (!tt.unpinned) tt.unpinned = [];
    tt.unpinned.push({ classKey: classKeyVal, subject, teacher: newTeacher.name, teacherId: newTeacherId });
  });

  editSelection = null;
  traySelection = null;
  markDirty();
  renderTimetableOutput();
  renderTeacherList();

  if (conflicts.length > 0) {
    toast(`تم إسناد "${newTeacher.name}" لـ${okList.length} من ${occurrences.length} حصة، ونُقلت ${conflicts.length} حصة إلى "الحصص غير المثبّتة".`, 'info');
  } else {
    toast(`تم إسناد "${newTeacher.name}" لتدريس "${subject}" لشعبة ${classLabel} بنجاح (${okList.length} حصة).`, 'success');
  }
}

function initTimetableEditing() {
  const table = document.getElementById('timetable-output');
  const tray = document.getElementById('tt-tray');
  const tabs = document.querySelector('.tt-tabs');
  if (!table) return;

  // خانة الحصة الواحدة أصبحت عمودين حقيقيين متجاورين (معلم/مادة) بنفس بيانات data-day/period/class،
  // هذه الدالة تُرجع الخانة الشقيقة المرتبطة بنفس الحصة لتطبيق نفس التأثير البصري على الاثنين معًا
  function getLinkedCell(cell) {
    const matches = (el) => el && el.classList && el.classList.contains('tt-cell') &&
      el.dataset.day === cell.dataset.day && el.dataset.period === cell.dataset.period && el.dataset.class === cell.dataset.class;
    const prev = cell.previousElementSibling;
    if (matches(prev)) return prev;
    const next = cell.nextElementSibling;
    if (matches(next)) return next;
    return null;
  }

  // ── التبويبات ──
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tt-tab');
      if (!btn) return;
      activeTimetableTab = btn.dataset.tab;
      applyTimetableTab();
    });
  }

  // ── تحويم الفأرة: يُظهر زر فك التثبيت ويُبرز التأثير على كلا عمودي الحصة معًا (معلم + مادة) ──
  table.addEventListener('mouseover', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell) return;
    const linked = getLinkedCell(cell);
    if (linked) linked.classList.add('linked-hover');
  });
  table.addEventListener('mouseout', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell) return;
    const linked = getLinkedCell(cell);
    if (linked) linked.classList.remove('linked-hover');
  });

  // ── النقر على خانة في الجدول (اختيار/تبديل، أو وضع حصة غير مثبّتة) ──
  table.addEventListener('click', (e) => {
    if (e.target.closest('.unpin-btn')) return; // يُعالَج في مستمع مستقل أدناه
    const cell = e.target.closest('.tt-cell');
    if (!cell) return;
    handleCellPick({ day: cell.dataset.day, period: parseInt(cell.dataset.period, 10), classKey: cell.dataset.class });
  });

  // ── الزر الأيمن على خانة مشغولة: قائمة سياقية بإجراءات خاصة بهذه الخانة (حاليًا: تغيير المعلم) — خانة
  // فارغة ليس لها ما تعرضه هنا، فيُترَك سلوك المتصفح الافتراضي (لا شيء فعليًا، القائمة الأصلية للـWebView2
  // مُعطَّلة من جانب C#) كما هو دون تدخّل
  table.addEventListener('contextmenu', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell || cell.classList.contains('free-cell')) return;
    e.preventDefault();
    e.stopPropagation();
    showCellContextMenu(e.clientX, e.clientY, { day: cell.dataset.day, period: parseInt(cell.dataset.period, 10), classKey: cell.dataset.class });
  });

  // ── زر فك التثبيت ──
  table.addEventListener('click', (e) => {
    const btn = e.target.closest('.unpin-btn');
    if (!btn) return;
    e.stopPropagation();
    unpinCell({ day: btn.dataset.day, period: parseInt(btn.dataset.period, 10), classKey: btn.dataset.class });
  });

  // ── سحب خانة من الجدول (للتبديل مع خانة أخرى، أو لفكّ تثبيتها بإفلاتها على القائمة الجانبية) ──
  table.addEventListener('dragstart', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell || cell.classList.contains('free-cell')) { e.preventDefault(); return; }
    const payload = { source: 'grid', day: cell.dataset.day, period: parseInt(cell.dataset.period, 10), classKey: cell.dataset.class };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  });

  table.addEventListener('dragover', (e) => {
    if (!e.target.closest('.tt-cell')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  table.addEventListener('dragenter', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell) return;
    cell.classList.add('drag-over');
    const linked = getLinkedCell(cell);
    if (linked) linked.classList.add('drag-over');
  });

  table.addEventListener('dragleave', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell) return;
    cell.classList.remove('drag-over');
    const linked = getLinkedCell(cell);
    if (linked) linked.classList.remove('drag-over');
  });

  table.addEventListener('dragend', () => {
    table.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  });

  table.addEventListener('drop', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell) return;
    e.preventDefault();
    let payload;
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (err) { return; }
    const to = { day: cell.dataset.day, period: parseInt(cell.dataset.period, 10), classKey: cell.dataset.class };
    editSelection = null;
    if (payload.source === 'tray') {
      attemptPlaceFromTray(payload.index, to);
    } else {
      traySelection = null;
      attemptSwap(payload, to);
    }
  });

  if (tray) {
    // ── فلاتر القائمة الجانبية (حسب المعلم أو الصف/الشعبة) ──
    tray.addEventListener('change', (e) => {
      if (e.target.id === 'tt-tray-filter-teacher') {
        trayFilterTeacher = e.target.value;
        renderUnpinnedTray();
      } else if (e.target.id === 'tt-tray-filter-class') {
        trayFilterClass = e.target.value;
        renderUnpinnedTray();
      }
    });

    // ── النقر على حصة غير مثبّتة (اختيار، ثم النقر على خانة فارغة مناسبة لوضعها) ──
    tray.addEventListener('click', (e) => {
      const chip = e.target.closest('.tray-chip');
      if (!chip) return;
      handleTrayPick(parseInt(chip.dataset.index, 10));
    });

    // ── سحب حصة غير مثبّتة من القائمة الجانبية إلى الجدول ──
    tray.addEventListener('dragstart', (e) => {
      const chip = e.target.closest('.tray-chip');
      if (!chip) { e.preventDefault(); return; }
      const payload = { source: 'tray', index: parseInt(chip.dataset.index, 10) };
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
      traySelection = payload.index;
      renderDetailedTable(); // لتلوين الخانات الصالحة فورًا أثناء السحب
    });

    tray.addEventListener('dragend', () => {
      traySelection = null;
      renderDetailedTable();
    });

    // ── إفلات خانة من الجدول فوق القائمة الجانبية = فكّ تثبيتها ──
    tray.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      tray.classList.add('drag-over');
    });
    tray.addEventListener('dragleave', () => tray.classList.remove('drag-over'));
    tray.addEventListener('drop', (e) => {
      e.preventDefault();
      tray.classList.remove('drag-over');
      let payload;
      try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (err) { return; }
      if (payload.source === 'grid') {
        editSelection = null;
        unpinCell({ day: payload.day, period: payload.period, classKey: payload.classKey });
      }
    });
  }
}

// معالجة اختيار خانة بالنقر: إن كانت هناك حصة غير مثبّتة مُختارة، تُعامل النقرة كمحاولة وضعها هنا؛
// وإلا فأول نقرة تُحدد الخانة، والنقرة الثانية تحاول التبديل معها
function handleCellPick(cellRef) {
  if (traySelection !== null) {
    const idx = traySelection;
    traySelection = null;
    attemptPlaceFromTray(idx, cellRef);
    return;
  }
  if (!editSelection) {
    editSelection = cellRef;
    renderTimetableOutput();
    return;
  }
  const same = editSelection.day === cellRef.day && editSelection.period === cellRef.period && editSelection.classKey === cellRef.classKey;
  if (same) {
    editSelection = null; // نقر على نفس الخانة المحددة يلغي التحديد
    renderTimetableOutput();
    return;
  }
  const from = editSelection;
  editSelection = null;
  attemptSwap(from, cellRef);
}

// معالجة اختيار حصة غير مثبّتة بالنقر عليها في القائمة الجانبية
function handleTrayPick(index) {
  if (traySelection === index) {
    traySelection = null; // نقر على نفس العنصر المحدد يلغي التحديد
    renderTimetableOutput();
    return;
  }
  editSelection = null; // إلغاء أي تحديد سابق لخانة في الجدول
  traySelection = index;
  renderTimetableOutput();
}

// يُرجع كل الخانات الفارغة الصالحة (ضمن نفس الشعبة، ودون أي تعارض) لوضع حصة غير مثبّتة معيّنة فيها
// enforceDayCap تُمرَّر صراحةً من كل نداء (لا قيمة افتراضية هنا عمدًا) — فهذه الدالة مشتركة فعليًا بين
// سياقين مختلفين: تلوين الخانات الصالحة أثناء تعديل يدوي مباشر بعد التوليد (raster المستخدم من التراي)،
// ومسار الإنقاذ التلقائي الذي يعمل مباشرة بعد التوليد نفسه (امتداد له، لا تعديل يدوي) — فكل مستدعٍ يُحدِّد
// أيهما هو بنفسه بدل الاعتماد على قيمة افتراضية قد لا تناسب أحد السياقين
function getEmptyValidCellsForItem(item, enforceDayCap) {
  const tt = state.timetable;
  if (!tt) return [];
  const result = [];
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const occupied = tt.schedule[day][p][item.classKey];
      if (occupied) continue;
      if (canPlaceAt(item, day, p, item.classKey, null, null, enforceDayCap).ok) {
        result.push({ day, period: p, classKey: item.classKey });
      }
    }
  });
  return result;
}

// محاولة إنقاذ أخيرة تلقائية بعد التوليد: لكل حصة ما تزال في "الحصص غير المثبّتة"، ابحث أولًا عن خانة فارغة
// صالحة مباشرة (بنفس فحص canPlaceAt المستخدم يدويًا في السحب والإفلات)، وإن لم توجد، حاول "الإزاحة المتسلسلة"
// (chain relocation): انقل حصة أخرى مشغولة في نفس الشعبة إلى مكان شاغر لها لتحرير مكان لهذه الحصة، وقد يتطلب
// ذلك إزاحة أخرى تِبَعًا (سلسلة)، حتى عمق محدود. هذا يشبه حل أحجية انزلاقية صغيرة محصورة داخل جدول شعبة واحدة:
// معلم الحصة العالقة قد يكون حرًا فعليًا في وقت ما، لكن ذلك الوقت "مشغول" بحصة أخرى — إن أمكن نقل تلك الحصة
// الأخرى إلى فراغ آخر مناسب لها (مباشرة أو عبر إزاحات أخرى)، يصبح المكان متاحًا للحصة العالقة أخيرًا.
//
// القيود الصارمة نفسها المطبَّقة في كل مكان آخر تبقى سارية بلا استثناء أثناء الإزاحة:
//   • لا تُحرَّك حصة مثبّتة يدويًا (تُستبعد تمامًا من كونها هدفًا للإزاحة).
//   • كل نقل يُفحَص بنفس canPlaceAt (لا تعارض معلم، ولا خرق لسقف يومي، ولا وقت ممنوع).
//   • الإزاحة داخل نفس الشعبة فقط (لا تُنقَل أي حصة إلى شعبة أخرى) — كل خطوة تستبدل مكانًا بمكان بلا تغيير
//     في إجمالي حصص أي يوم، فلا حاجة لإعادة فحص التوازن أو السعة الأسبوعية بعدها.
//   • خانة استُخدمت مرة في محاولة سلسلة معيّنة لا تُستخدم مجددًا في نفس المحاولة، لضمان توقف البحث حتمًا.
function attemptChainRelocation(item, depth, maxDepth, visited, deadline) {
  const tt = state.timetable;
  const ck = item.classKey;

  // ١. جرّب أولًا خانة فارغة صالحة مباشرة (هذا يغطي أيضًا الحالة البسيطة بلا أي إزاحة، عند أول استدعاء)
  // enforceDayCap=true هنا عمدًا: هذا امتداد مباشر للتوليد نفسه (يعمل تلقائيًا فور انتهائه، لا نتيجة نقرة
  // مستخدم واعية)، فيجب أن يلتزم بنفس قواعد التوليد تمامًا بما فيها الحد الأقصى اليومي
  const emptyCells = getEmptyValidCellsForItem(item, true).filter(c => !visited.has(`${c.day}|${c.period}`));
  if (emptyCells.length > 0) {
    emptyCells.sort((a, b) => tt.days.indexOf(a.day) - tt.days.indexOf(b.day) || a.period - b.period);
    const cell = emptyCells[0];
    tt.schedule[cell.day][cell.period][ck] = { teacher: item.teacher, subject: item.subject, teacherId: item.teacherId };
    return { day: cell.day, period: cell.period };
  }

  if (depth >= maxDepth || Date.now() > deadline) return null;

  // ٢. لا خانة فارغة — ابحث عن خانة مشغولة يكون فيها معلم "item" حرًا فعليًا لو أُفرغت (أي شاغلها هو العائق
  // الوحيد)، وحاول إيجاد مكان آخر لشاغلها الحالي (مباشرة أو بإزاحة أخرى) لتحرير هذه الخانة فعليًا
  const candidates = [];
  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      const key = `${day}|${p}`;
      if (visited.has(key)) continue;
      if (isFixedSlotGlobal(ck, day, p)) continue;
      const occupant = tt.schedule[day][p][ck];
      if (!occupant) continue; // الفراغات جُرِّبت أعلاه
      // enforceDayCap=true هنا أيضًا لنفس سبب الخانات الفارغة أعلاه — امتداد للتوليد التلقائي نفسه
      if (!canPlaceAt(item, day, p, ck, null, null, true).ok) continue;
      candidates.push({ day, p, occupant });
    }
  });

  for (const cand of candidates) {
    if (Date.now() > deadline) return null;
    const { day, p, occupant } = cand;
    const key = `${day}|${p}`;
    visited.add(key);

    tt.schedule[day][p][ck] = { teacher: item.teacher, subject: item.subject, teacherId: item.teacherId };

    const occupantAsItem = { classKey: ck, teacher: occupant.teacher, subject: occupant.subject, teacherId: occupant.teacherId };
    const placed = attemptChainRelocation(occupantAsItem, depth + 1, maxDepth, visited, deadline);

    if (placed) return { day, p };

    // تعذّر إيجاد مكان لشاغل هذه الخانة (لا مباشرة ولا عبر سلسلة أعمق) — تراجع وجرّب الخانة التالية
    tt.schedule[day][p][ck] = occupant;
    visited.delete(key);
  }

  return null;
}

async function rescueUnplacedItems(maxChainDepth) {
  const tt = state.timetable;
  if (!tt || !tt.unpinned || tt.unpinned.length === 0) return 0;
  const deadline = Date.now() + 2000; // ميزانية زمنية مشتركة لكل محاولات الإنقاذ (البسيطة والمتسلسلة معًا) في هذه الجولة
  let rescued = 0;
  const yielder = createYielder();
  for (let i = tt.unpinned.length - 1; i >= 0; i--) {
    if (Date.now() > deadline) break;
    await yielder(); // نقطة تنفّس دورية بين محاولة إنقاذ حصة عالقة وأخرى — راجع createYielder لشرح السبب
    const item = tt.unpinned[i];
    const placedAt = attemptChainRelocation(item, 0, maxChainDepth || 0, new Set(), deadline);
    if (placedAt) {
      tt.unpinned.splice(i, 1);
      rescued++;
    }
  }
  if (rescued > 0) markDirty();
  return rescued;
}

// يفكّ تثبيت حصة من الجدول ويرسلها إلى القائمة الجانبية (الحصص غير المثبّتة)
function unpinCell(cellRef) {
  const tt = state.timetable;
  if (!tt) return;
  const entry = tt.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (!entry) return;

  pushUndoSnapshot();
  delete tt.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (!tt.unpinned) tt.unpinned = [];
  tt.unpinned.push({ classKey: cellRef.classKey, teacher: entry.teacher, subject: entry.subject, teacherId: entry.teacherId });

  editSelection = null;
  traySelection = null;
  markDirty();
  renderTimetableOutput();
  toast('تم فكّ تثبيت الحصة، ويمكنك الآن سحبها أو النقر عليها لوضعها في خانة أخرى.', 'info');
}

// يحاول وضع حصة غير مثبّتة (بفهرسها في tt.unpinned) في خانة معيّنة من الجدول
function attemptPlaceFromTray(index, cellRef) {
  const tt = state.timetable;
  if (!tt || !tt.unpinned || !tt.unpinned[index]) { renderTimetableOutput(); return; }
  const item = tt.unpinned[index];

  if (item.classKey !== cellRef.classKey) {
    toast('هذه الحصة تعود لشعبة مختلفة. اختر خانة ضمن نفس الشعبة الموضحة على بطاقتها.', 'error');
    renderTimetableOutput();
    return;
  }

  const existing = tt.schedule[cellRef.day][cellRef.period][cellRef.classKey];
  if (existing) {
    toast('هذه الخانة مشغولة بالفعل. اختر خانة فارغة، أو بدّل الخانات المشغولة مباشرة بالنقر أو السحب.', 'error');
    renderTimetableOutput();
    return;
  }

  const check = canPlaceAt(item, cellRef.day, cellRef.period, cellRef.classKey, null, null, false);
  if (!check.ok) {
    toast(check.reason, 'error');
    renderTimetableOutput();
    return;
  }

  pushUndoSnapshot();
  tt.schedule[cellRef.day][cellRef.period][cellRef.classKey] = { teacher: item.teacher, subject: item.subject, teacherId: item.teacherId };
  tt.unpinned.splice(index, 1);

  markDirty();
  renderTimetableOutput();
  toast('تم تثبيت الحصة في الخانة الجديدة بنجاح.', 'success');
}

// يحاول العثور على مُعرّف المعلم اعتمادًا على البيانات المخزَّنة في الخانة، وإن لم يوجد يبحث بالاسم كحل احتياطي
// (للجداول التي تم توليدها قبل إضافة حقل teacherId)
function resolveTeacherId(entry) {
  if (entry.teacherId) return entry.teacherId;
  const found = state.teachers.find(t => t.name === entry.teacher);
  return found ? found.id : null;
}

// يتحقق من إمكانية وضع حصة (entry) في خانة (day, period) ضمن نفس الشعبة، ويُرجع سبب الرفض إن وُجد تعارض.
// ctx اختياري: كائن بنفس شكل state.timetable ({days, maxPeriods, activeClasses, schedule}) — يُستخدَم
// state.timetable افتراضيًا (كل الاستخدامات القائمة على الجدول المولَّد فعليًا)، لكن يمكن تمرير سياق آخر —
// كسياق تخيّلي مبنيّ فقط من الحصص المثبّتة يدويًا قبل أي توليد إطلاقًا (راجع buildFixedPlacementsContext) —
// فتُطبَّق نفس قواعد التعارض (المعلم ممنوع/مشغول بشعبة أخرى/تجاوز الحد اليومي) بمعزل تام عن وجود جدول مولَّد
// enforceDayCap (افتراضيًا true، يطابق كل سلوك سابق بلا أي تغيير): الحد الأقصى اليومي أداة توجيه لخوارزمية
// التوليد نفسها ولمرحلة إعداد الحصص المثبّتة قبله — بعد التوليد، حين يُعدِّل المستخدم الجدول يدويًا وينظر
// مباشرة إلى النتيجة أمامه، يُصبح قرارًا واعيًا لا حاجة لتقييده به. لذلك يبقى enforceDayCap مفعَّلًا افتراضيًا
// في كل مكان (التوليد نفسه، ومرحلة تثبيت الحصص المسبق، ومسار الإنقاذ التلقائي مباشرة بعد التوليد — فهذا
// الأخير امتداد للتوليد نفسه، لا تعديل يدوي متعمَّد)، ويُعطَّل تحديدًا فقط من نقاط التعديل اليدوي المباشرة على
// "الجدول التفصيلي" بعد التوليد (تبديل/نقل حصة، تغيير معلم مادة، وحساب الخانات الصالحة المعروضة لكل منهما).
// القيدان الآخران (معلم ممنوع/معلم مشغول بشعبة أخرى) لا علاقة لهما بهذه الراية إطلاقًا — يبقيان صارمين دومًا
// بصرف النظر عن السياق، لأنهما استحالة فعلية (لا يمكن لمعلم واحد التواجد في مكانين معًا) لا مجرد تفضيل توزيع.
function canPlaceAt(entry, day, period, classKey, excludeSlot, ctx, enforceDayCap = true) {
  const tt = ctx || state.timetable;
  const teacherId = resolveTeacherId(entry);

  // 1. القيد الصارم: وقت ممنوع على هذا المعلم (مُعرَّف في الخطوة الرابعة)
  if (teacherId && state.constraints && state.constraints.teacherBlocks) {
    const blocked = state.constraints.teacherBlocks.some(b => b.teacherId === teacherId && b.day === day && b.period === period);
    if (blocked) {
      return { ok: false, reason: `تعذّر التبديل: المعلم "${entry.teacher}" ممنوع من التدريس في ${day} - الحصة ${period} (حسب قيد محدد في الخطوة الرابعة).` };
    }
  }

  // 2. هل المعلم مشغول بالفعل في هذا الوقت تحديدًا مع شعبة أخرى؟
  // نتجاهل الشعبة المستهدفة (classKey) نفسها هنا دومًا، لا فقط خانة المصدر — فأي تعارض "داخل" نفس الشعبة
  // في نفس الوقت غير ممكن أصلًا بحكم بنية البيانات (خانة واحدة فقط لكل شعبة/يوم/حصة)، والمقارنة معها هنا
  // كانت تُنتج تعارضًا وهميًا في حالة تحديدًا: معلم يُدرِّس أكثر من مادة لنفس الشعبة ويحاول تبديل حصتين له
  // هو (كتبديل مكان "رياضيات" و"علوم" لنفس المعلم لنفس الشعبة) — كان الفحص يرى شاغل الخانة الهدف (وهو نفسه
  // الطرف الآخر من عملية التبديل ذاتها) ويعتبره "حصة أخرى" متعارضة، رغم أنه تحديدًا ما يجري تبديل مكانه.
  // التعارض الحقيقي الوحيد الذي يعنينا هنا هو مع شعبة مختلفة تمامًا.
  for (const c of tt.activeClasses) {
    if (c.key === classKey) continue;
    const other = tt.schedule[day] && tt.schedule[day][period] && tt.schedule[day][period][c.key];
    if (!other) continue;
    const otherTeacherId = resolveTeacherId(other);
    const sameTeacher = (teacherId && otherTeacherId) ? (teacherId === otherTeacherId) : (other.teacher === entry.teacher);
    if (sameTeacher) {
      return { ok: false, reason: `تعذّر التبديل: المعلم "${entry.teacher}" لديه حصة أخرى (${other.subject} — ${c.grade} ${c.section}) في نفس الوقت (${day} - الحصة ${period}).` };
    }
  }

  // 3. القيد الاختياري: الحد الأقصى اليومي لحصص هذا الصف في هذا اليوم تحديدًا (من إعدادات الخطوة الثانية).
  // يُفحَص فقط عندما تنتقل الحصة إلى يوم مختلف عن يومها الحالي (أو حصة جديدة من القائمة الجانبية)، لأن
  // تبديل حصتين ضمن نفس اليوم لا يغيّر إجمالي عدد حصص ذلك اليوم أصلًا. الخانة الهدف نفسها (إن كانت مشغولة
  // بحصة أخرى ستُستبدَل) لا تُحتسب ضمن العدّ الحالي، تفاديًا لاحتسابها مرتين. يُتخطّى بالكامل إن كان
  // enforceDayCap=false (تعديل يدوي متعمَّد بعد التوليد — راجع الشرح أعلى الدالة).
  if (enforceDayCap) {
    const originDay = (excludeSlot && excludeSlot.classKey === classKey) ? excludeSlot.day : null;
    if (originDay !== day) {
      const grade = classKey.split('___')[0];
      const cap = getGradeDayCap(grade, day);
      let dayTotal = 0;
      for (let p = 1; p <= tt.maxPeriods; p++) {
        if (p === period) continue;
        if (tt.schedule[day][p] && tt.schedule[day][p][classKey]) dayTotal++;
      }
      if (dayTotal + 1 > cap) {
        return { ok: false, reason: `تعذّر: الصف "${grade}" بلغ حدّه الأقصى اليومي (${cap} حصة) يوم ${day} (حسب جدول "الحد الأقصى اليومي للحصص لكل صف" في الخطوة الثانية).` };
      }
    }
  }

  return { ok: true };
}

// ينفّذ عملية التبديل أو النقل بين خانتين بعد التحقق من عدم وجود تعارض، ويحفظ النتيجة
// يُرجع مجموعة كل الخانات (بصيغة "يوم|حصة|classKey") التي يصحّ تبديل الخانة المُحدَّدة (from) معها فعليًا —
// بنفس فحص canPlaceAt الذي يستخدمه attemptSwap بالضبط، فلا يمكن أبدًا أن تُلوَّن خانة كصالحة هنا ثم يرفضها
// attemptSwap عند النقر عليها فعلًا. مقصورة على نفس الشعبة (from.classKey) فقط، لأن التبديل بين شعبتين
// مختلفتين غير مسموح أصلًا. تتعامل مع الحالتين: الخانة المحدَّدة فيها حصة (تبديل حقيقي أو نقل لخانة فارغة)،
// أو الخانة المحدَّدة فارغة (عندها الهدف الصالح هو أي خانة يمكن نقل شاغلها إلى هذا الفراغ تحديدًا)
function computeValidSwapTargets(from) {
  const tt = state.timetable;
  const result = new Set();
  if (!tt) return result;

  const ck = from.classKey;
  const entryFrom = tt.schedule[from.day][from.period][ck] || null;

  tt.days.forEach(day => {
    for (let p = 1; p <= tt.maxPeriods; p++) {
      if (day === from.day && p === from.period) continue;
      const entryTo = tt.schedule[day][p][ck] || null;
      if (!entryFrom && !entryTo) continue; // كلتا الخانتين فارغتان — لا فائدة من "تبديل" لا شيء مع لا شيء

      let ok = true;
      if (entryFrom) ok = ok && canPlaceAt(entryFrom, day, p, ck, from, null, false).ok;
      if (ok && entryTo) ok = ok && canPlaceAt(entryTo, from.day, from.period, ck, { day, period: p, classKey: ck }, null, false).ok;

      if (ok) result.add(`${day}|${p}|${ck}`);
    }
  });

  return result;
}

function attemptSwap(from, to) {
  const tt = state.timetable;
  if (!tt) return;

  if (from.day === to.day && from.period === to.period && from.classKey === to.classKey) {
    renderTimetableOutput();
    return;
  }

  if (from.classKey !== to.classKey) {
    toast('لا يمكن تبديل الحصص بين شعبتين مختلفتين. الرجاء اختيار خانتين من نفس الشعبة.', 'error');
    renderTimetableOutput();
    return;
  }

  const ck = from.classKey;
  const entryFrom = tt.schedule[from.day][from.period][ck] || null;
  const entryTo = tt.schedule[to.day][to.period][ck] || null;

  if (!entryFrom && !entryTo) {
    toast('الخانتان فارغتان، لا يوجد ما يمكن تبديله أو نقله.', 'error');
    renderTimetableOutput();
    return;
  }

  if (entryFrom) {
    const check = canPlaceAt(entryFrom, to.day, to.period, ck, from, null, false);
    if (!check.ok) { toast(check.reason, 'error'); renderTimetableOutput(); return; }
  }
  if (entryTo) {
    const check = canPlaceAt(entryTo, from.day, from.period, ck, to, null, false);
    if (!check.ok) { toast(check.reason, 'error'); renderTimetableOutput(); return; }
  }

  pushUndoSnapshot();
  if (entryFrom) tt.schedule[to.day][to.period][ck] = entryFrom; else delete tt.schedule[to.day][to.period][ck];
  if (entryTo) tt.schedule[from.day][from.period][ck] = entryTo; else delete tt.schedule[from.day][from.period][ck];

  markDirty();
  renderTimetableOutput();
  toast(entryFrom && entryTo ? 'تم تبديل الحصتين بنجاح.' : 'تم نقل الحصة إلى الخانة الجديدة بنجاح.', 'success');
}

// ═══════════════════════════════════════════════════════════════
// شاشة قائمة المشاريع — واجهة البداية: عرض/إنشاء/فتح/إعادة تسمية/حذف/تصدير المشاريع
// ═══════════════════════════════════════════════════════════════

function showWizardView() {
  document.getElementById('wizard-shell').style.display = '';
  document.getElementById('project-list-view').style.display = 'none';
}

// يفحص أولًا عن تغييرات غير محفوظة على الملف المفتوح حاليًا (إن وُجد) — إن اختار المستخدم الإلغاء، لا يحدث
// شيء إطلاقًا (يبقى الملف الحالي مفتوحًا كما هو). كل نقاط الدخول للتنقّل بين الملفات تمرّ عبر هذه الدالة أو
// openProject/openProjectViaDialog/createNewProject أدناه (لا عبر مسار آخر مباشر)، فهذا الفحص يحدث تلقائيًا
// بصرف النظر عن أي زر استدعاه فعليًا
async function showProjectListView() {
  const proceed = await promptUnsavedChanges();
  if (!proceed) return;
  document.getElementById('wizard-shell').style.display = 'none';
  document.getElementById('project-list-view').style.display = '';
  currentProjectPath = null;
  renderProjectList();
  refreshFileExistenceCache(); // غير مُنتظَرة عمدًا (fire-and-forget) — تُعيد الرسم بنفسها بعد اكتمالها
}

function formatProjectDate(iso) {
  try {
    return new Date(iso).toLocaleString('ar', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso || ''; }
}

// يُصنِّف تاريخًا إلى إحدى خمس فئات نسبية (بترتيب عرض ثابت، لا أبجدي) — نفس الفكرة العامة المستخدَمة في
// قوائم "المستندات الأخيرة" في Word/Excel، لكن بنافذة متدرجة من "الآن" (فرق أيام تقويمية بسيط) بدل حدود
// أسبوع تقويمي فعلية (الأحد–السبت مثلًا)، تفاديًا لأي التباس حول أي يوم يُعتبَر "بداية الأسبوع" ثقافيًا
const DATE_BUCKET_ORDER = ['اليوم', 'أمس', 'هذا الأسبوع', 'الأسبوع الماضي', 'أقدم'];
function getRelativeDateBucket(iso) {
  const now = new Date();
  const then = new Date(iso);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysAgo = Math.round((startOfDay(now) - startOfDay(then)) / 86400000);
  if (daysAgo <= 0) return 'اليوم'; // يشمل أيضًا أي طابع زمني بالمستقبل (انحراف ساعة الجهاز مثلًا) كحالة احتياطية آمنة
  if (daysAgo === 1) return 'أمس';
  if (daysAgo <= 6) return 'هذا الأسبوع';
  if (daysAgo <= 13) return 'الأسبوع الماضي';
  return 'أقدم';
}

// نص البحث الحالي في قائمة "الملفات الحديثة" — بحث سلبي بحت (تصفية فورية للقائمة، لا شيء يُرسَل لأي جسر)
let recentsSearchQuery = '';

// نتيجة آخر فحص وجود لكل مسار: undefined = لم يُفحَص بعد (نتفاءل ونعرضه بشكل طبيعي ريثما يكتمل الفحص)،
// true = موجود فعليًا، false = غير موجود (نُقل أو حُذف من خارج التطبيق). يُملَأ عبر refreshFileExistenceCache
// دفعة واحدة عند دخول الشاشة، لا عند كل رسم — حتى تبقى الكتابة في مربّع البحث فورية بلا أي طلب جسر جديد
// لكل ضغطة زر (راجع النقاش: فصل فحص الوجود عن الرسم نفسه تحديدًا لهذا السبب)
let __fileExistenceCache = {};

async function refreshFileExistenceCache() {
  const recents = loadRecentFiles();
  if (recents.length === 0) return;
  try {
    const result = await callCheckFilesExistBridge({ paths: recents.map(r => r.path) }, 15000);
    if (result.isSuccess) {
      result.results.forEach(r => { __fileExistenceCache[r.path] = r.exists; });
    }
  } catch (e) {
    // فشل الفحص بالكامل (مثلًا عمل التطبيق خارج غلاف WebView2 وقت التطوير) لا يمنع عرض القائمة إطلاقًا —
    // تبقى حالة كل ملف "غير معروفة بعد" فتُعرَض بشكل طبيعي متفائل، بلا زر "فتح" مُعطَّل بلا داعٍ
  }
  renderProjectList(); // إعادة رسم بعد اكتمال الفحص لتحديث الألوان/الأزرار حسب النتيجة الفعلية
}

// نفس ترتيب الفرز المستخدَم دومًا (الأحدث أولًا)، لكن مقسَّمًا الآن إلى أقسام بعنوان فرعي لكل فئة زمنية
// نسبية — تُعرَض كل فئة غير فارغة فقط، بنفس ترتيب DATE_BUCKET_ORDER الثابت، بصرف النظر عن عدد الملفات
// الكلي (حتى مع ملفين أو ثلاثة فقط) — مطابقةً مباشرة لسلوك Word/Excel نفسه، لا تبسيطًا مشروطًا بالعدد
function renderProjectList() {
  const container = document.getElementById('project-list');
  const empty = document.getElementById('project-list-empty');
  const searchActive = recentsSearchQuery.trim().length > 0;

  let recents = loadRecentFiles().slice().sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  if (searchActive) {
    const q = recentsSearchQuery.trim().toLowerCase();
    recents = recents.filter(r => pathBasename(r.path).toLowerCase().includes(q));
  }

  if (recents.length === 0) {
    container.innerHTML = '';
    empty.querySelector('p').textContent = searchActive
      ? 'لا توجد ملفات مطابقة لبحثك.'
      : 'لا توجد ملفات حديثة بعد — أنشئ أول مشروع لتبدأ، أو افتح ملفًا محفوظًا سابقًا.';
    empty.classList.add('show');
    return;
  }
  empty.classList.remove('show');

  const grouped = new Map(); // bucketName -> [recent entries] — يحافظ الترتيب داخل كل فئة على ترتيب الفرز الأصلي (الأحدث أولًا)
  recents.forEach(r => {
    const bucket = getRelativeDateBucket(r.lastModified);
    if (!grouped.has(bucket)) grouped.set(bucket, []);
    grouped.get(bucket).push(r);
  });

  function renderRow(r) {
    const exists = __fileExistenceCache[r.path]; // undefined = غير معروف بعد، يُعامَل كموجود مؤقتًا
    const missing = exists === false;
    const metaText = missing ? 'تعذّر العثور على الملف — نُقل أو حُذف' : `آخر حفظ: ${formatProjectDate(r.lastModified)}`;
    return `
    <div class="project-row${missing ? ' project-row-missing' : ''}" data-path="${encodeURIComponent(r.path)}">
      <div class="project-row-name">${pathBasename(r.path)}</div>
      <div class="project-row-meta" title="${r.path}">${metaText}</div>
      <div class="project-row-actions">
        ${missing ? '' : '<button class="btn-primary" data-action="open">فتح</button>'}
        ${missing ? '' : '<button class="btn-secondary" data-action="reveal" title="فتح مجلد الملف في مستكشف الملفات">فتح المجلد</button>'}
        <button class="btn-secondary" data-action="remove">إزالة من القائمة</button>
      </div>
    </div>`;
  }

  container.innerHTML = DATE_BUCKET_ORDER
    .filter(bucket => grouped.has(bucket))
    .map(bucket => `
      <div class="project-list-section">
        <div class="project-list-section-header">${bucket}</div>
        ${grouped.get(bucket).map(renderRow).join('')}
      </div>
    `).join('');

  container.querySelectorAll('.project-row').forEach(row => {
    const path = decodeURIComponent(row.dataset.path);
    const openBtn = row.querySelector('[data-action="open"]');
    if (openBtn) openBtn.addEventListener('click', () => openProject(path));
    const revealBtn = row.querySelector('[data-action="reveal"]');
    if (revealBtn) revealBtn.addEventListener('click', () => revealFileInFolder(path));
    row.querySelector('[data-action="remove"]').addEventListener('click', () => removeRecentEntry(path));
  });
}

document.getElementById('project-search-input').addEventListener('input', (e) => {
  recentsSearchQuery = e.target.value;
  renderProjectList(); // تصفية فورية بلا أي طلب جسر — تعتمد على __fileExistenceCache المملوءة مسبقًا فقط
});

// يفتح مستكشف الملفات على مجلد الملف مع تحديد الملف نفسه فيه — غائب من القالب أصلًا لأي ملف "مفقود"، بنفس
// منطق زر "فتح" تمامًا (لا معنى لفتح مجلد ملف لا يمكن العثور عليه أصلًا)
async function revealFileInFolder(path) {
  let result;
  try {
    result = await callRevealFileInFolderBridge({ path }, 15000);
  } catch (err) {
    toast(`تعذّر الاتصال بمحرّك الفتح: ${err.message || err}`, 'error');
    return;
  }
  if (!result.isSuccess) {
    toast(`تعذّر فتح مجلد الملف: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
  }
}

// يفتح ملفًا بمسار معروف مسبقًا (من قائمة الملفات الحديثة) — بلا أي نافذة حوار، قراءة مباشرة فقط. يفحص
// التغييرات غير المحفوظة على الملف الحالي أولًا (راجع الشرح أعلى showProjectListView؛ نفس المبدأ هنا تمامًا)
async function openProject(path) {
  const proceed = await promptUnsavedChanges();
  if (!proceed) return;

  let result;
  try {
    result = await callReadProjectFileByPathBridge({ path }, 15000);
  } catch (err) {
    toast(`تعذّر الاتصال بمحرّك القراءة: ${err.message || err}`, 'error');
    return;
  }

  if (result.notFound) {
    // "الملف غير موجود" حالة متوقَّعة تمامًا (نُقل أو حُذف من خارج التطبيق) — لا نُسقِطه من القائمة صامتًا،
    // فقط نُخبر المستخدم بوضوح ونترك له قرار إزالته يدويًا إن أراد (راجع removeRecentEntry)
    toast('تعذّر العثور على هذا الملف — يبدو أنه نُقل أو حُذف من خارج التطبيق.', 'error');
    return;
  }
  if (!result.isSuccess) {
    toast(`تعذّر فتح الملف: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    return;
  }

  if (!applyOpenedFileContent(result.content, path)) return;
  currentFileHandle = null; // احتياطي بحت — هذا المسار لا يُستدعى إلا حين يتوفّر الجسر أصلًا، حيث currentFileHandle لا يُضبَط أبدًا بأي حال
  showWizardView();
  renderAll();
  goToStep(1);
}

// يعرض نافذة "فتح ملف" حقيقية (أي مسار على القرص، لا قائمة الملفات الحديثة تحديدًا) — يُستخدَم من زر "فتح..."
// في كل من شاشة الملفات الحديثة وداخل المعالِج نفسه (فتح ملف آخر أثناء العمل على ملف حالي)
async function openProjectViaDialog() {
  const proceed = await promptUnsavedChanges();
  if (!proceed) return;

  if (!isBridgeAvailable()) { await openProjectViaBrowser(); return; }

  let result;
  try {
    result = await callOpenProjectFileBridge({}, 60000);
  } catch (err) {
    toast(`تعذّر الاتصال بمحرّك الفتح: ${err.message || err}`, 'error');
    return;
  }

  if (result.cancelled) return;
  if (!result.isSuccess) {
    toast(`تعذّر فتح الملف: ${result.errorMessage || 'خطأ غير معروف'}`, 'error');
    return;
  }

  if (!applyOpenedFileContent(result.content, result.filePath)) return;
  showWizardView();
  renderAll();
  goToStep(1);
}

// نظير الدالة أعلاه في المتصفح (نسخة الموقع الساكن): فحص "تغييرات غير محفوظة" يحدث في openProjectViaDialog
// نفسها قبل الوصول هنا، فلا حاجة لتكراره. المسار الاحتياطي (بلا File System Access API) ينقر حقل الرفع
// المخفي فقط هنا — المعالجة الفعلية لاختيار الملف تصل لاحقًا عبر حدث change منفصل (راجع مستمع web-file-input
// أسفل الملف)، لا كنتيجة مباشرة لهذا الاستدعاء، لأن حقل <input type=file> لا يُعيد وعدًا يمكن انتظاره
async function openProjectViaBrowser() {
  if (supportsFileSystemAccess()) {
    let handle;
    try {
      [handle] = await window.showOpenFilePicker({
        types: [{ description: 'ملفات جدولك', accept: { 'application/json': ['.jdwl', '.json'] } }],
      });
    } catch (err) {
      if (err.name === 'AbortError') return; // المستخدم أغلق نافذة الاختيار بلا تحديد ملف
      toast(`تعذّر فتح الملف: ${err.message || err}`, 'error');
      return;
    }
    const file = await handle.getFile();
    const content = await file.text();
    if (!applyOpenedFileContent(content, file.name)) return;
    currentFileHandle = handle;
    showWizardView();
    renderAll();
    goToStep(1);
  } else {
    document.getElementById('web-file-input')?.click();
  }
}

// يشترك فيها openProject وopenProjectViaDialog معًا: يفكّ ترميز محتوى الملف، يُطبِّعه، ويُطبِّقه كحالة حالية.
// يُرجع true عند النجاح، false عند فشل التحليل (رسالة الخطأ تُعرَض من هنا مباشرة، لا حاجة لتكرارها في المستدعي)
function applyOpenedFileContent(content, path) {
  let normalized;
  try {
    const parsed = JSON.parse(content);
    const raw = parsed && parsed.state ? parsed.state : parsed; // يقبل ملف مُصدَّر من التطبيق (بالغلاف)، أو ملف state خام مباشرة
    if (!raw || typeof raw !== 'object' || !raw.school || !Array.isArray(raw.teachers)) {
      toast('تعذّر فتح الملف: الصيغة غير صحيحة أو غير متوافقة مع هذا التطبيق.', 'error');
      return false;
    }
    normalized = normalizeState(raw);
  } catch (err) {
    toast('الملف تالف أو ليس بصيغة JSON صالحة.', 'error');
    return false;
  }
  state = normalized;
  currentProjectPath = path;
  isDirty = false;
  updateDirtyIndicator();
  // على نسخة الموقع الساكن (لا جسر)، "الملفات الحديثة" لا يمكنها العمل أصلًا — لا مقبض ملف نملك آلية حفظه
  // بين جلسات المتصفح بعد — فتسجيل إدخال هناك سينتج "ملفًا حديثًا" لا يمكن إعادة فتحه أبدًا لاحقًا؛ التسجيل
  // يبقى حصرًا لتطبيق سطح المكتب حيث تعمل هذه القائمة فعليًا بمساراتٍ حقيقية على القرص
  if (isBridgeAvailable()) addOrUpdateRecent(path);
  return true;
}

// حقل رفع احتياطي شامل (كل المتصفحات) — يُنقَر برمجيًا من openProjectViaBrowser فقط عند غياب File System
// Access API. لا فحص "تغييرات غير محفوظة" هنا مجددًا: openProjectViaDialog تكفّلت به قبل الوصول لهذه النقطة
document.getElementById('web-file-input')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = ''; // للسماح باختيار نفس الملف مرة أخرى لاحقًا إن لزم
  if (!file) return;
  const content = await file.text();
  currentFileHandle = null; // لا مقبض حقيقي في هذا المسار الاحتياطي إطلاقًا — أي حفظ لاحق سيُنزِّل ملفًا جديدًا حتمًا
  if (!applyOpenedFileContent(content, file.name)) return;
  showWizardView();
  renderAll();
  goToStep(1);
});

// مشروع جديد فارغ كليًا، بلا مسار حتى أول حفظ صريح (تمامًا كملف Word/Excel جديد) — لا يظهر في قائمة الملفات
// الحديثة إطلاقًا حتى تلك اللحظة، إذ لا مسار حقيقي له بعد ليُضاف
async function createNewProject() {
  const proceed = await promptUnsavedChanges();
  if (!proceed) return;
  state = createDefaultState();
  currentProjectPath = null;
  currentFileHandle = null; // مهم: بلا هذا، لو كان مشروع سابق مفتوحًا عبر File System Access API، سيبقى
  // مقبض ذلك الملف "عالقًا" هنا، وأي حفظ لاحق لهذا المشروع الجديد قد يكتب فوق الملف القديم خطأً بدل تنزيل/حفظ ملف جديد فعليًا
  isDirty = false;
  updateDirtyIndicator();
  showWizardView();
  renderAll();
  goToStep(1);
}

// يُزيل ملفًا من قائمة "الملفات الحديثة" فقط — لا يمسّ الملف الفعلي على القرص إطلاقًا (تمامًا كسلوك قوائم
// "الملفات الأخيرة" في Word/Excel: إزالة من القائمة، لا حذف حقيقي؛ التطبيق لا يحذف ملفات المستخدم مطلقًا)
function removeRecentEntry(path) {
  if (!confirm('إزالة هذا الملف من القائمة؟ لن يُحذَف الملف الفعلي من القرص، فقط من هذه القائمة.')) return;
  removeRecent(path);
  renderProjectList();
  toast('تمت إزالته من القائمة.', 'success');
}

document.getElementById('btn-create-project').addEventListener('click', createNewProject);
document.getElementById('btn-import-project').addEventListener('click', openProjectViaDialog);

// ═══════════════════════════════════════════════════════════════
// التهيئة الأولية
// ═══════════════════════════════════════════════════════════════
function renderAll() {
  renderStep1();
  renderGradesMatrix();
  renderSubjectsMatrix();
  renderGradeDayCapsMatrix();
  renderTeacherList();
  renderTimetableOutput(); // يعرض الجدول المحفوظ سابقًا (إن وجد) حتى بعد تحديث الصفحة، أو يُخفي البطاقة إن لم يوجد
  setStatus('', 'success');
}

initTimetableEditing();

// window.__launchFilePath يُحقَن من MainForm.cs (راجع EnsureWebViewReadyAsync) قبل تحميل هذا الملف بأي حال —
// موجود ويحمل مسارًا حقيقيًا فقط إن شُغِّل التطبيق عبر نقر مزدوج على ملف .jdwl/.json من مستكشف الملفات؛
// null في كل تشغيل عادي آخر (بما فيها التطوير خارج WebView2 حيث لا يُحقَن إطلاقًا). عند وجوده، نفتح ذلك
// الملف مباشرة عبر openProject نفسها المستخدَمة في كل مكان آخر (بلا مسار خاص منفصل) — تتحقق هي بنفسها من
// عدم وجود تغييرات غير محفوظة أولًا (لا شيء عادةً عند بدء التشغيل)، وتُضيف الملف لقائمة "الملفات الحديثة"
// تلقائيًا كأي فتح آخر، فيظهر فيها من هذه اللحظة فصاعدًا
if (typeof window.__launchFilePath === 'string' && window.__launchFilePath) {
  openProject(window.__launchFilePath);
} else {
  showProjectListView(); // الشاشة الافتتاحية دومًا — راجع النقاش: لا تخطّي تلقائي حتى مع ملف واحد فقط في القائمة
}