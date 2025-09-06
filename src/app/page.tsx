'use client';

import LiveCameraCapture from '@/components/VideoRecorder';
import { FaLeaf } from 'react-icons/fa';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FaLeaf className="text-green-600 text-4xl mr-3" />
          <h1 className="text-4xl font-bold text-green-800">Safai Citizen</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Help make your city cleaner by reporting issues with live camera photos
        </p>
      </header>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto">
        <LiveCameraCapture />
      </div>
    </div>
  );
}
