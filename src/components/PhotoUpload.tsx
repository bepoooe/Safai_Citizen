'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaCamera, FaMapMarkerAlt, FaUpload, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '@/contexts/LanguageContext';
import { addCivilianReport } from '@/lib/firestore';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface PhotoData {
  id: string;
  file: File;
  preview: string;
  location?: LocationData;
  timestamp: Date;
  uploaded: boolean;
}

export default function PhotoUpload() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const location = await getCurrentLocation();
      
      const newPhotos: PhotoData[] = Array.from(files).map((file) => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        location,
        timestamp: new Date(),
        uploaded: false,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Add photos without location if geolocation fails
      const newPhotos: PhotoData[] = Array.from(files).map((file) => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        timestamp: new Date(),
        uploaded: false,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
      alert(t('locationAccessDenied'));
    }
  };

  const uploadToCloudinary = async (photo: PhotoData): Promise<string> => {
    const formData = new FormData();
    formData.append('file', photo.file);
    formData.append('upload_preset', 'safai_citizen'); // You'll need to create this in Cloudinary
    
    // Add location and timestamp as context
    const context = {
      timestamp: photo.timestamp.toISOString(),
      ...(photo.location && {
        latitude: photo.location.latitude,
        longitude: photo.location.longitude,
        accuracy: photo.location.accuracy,
      }),
    };
    formData.append('context', JSON.stringify(context));

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleUpload = async () => {
    const unuploadedPhotos = photos.filter((photo) => !photo.uploaded);
    if (unuploadedPhotos.length === 0) return;

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsUploading(true);
    
    try {
      for (const photo of unuploadedPhotos) {
        const imageUrl = await uploadToCloudinary(photo);
        
        // Save to Firestore
        const reportData = {
          imageUrl,
          name: name.trim(),
          location: {
            latitude: photo.location?.latitude || 0,
            longitude: photo.location?.longitude || 0,
            accuracy: photo.location?.accuracy,
          },
          description: description.trim()
        };
        
        await addCivilianReport(reportData);
        
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id ? { ...p, uploaded: true } : p
          )
        );
      }
      
      alert(t('uploadSuccess'));
      setDescription('');
      setName('');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaCamera className="mr-2 text-green-600" />
        {t('photoUploadDashboard')}
      </h2>

      {/* File Input */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 px-6 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center font-medium"
        >
          <FaCamera className="mr-2" />
          {t('clickToSelectPhotos')}
        </button>
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>


      {/* Description Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('descriptionOptional')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('describeIssue')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('selectedPhotos')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <Image
                  src={photo.preview}
                  alt="Preview"
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                  >
                    ×
                  </button>
                </div>
                {photo.uploaded && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <FaCheckCircle size={16} />
                  </div>
                )}
                {photo.location && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white p-1 rounded-full">
                    <FaMapMarkerAlt size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {photos.some((photo) => !photo.uploaded) && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center font-medium"
        >
          {isUploading ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              {t('uploading')}
            </>
          ) : (
            <>
              <FaUpload className="mr-2" />
              {t('uploadPhotos')}
            </>
          )}
        </button>
      )}

      {/* Location Info */}
      {photos.length > 0 && photos[0].location && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            {t('locationInformation')}
          </h4>
          <p className="text-sm text-blue-600">
            {t('latitude')}: {photos[0].location.latitude.toFixed(6)}
          </p>
          <p className="text-sm text-blue-600">
            {t('longitude')}: {photos[0].location.longitude.toFixed(6)}
          </p>
          <p className="text-sm text-blue-600">
            {t('accuracy')}: {photos[0].location.accuracy.toFixed(0)}m
          </p>
        </div>
      )}
    </div>
  );
}
