import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'hi', label: 'Hindi' },
    { code: 'en', label: 'English' },
  ];

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <select
      onChange={handleLanguageChange}
      value={i18n.language} // current selected language
      className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 transition"
    >
      {languages.map((lng) => (
        <option key={lng.code} value={lng.code}>
          {lng.label}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
