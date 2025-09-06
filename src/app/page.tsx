'use client';

import LiveCameraCapture from '@/components/VideoRecorder';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaLeaf } from 'react-icons/fa';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <FaLeaf className="text-green-600 text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 leading-tight">
              {t('appTitle')}
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg px-4 max-w-2xl mx-auto">
            {t('appSubtitle')}
          </p>
          
          {/* Language Switcher */}
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Content Area */}
        <div className="w-full">
          <LiveCameraCapture />
        </div>
      </div>
    </div>
  );
}
