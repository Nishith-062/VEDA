import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState("en");

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
  ];

const handleLanguageChange = () => {
  const newLang = lang === "en" ? "hi" : "en";
  setLang(newLang);
  i18n.changeLanguage(newLang);
};


  

  return (
<div className="flex justify-center items-center cursor-pointer">
  <button
    onClick={handleLanguageChange}
    className="flex items-center px-3 py-1.5 cursor-pointer rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-orange-300"
  >
    {lang === "en" ? (
      <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium text-sm transition-all duration-200">
        हिंदी
      </span>
    ) : (
      <span className="text-gray-500 font-medium text-sm transition-colors duration-200">
        English
      </span>
    )}
  </button>
</div>


  );
}

export default LanguageSelector;
