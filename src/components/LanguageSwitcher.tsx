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
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Language:</span>
      <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {languageOptions.map((option) => (
          <button
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              language === option.code
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            title={option.name}
          >
            <span className="mr-1">{option.flag}</span>
            <span className="hidden sm:inline">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
