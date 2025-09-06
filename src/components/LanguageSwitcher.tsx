'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';

const languageOptions: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
      <span className="text-xs sm:text-sm text-gray-600 font-medium">Language:</span>
      <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {languageOptions.map((option) => (
          <button
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors touch-manipulation min-w-0 ${
              language === option.code
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={option.name}
          >
            <span className="mr-1">{option.flag}</span>
            <span className="hidden xs:inline sm:inline truncate">{option.name}</span>
            <span className="inline xs:hidden sm:hidden">{option.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
