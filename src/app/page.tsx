'use client';

import LiveCameraCapture from '@/components/VideoRecorder';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaLeaf } from 'react-icons/fa';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FaLeaf className="text-green-600 text-4xl mr-3" />
          <h1 className="text-4xl font-bold text-green-800">{t('appTitle')}</h1>
        </div>
        <p className="text-gray-600 text-lg">
          {t('appSubtitle')}
        </p>
        
        {/* Language Switcher */}
        <div className="flex justify-center mt-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto">
        <LiveCameraCapture />
      </div>
    </div>
  );
}
