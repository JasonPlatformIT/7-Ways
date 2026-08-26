/**
 * Translations for 7 Ways website
 * Languages: English (en), Japanese (ja), Chinese Simplified (zh), Korean (ko)
 */

const TRANSLATIONS = {
  en: {
    // Nav
    nav_home: "Home",
    nav_roster: "Roster",
    nav_pricing: "Pricing",
    nav_employment: "Employment",
    nav_contact: "Contact Us",

    // Home
    home_title: "Welcome",
    home_subtitle: "Select a day to view currently available options.",
    btn_today: "Today",
    btn_tomorrow: "Tomorrow",
    section_pricing: "Pricing",
    section_contact: "Contact Us",
    manage_pricing: "Manage Pricing →",
    manage_contact: "Manage Contact →",

    // Roster
    roster_title: "Roster",
    roster_subtitle: "Full roster managed via CMS. Filter by availability.",
    btn_all: "All",
    admin_note_roster: "To update the roster: edit js/data.js and add/remove people. Each person can be marked available for \"today\", \"tomorrow\", or both.",

    // Pricing
    pricing_title: "Pricing",
    current_pricing: "Current Pricing",
    edit_pricing: "Edit Pricing Text",
    pricing_note: "Changes are saved in your browser (localStorage). They will appear on the Home page and here.",
    save_pricing: "Save Pricing",

    // Employment
    employment_title: "Employment Application",
    employment_intro: "Please fill in all fields below. All information is treated confidentially.",
    label_name: "Full Name",
    label_nationality: "Nationality",
    label_age: "Age",
    label_contact: "Contact Number",
    placeholder_name: "Enter your full name",
    placeholder_nationality: "e.g. Australian, French, etc.",
    placeholder_age: "Your age",
    placeholder_contact: "e.g. 04XX XXX XXX",
    submit_application: "Submit Application",
    form_success: "Application received!\n\nThank you. We will be in touch soon.",

    // Contact
    contact_title: "Contact Us",
    get_in_touch: "Get In Touch",
    edit_contact: "Edit Contact Information",
    contact_note: "Changes are saved in your browser (localStorage). They will appear on the Home page and here.",
    save_contact: "Save Contact Info",
    quick_form: "Quick Contact Form",
    your_name: "Your Name",
    email: "Email",
    message: "Message",
    send_message: "Send Message",

    // Profile
    back_to_roster: "← Back to Roster",
    contact_us: "Contact Us",
    nationality: "Nationality",
    available: "Available",
    person_not_found: "Person not found",
    profile_not_exist: "This profile does not exist.",

    // Common
    empty_day: "No one scheduled for this day yet.",
    tomorrow_pending: "The roster for tomorrow will be updated tonight by 9pm",
    footer: "© 2026 7 Ways. All rights reserved.",
    saved: "Saved! Content updated (stored in your browser)."
  },

  ja: {
    nav_home: "ホーム",
    nav_roster: "ロスター",
    nav_pricing: "料金",
    nav_employment: "採用",
    nav_contact: "お問い合わせ",

    home_title: "ようこそ",
    home_subtitle: "日付を選択して、現在利用可能なオプションを表示します。",
    btn_today: "今日",
    btn_tomorrow: "明日",
    section_pricing: "料金",
    section_contact: "お問い合わせ",
    manage_pricing: "料金を管理 →",
    manage_contact: "連絡先を管理 →",

    roster_title: "ロスター",
    roster_subtitle: "CMSで管理されている完全なロスター。利用可能日でフィルター。",
    btn_all: "すべて",
    admin_note_roster: "ロスターを更新するには、js/data.js を編集してください。",

    pricing_title: "料金",
    current_pricing: "現在の料金",
    edit_pricing: "料金テキストを編集",
    pricing_note: "変更はブラウザに保存されます。",
    save_pricing: "料金を保存",

    employment_title: "採用応募",
    employment_intro: "以下のすべてのフィールドに記入してください。情報は機密として扱われます。",
    label_name: "氏名",
    label_nationality: "国籍",
    label_age: "年齢",
    label_contact: "連絡先番号",
    placeholder_name: "氏名を入力",
    placeholder_nationality: "例：日本、フランスなど",
    placeholder_age: "年齢",
    placeholder_contact: "例：090-XXXX-XXXX",
    submit_application: "応募を送信",
    form_success: "応募を受け付けました！\n\nありがとうございます。追ってご連絡いたします。",

    contact_title: "お問い合わせ",
    get_in_touch: "ご連絡ください",
    edit_contact: "連絡先情報を編集",
    contact_note: "変更はブラウザに保存されます。",
    save_contact: "連絡先を保存",
    quick_form: "クイックお問い合わせフォーム",
    your_name: "お名前",
    email: "メール",
    message: "メッセージ",
    send_message: "メッセージを送信",

    back_to_roster: "← ロスターに戻る",
    contact_us: "お問い合わせ",
    nationality: "国籍",
    available: "利用可能",
    person_not_found: "人物が見つかりません",
    profile_not_exist: "このプロフィールは存在しません。",

    empty_day: "この日の予定はありません。",
    tomorrow_pending: "明日のロスターは今夜9時までに更新されます",
    footer: "© 2026 7 Ways. All rights reserved.",
    saved: "保存しました！（ブラウザに保存されています）"
  },

  zh: {
    nav_home: "首页",
    nav_roster: "名单",
    nav_pricing: "价格",
    nav_employment: "招聘",
    nav_contact: "联系我们",

    home_title: "欢迎",
    home_subtitle: "选择日期查看当前可用选项。",
    btn_today: "今天",
    btn_tomorrow: "明天",
    section_pricing: "价格",
    section_contact: "联系我们",
    manage_pricing: "管理价格 →",
    manage_contact: "管理联系方式 →",

    roster_title: "名单",
    roster_subtitle: "通过CMS管理的完整名单。按可用性筛选。",
    btn_all: "全部",
    admin_note_roster: "要更新名单，请编辑 js/data.js 文件。",

    pricing_title: "价格",
    current_pricing: "当前价格",
    edit_pricing: "编辑价格文本",
    pricing_note: "更改保存在浏览器中。",
    save_pricing: "保存价格",

    employment_title: "招聘申请",
    employment_intro: "请填写以下所有字段。所有信息将严格保密。",
    label_name: "全名",
    label_nationality: "国籍",
    label_age: "年龄",
    label_contact: "联系电话",
    placeholder_name: "输入您的全名",
    placeholder_nationality: "例如：中国、法国等",
    placeholder_age: "您的年龄",
    placeholder_contact: "例如：138XXXXXXX",
    submit_application: "提交申请",
    form_success: "申请已收到！\n\n谢谢。我们会尽快与您联系。",

    contact_title: "联系我们",
    get_in_touch: "取得联系",
    edit_contact: "编辑联系信息",
    contact_note: "更改保存在浏览器中。",
    save_contact: "保存联系信息",
    quick_form: "快速联系表单",
    your_name: "您的姓名",
    email: "电子邮件",
    message: "留言",
    send_message: "发送消息",

    back_to_roster: "← 返回名单",
    contact_us: "联系我们",
    nationality: "国籍",
    available: "可用时间",
    person_not_found: "未找到此人",
    profile_not_exist: "此个人资料不存在。",

    empty_day: "当天暂无安排。",
    tomorrow_pending: "明日的名单将于今晚9点前更新",
    footer: "© 2026 7 Ways. 保留所有权利。",
    saved: "已保存！内容已更新（保存在浏览器中）。"
  },

  ko: {
    nav_home: "홈",
    nav_roster: "명단",
    nav_pricing: "가격",
    nav_employment: "채용",
    nav_contact: "문의하기",

    home_title: "환영합니다",
    home_subtitle: "날짜를 선택하여 현재 이용 가능한 옵션을 확인하세요.",
    btn_today: "오늘",
    btn_tomorrow: "내일",
    section_pricing: "가격",
    section_contact: "문의하기",
    manage_pricing: "가격 관리 →",
    manage_contact: "연락처 관리 →",

    roster_title: "명단",
    roster_subtitle: "CMS로 관리되는 전체 명단. 가능 여부로 필터링.",
    btn_all: "전체",
    admin_note_roster: "명단을 업데이트하려면 js/data.js를 편집하세요.",

    pricing_title: "가격",
    current_pricing: "현재 가격",
    edit_pricing: "가격 텍스트 편집",
    pricing_note: "변경 사항은 브라우저에 저장됩니다.",
    save_pricing: "가격 저장",

    employment_title: "채용 지원",
    employment_intro: "아래 모든 항목을 입력해 주세요. 모든 정보는 비밀로 유지됩니다.",
    label_name: "성명",
    label_nationality: "국적",
    label_age: "나이",
    label_contact: "연락처",
    placeholder_name: "성명을 입력하세요",
    placeholder_nationality: "예: 한국, 프랑스 등",
    placeholder_age: "나이",
    placeholder_contact: "예: 010-XXXX-XXXX",
    submit_application: "지원서 제출",
    form_success: "지원서가 접수되었습니다!\n\n감사합니다. 곧 연락드리겠습니다.",

    contact_title: "문의하기",
    get_in_touch: "연락하기",
    edit_contact: "연락처 정보 편집",
    contact_note: "변경 사항은 브라우저에 저장됩니다.",
    save_contact: "연락처 저장",
    quick_form: "빠른 문의 양식",
    your_name: "성함",
    email: "이메일",
    message: "메시지",
    send_message: "메시지 보내기",

    back_to_roster: "← 명단으로 돌아가기",
    contact_us: "문의하기",
    nationality: "국적",
    available: "가능 시간",
    person_not_found: "사람을 찾을 수 없습니다",
    profile_not_exist: "이 프로필은 존재하지 않습니다.",

    empty_day: "해당 날짜에 예정된 사람이 없습니다.",
    tomorrow_pending: "내일 명단은 오늘 밤 9시까지 업데이트됩니다",
    footer: "© 2026 7 Ways. All rights reserved.",
    saved: "저장되었습니다! (브라우저에 저장됨)"
  }
};

// Current language (default English)
let currentLang = localStorage.getItem('7ways_lang') || 'en';

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS.en[key] || key;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('7ways_lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  applyTranslations();
  // Also refresh custom Pricing / Contact text for the new language
  if (typeof refreshCustomTexts === 'function') {
    refreshCustomTexts();
  }
  // Update active flag button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function applyTranslations() {
  // Elements with data-i18n="key"
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation;
    } else {
      el.textContent = translation;
    }
  });

  // Placeholders specifically
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  // Update page title if needed (simple)
  const page = document.body.dataset.page;
  if (page === 'home') document.title = t('home_title') + ' | 7 Ways';
  if (page === 'roster') document.title = t('roster_title') + ' | 7 Ways';
  if (page === 'pricing') document.title = t('pricing_title') + ' | 7 Ways';
  if (page === 'employment') document.title = t('employment_title') + ' | 7 Ways';
  if (page === 'contact') document.title = t('contact_title') + ' | 7 Ways';
}