import React, { createContext, useContext, useState } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  const translations = {
    /* =====================================================
       ENGLISH
    ===================================================== */
    en: {
      common: {
        upload: "Upload Chart",
        analyze: "Run Analysis",
        save: "Save Analysis",
        login: "Login",
        logout: "Logout",
        theme: "Theme",
        copy: "Copy",
        analyzing: "Analyzing…",
        similarSetups: "Similar Setups",
      },

      predict: {
        cnnTitle: "CNN Prediction",
        confidence: "Confidence",
        patternInsight: "Pattern Insight",
        extractedLevels: "Extracted Levels",
      },

      about: {
        title: "About Timfx1 Pattern AI",
        intro:
          "was developed by",
        introEnd:
          "— a trader and technologist passionate about empowering others to see the market more clearly through data-driven insights and visual pattern recognition.",
        goal:
          "The goal of this project is to help traders analyze their own setups by comparing them with historically validated patterns.",
        mission:
          "Using advanced computer vision and AI, Timfx1 identifies structural similarities between your uploaded chart and proven setups.",
        quote:
          "We learn from the past to master the present — and prepare for the trade ahead.",
        youtube: "YouTube Channel",
        contact: "Contact Developer",
        support: "Buy Me a Coffee — Support the Project",
      },

      footer: {
        rights: "All rights reserved.",
        disclaimer:
          "This tool is for educational purposes only. Trading involves risk.",
      },
    },

    /* =====================================================
       GERMAN
    ===================================================== */
    de: {
      common: {
        upload: "Chart hochladen",
        analyze: "Analyse starten",
        save: "Analyse speichern",
        login: "Anmelden",
        logout: "Abmelden",
        theme: "Thema",
        copy: "Kopieren",
        analyzing: "Analyse läuft…",
        similarSetups: "Ähnliche Setups",
      },

      predict: {
        cnnTitle: "CNN-Vorhersage",
        confidence: "Konfidenz",
        patternInsight: "Musteranalyse",
        extractedLevels: "Erkannte Levels",
      },

      about: {
        title: "Über Timfx1 Pattern AI",
        intro: "wurde entwickelt von",
        introEnd:
          "— einem Trader und Technologen mit der Leidenschaft, anderen zu helfen, den Markt besser zu verstehen.",
        goal:
          "Ziel dieses Projekts ist es, Tradern zu helfen, ihre Setups mit historisch validierten Mustern zu vergleichen.",
        mission:
          "Durch KI und Computer Vision erkennt Timfx1 strukturelle Ähnlichkeiten zwischen Charts.",
        quote:
          "Wir lernen aus der Vergangenheit, um die Gegenwart zu meistern.",
        youtube: "YouTube-Kanal",
        contact: "Entwickler kontaktieren",
        support: "Kauf mir einen Kaffee — Projekt unterstützen",
      },

      footer: {
        rights: "Alle Rechte vorbehalten.",
        disclaimer:
          "Dieses Tool dient nur zu Bildungszwecken. Trading ist risikoreich.",
      },
    },

    /* =====================================================
       FRENCH
    ===================================================== */
    fr: {
      common: {
        upload: "Importer un graphique",
        analyze: "Lancer l'analyse",
        save: "Sauvegarder l'analyse",
        login: "Connexion",
        logout: "Déconnexion",
        theme: "Thème",
        copy: "Copier",
        analyzing: "Analyse en cours…",
        similarSetups: "Configurations similaires",
      },

      predict: {
        cnnTitle: "Prédiction CNN",
        confidence: "Confiance",
        patternInsight: "Analyse du modèle",
        extractedLevels: "Niveaux extraits",
      },

      about: {
        title: "À propos de Timfx1 Pattern AI",
        intro: "a été développé par",
        introEnd:
          "— un trader et technologue passionné par l'analyse des marchés.",
        goal:
          "Ce projet aide les traders à analyser leurs configurations à l'aide de modèles validés.",
        mission:
          "Grâce à l'IA, Timfx1 identifie les similitudes structurelles des graphiques.",
        quote:
          "Nous apprenons du passé pour maîtriser le présent.",
        youtube: "Chaîne YouTube",
        contact: "Contacter le développeur",
        support: "Offrez-moi un café — Soutenir le projet",
      },

      footer: {
        rights: "Tous droits réservés.",
        disclaimer:
          "Cet outil est éducatif uniquement. Le trading comporte des risques.",
      },
    },

    /* =====================================================
       LUGANDA
    ===================================================== */
    lg: {
      common: {
        upload: "Teeka ekifananyi",
        analyze: "Kola enonyo",
        save: "Tereka ennokola",
        login: "Yingira",
        logout: "Fuluma",
        theme: "Enteekateeka",
        copy: "Koppa",
        analyzing: "Kitegeezebwa…",
        similarSetups: "Ebifananyi ebifaanagana",
      },

      predict: {
        cnnTitle: "Enteekateeka ya CNN",
        confidence: "Obwesige",
        patternInsight: "Okusobola okutegeera",
        extractedLevels: "Ebipimo ebivuddewo",
      },

      about: {
        title: "Ku Timfx1 Pattern AI",
        intro: "yakolebwa",
        introEnd:
          "— omusuubuzi n'omutekateka wa tekinologiya.",
        goal:
          "Ekigendererwa ky’enteekateeka eno kwe kuyamba abasubuzi okwekenneenya enteekateeka zaabwe.",
        mission:
          "Timfx1 ekozesa AI okuzuula obufaananyi mu chati.",
        quote:
          "Tuyiga okuva mu byayita okufuga leero.",
        youtube: "Omukutu gwa YouTube",
        contact: "Tukolagane n’Omukugu",
        support: "Nsasula Kafe — Wagira Omulimu",
      },

      footer: {
        rights: "Obuyinza bwonna bukkiriziddwa.",
        disclaimer:
          "Enteekateeka eno ya kusomesa. Okusuubula kulina obulabe.",
      },
    },

    /* =====================================================
       ARABIC
    ===================================================== */
    ar: {
      common: {
        upload: "رفع الصورة",
        analyze: "تشغيل التحليل",
        save: "حفظ التحليل",
        login: "تسجيل الدخول",
        logout: "تسجيل الخروج",
        theme: "السمة",
        copy: "نسخ",
        analyzing: "جارٍ التحليل…",
        similarSetups: "أنماط مشابهة",
      },

      predict: {
        cnnTitle: "توقع CNN",
        confidence: "الثقة",
        patternInsight: "تحليل النمط",
        extractedLevels: "المستويات المستخرجة",
      },

      about: {
        title: "حول Timfx1 Pattern AI",
        intro: "تم تطويره بواسطة",
        introEnd:
          "— متداول وخبير تقني.",
        goal:
          "يساعد هذا المشروع المتداولين على تحليل إعداداتهم.",
        mission:
          "باستخدام الذكاء الاصطناعي، يحدد Timfx1 الأنماط المتشابهة.",
        quote:
          "نتعلم من الماضي لإتقان الحاضر.",
        youtube: "قناة يوتيوب",
        contact: "التواصل مع المطور",
        support: "ادعمني بفنجان قهوة",
      },

      footer: {
        rights: "جميع الحقوق محفوظة.",
        disclaimer:
          "هذه الأداة تعليمية فقط. التداول ينطوي على مخاطر.",
      },
    },

    /* =====================================================
       CHINESE
    ===================================================== */
    zh: {
      common: {
        upload: "上传图表",
        analyze: "运行分析",
        save: "保存分析",
        login: "登录",
        logout: "退出",
        theme: "主题",
        copy: "复制",
        analyzing: "分析中…",
        similarSetups: "相似形态",
      },

      predict: {
        cnnTitle: "CNN 预测",
        confidence: "置信度",
        patternInsight: "形态分析",
        extractedLevels: "提取的区间",
      },

      about: {
        title: "关于 Timfx1 Pattern AI",
        intro: "由以下人员开发",
        introEnd:
          "— 一位交易员和技术专家。",
        goal:
          "该项目帮助交易者分析自己的交易设置。",
        mission:
          "Timfx1 使用人工智能识别结构相似性。",
        quote:
          "从过去中学习，掌控现在。",
        youtube: "YouTube 频道",
        contact: "联系开发者",
        support: "请我喝杯咖啡",
      },

      footer: {
        rights: "版权所有。",
        disclaimer:
          "该工具仅用于教育目的。交易存在风险。",
      },
    },

    /* =====================================================
       SWAHILI
    ===================================================== */
    sw: {
      common: {
        upload: "Pakia Chati",
        analyze: "Fanya Uchambuzi",
        save: "Hifadhi Uchambuzi",
        login: "Ingia",
        logout: "Toka",
        theme: "Mandhari",
        copy: "Nakili",
        analyzing: "Inachambua…",
        similarSetups: "Setups Zinazofanana",
      },

      predict: {
        cnnTitle: "Utabiri wa CNN",
        confidence: "Uhakika",
        patternInsight: "Uchambuzi wa Muundo",
        extractedLevels: "Viwango Vilivyotolewa",
      },

      about: {
        title: "Kuhusu Timfx1 Pattern AI",
        intro: "ilitengenezwa na",
        introEnd:
          "— mfanyabiashara na mtaalamu wa teknolojia.",
        goal:
          "Mradi huu husaidia wafanyabiashara kuchambua mipangilio yao.",
        mission:
          "Timfx1 hutumia AI kutambua miundo inayofanana.",
        quote:
          "Tunajifunza kutoka zamani ili kutawala sasa.",
        youtube: "Kituo cha YouTube",
        contact: "Wasiliana na Msanidi",
        support: "Ninunulie Kahawa",
      },

      footer: {
        rights: "Haki zote zimehifadhiwa.",
        disclaimer:
          "Zana hii ni ya elimu tu. Biashara ina hatari.",
      },
    },
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, strings: translations[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
