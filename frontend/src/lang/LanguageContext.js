import React, { createContext, useContext, useState } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  const translations = {
    en: {
      upload: "Upload Chart",
      analyze: "Run Analysis",
      save: "Save Analysis",
      patternInsight: "Pattern Insight",
      similarSetups: "Similar Setups",
      extractedLevels: "Extracted Levels",
      selectLang: "Language",
    },

    de: {
      upload: "Chart hochladen",
      analyze: "Analyse starten",
      save: "Analyse speichern",
      patternInsight: "Musteranalyse",
      similarSetups: "Ähnliche Setups",
      extractedLevels: "Erkannte Levels",
      selectLang: "Sprache",
    },

    fr: {
      upload: "Importer un graphique",
      analyze: "Lancer l'analyse",
      save: "Sauvegarder l'analyse",
      patternInsight: "Analyse du modèle",
      similarSetups: "Configurations similaires",
      extractedLevels: "Niveaux extraits",
      selectLang: "Langue",
    },

    lg: {
      upload: "Teeka ekifananyi",
      analyze: "Kola enonyo",
      save: "Tereka ennokola",
      patternInsight: "Okusobola okutuukiriza",
      similarSetups: "Ebifananyi ebifaanagana",
      extractedLevels: "Ebipimo ebivuddewo",
      selectLang: "Olulimi",
    },

    ar: {
      upload: "رفع الصورة",
      analyze: "تشغيل التحليل",
      save: "حفظ التحليل",
      patternInsight: "تحليل النمط",
      similarSetups: "أنماط مشابهة",
      extractedLevels: "المستويات المستخرجة",
      selectLang: "اللغة",
    },

    zh: {
      upload: "上传图表",
      analyze: "运行分析",
      save: "保存分析",
      patternInsight: "形态分析",
      similarSetups: "相似形态",
      extractedLevels: "提取的区间",
      selectLang: "语言",
    },

    sw: {
      upload: "Pakia Chati",
      analyze: "Fanya Uchambuzi",
      save: "Hifadhi Uchambuzi",
      patternInsight: "Uchambuzi wa Muundo",
      similarSetups: "Setups Zinazofanana",
      extractedLevels: "Viwango Vilivyotolewa",
      selectLang: "Lugha",
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
