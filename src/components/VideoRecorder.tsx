'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaCamera, FaUpload, FaSpinner, FaMapMarkerAlt, FaTrash, FaCheckCircle, FaCopy, FaExternalLinkAlt, FaTimes, FaEye } from 'react-icons/fa';
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
  blob: Blob;
  url: string; // Local blob URL for preview
  cloudinaryUrl?: string; // Cloudinary URL after upload
  location?: LocationData;
  timestamp: Date;
  uploaded: boolean;
}

export default function LiveCameraCapture() {
  const { t } = useLanguage();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoData | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const startCamera = async () => {
    try {
      // Get location first
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.error('Location access denied:', error);
        setCurrentLocation(null);
      }

      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        },
        audio: false // No audio needed for photos
      });

      streamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      setIsCameraActive(true);

    } catch (error) {
      console.error('Error starting camera:', error);
      alert(t('cameraAccessFailed'));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoPreviewRef.current || !canvasRef.current) return;

    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      
      const newPhoto: PhotoData = {
        id: uuidv4(),
        blob,
        url,
        location: currentLocation || undefined,
        timestamp: new Date(),
        uploaded: false,
      };

      setPhotos((prev) => [...prev, newPhoto]);
    }, 'image/jpeg', 0.9);
  };

  const uploadToCloudinary = async (photo: PhotoData): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'safai_citizen';
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', photo.blob);
    formData.append('upload_preset', uploadPreset);
    
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

    console.log('Uploading to Cloudinary:', {
      cloudName,
      uploadPreset,
      blobSize: photo.blob.size
    });

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary response error:', response.status, response.statusText, errorData);
        
        if (response.status === 400 && errorData.includes('Upload preset not found')) {
          throw new Error(`Upload preset "${uploadPreset}" not found. Please create this preset in your Cloudinary dashboard under Settings → Upload → Upload presets.`);
        }
        
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    const unuploadedPhotos = photos.filter((photo) => !photo.uploaded);
    if (unuploadedPhotos.length === 0) return;

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    // Check environment variables first
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'safai_citizen';
    
    if (!cloudName || cloudName === 'your_cloudinary_cloud_name') {
      alert(t('cloudinaryNotConfigured'));
      return;
    }

    setIsUploading(true);
    
    try {
      for (const photo of unuploadedPhotos) {
        const cloudinaryUrl = await uploadToCloudinary(photo);
        
        // Save to Firestore
        const reportData = {
          imageUrl: cloudinaryUrl,
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
            p.id === photo.id ? { 
              ...p, 
              uploaded: true, 
              cloudinaryUrl: cloudinaryUrl 
            } : p
          )
        );
      }
      
      alert(`${unuploadedPhotos.length} ${t('uploadSuccess')}`);
      setDescription('');
      setName('');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`${t('uploadFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const getUploadedPhotoUrls = () => {
    return photos
      .filter(photo => photo.uploaded && photo.cloudinaryUrl)
      .map(photo => ({
        id: photo.id,
        cloudinaryUrl: photo.cloudinaryUrl!,
        timestamp: photo.timestamp,
        location: photo.location
      }));
  };

  const copyUrlsToClipboard = () => {
    const uploadedPhotos = getUploadedPhotoUrls();
    if (uploadedPhotos.length === 0) {
      alert(t('noUploadedPhotos'));
      return;
    }
    
    const urlText = uploadedPhotos.map(photo => 
      `Photo ${photo.id}: ${photo.cloudinaryUrl}`
    ).join('\n');
    
    navigator.clipboard.writeText(urlText).then(() => {
      alert(t('photoUrlsCopied'));
    }).catch(() => {
      alert('Failed to copy URLs to clipboard');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
        <FaCamera className="mr-2 text-green-600 text-lg sm:text-xl" />
        {t('liveCameraCapture')}
      </h2>

      {/* Camera Preview */}
      <div className="mb-4 sm:mb-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video w-full">
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Camera not active overlay */}
          {!isCameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center p-4">
                <FaCamera size={32} className="mx-auto mb-3 text-gray-400 sm:mb-4" />
                <p className="text-sm sm:text-base">{t('clickToStart')}</p>
              </div>
            </div>
          )}

          {/* Controls overlay - hidden on mobile, shown on larger screens */}
          <div className="hidden sm:flex absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 space-x-3 sm:space-x-4">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="bg-green-600 hover:bg-green-700 text-white p-3 sm:p-4 rounded-full transition-all shadow-lg touch-manipulation"
              >
                <FaCamera size={20} className="sm:w-6 sm:h-6" />
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full transition-all shadow-lg touch-manipulation"
                >
                  <FaCamera size={20} className="sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 sm:p-4 rounded-full transition-all shadow-lg touch-manipulation text-xl sm:text-2xl"
                >
                  ×
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Controls - below video container */}
        <div className="flex sm:hidden justify-center mt-4 space-x-4">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-all shadow-lg touch-manipulation"
            >
              <FaCamera size={24} />
            </button>
          ) : (
            <>
              <button
                onClick={capturePhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all shadow-lg touch-manipulation"
              >
                <FaCamera size={24} />
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-all shadow-lg touch-manipulation text-2xl font-light"
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

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
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
          required
        />
      </div>


      {/* Description Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('descriptionOptional')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('describeIssue')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
          rows={3}
        />
      </div>

      {/* Captured Photos */}
      {photos.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('capturedPhotos')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <Image
                  src={photo.url}
                  alt="Captured"
                  width={200}
                  height={128}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="bg-blue-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 transition-all touch-manipulation"
                      title={t('preview')}
                    >
                      <FaEye size={12} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-all touch-manipulation"
                      title={t('delete')}
                    >
                      <FaTrash size={12} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                {photo.uploaded && (
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-green-500 text-white p-0.5 sm:p-1 rounded-full">
                    <FaCheckCircle size={12} className="sm:w-4 sm:h-4" />
                  </div>
                )}
                {photo.location && (
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-blue-500 text-white p-0.5 sm:p-1 rounded-full">
                    <FaMapMarkerAlt size={10} className="sm:w-3 sm:h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Photos URLs Section */}
      {photos.some((photo) => photo.uploaded && photo.cloudinaryUrl) && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold">{t('uploadedPhotosUrls')}</h3>
            <button
              onClick={copyUrlsToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm flex items-center justify-center touch-manipulation"
            >
              <FaCopy className="mr-2" />
              {t('copyUrls')}
            </button>
          </div>
          <div className="space-y-3">
            {photos
              .filter(photo => photo.uploaded && photo.cloudinaryUrl)
              .map((photo) => (
                <div key={photo.id} className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <FaCheckCircle className="text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-green-800">
                          {t('uploaded')} at {photo.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white p-2 sm:p-3 rounded border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm text-gray-600 break-all min-w-0 flex-1">
                            {photo.cloudinaryUrl}
                          </span>
                          <div className="flex space-x-2 flex-shrink-0">
                            <button
                              onClick={() => navigator.clipboard.writeText(photo.cloudinaryUrl!)}
                              className="text-blue-600 hover:text-blue-800 p-1 touch-manipulation"
                              title={t('copyUrl')}
                            >
                              <FaCopy size={14} />
                            </button>
                            <button
                              onClick={() => window.open(photo.cloudinaryUrl!, '_blank')}
                              className="text-green-600 hover:text-green-800 p-1 touch-manipulation"
                              title={t('openInNewTab')}
                            >
                              <FaExternalLinkAlt size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {photo.location && (
                        <div className="mt-2 text-xs text-gray-500">
                          📍 {t('currentLocation')}: {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
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
          className="w-full bg-green-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center font-medium text-base touch-manipulation"
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
      {currentLocation && (
        <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center text-sm sm:text-base">
            <FaMapMarkerAlt className="mr-2" />
            {t('currentLocation')}
          </h4>
          <div className="space-y-1 text-xs sm:text-sm text-blue-600">
            <p>{t('latitude')}: {currentLocation.latitude.toFixed(6)}</p>
            <p>{t('longitude')}: {currentLocation.longitude.toFixed(6)}</p>
            <p>{t('accuracy')}: {currentLocation.accuracy.toFixed(0)}m</p>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto w-full mx-2 sm:mx-4">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h3 className="text-base sm:text-lg font-semibold">{t('photoPreview')}</h3>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-gray-500 hover:text-gray-700 p-2 touch-manipulation"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="mb-4">
                <Image
                  src={previewPhoto.url}
                  alt="Preview"
                  width={600}
                  height={400}
                  className="w-full max-h-64 sm:max-h-96 object-contain mx-auto rounded-lg"
                />
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <strong className="flex-shrink-0">{t('captured')}:</strong>
                  <span className="break-all">{previewPhoto.timestamp.toLocaleString()}</span>
                </div>
                {previewPhoto.location && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-blue-600 flex-shrink-0" />
                      <strong className="flex-shrink-0">{t('currentLocation')}:</strong>
                    </div>
                    <span className="break-all">
                      {previewPhoto.location.latitude.toFixed(6)}, {previewPhoto.location.longitude.toFixed(6)}
                      <span className="ml-2 text-xs">
                        (±{previewPhoto.location.accuracy.toFixed(0)}m)
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <strong className="flex-shrink-0">{t('status')}:</strong>
                  {previewPhoto.uploaded ? (
                    <span className="text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      {t('uploaded')}
                    </span>
                  ) : (
                    <span className="text-orange-600">{t('pendingUpload')}</span>
                  )}
                </div>
                {previewPhoto.cloudinaryUrl && (
                  <div className="flex flex-col gap-1">
                    <strong>{t('cloudinaryUrl')}:</strong>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-blue-600 break-all text-xs min-w-0 flex-1">
                        {previewPhoto.cloudinaryUrl}
                      </span>
                      <div className="flex space-x-2 flex-shrink-0">
                        <button
                          onClick={() => navigator.clipboard.writeText(previewPhoto.cloudinaryUrl!)}
                          className="text-blue-600 hover:text-blue-800 p-1 touch-manipulation"
                          title={t('copyUrl')}
                        >
                          <FaCopy size={14} />
                        </button>
                        <button
                          onClick={() => window.open(previewPhoto.cloudinaryUrl!, '_blank')}
                          className="text-green-600 hover:text-green-800 p-1 touch-manipulation"
                          title={t('openInNewTab')}
                        >
                          <FaExternalLinkAlt size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button
                  onClick={() => removePhoto(previewPhoto.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center touch-manipulation"
                >
                  <FaTrash className="mr-2" />
                  {t('deletePhoto')}
                </button>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg touch-manipulation"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
