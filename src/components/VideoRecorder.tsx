'use client';

import { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaSpinner, FaMapMarkerAlt, FaTrash, FaCheckCircle, FaCopy, FaExternalLinkAlt, FaTimes, FaEye } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
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
      alert('Failed to access camera. Please check permissions.');
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

    // Check environment variables first
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'safai_citizen';
    
    if (!cloudName || cloudName === 'your_cloudinary_cloud_name') {
      alert('Cloudinary not configured! Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file with your actual Cloudinary cloud name.');
      return;
    }

    console.log('Upload configuration:', { cloudName, uploadPreset });

    setIsUploading(true);
    
    try {
      for (const photo of unuploadedPhotos) {
        console.log('Uploading photo:', photo.id, 'Size:', photo.blob.size, 'bytes');
        const cloudinaryUrl = await uploadToCloudinary(photo);
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id ? { 
              ...p, 
              uploaded: true, 
              cloudinaryUrl: cloudinaryUrl 
            } : p
          )
        );
        console.log(`Photo ${photo.id} uploaded successfully. Cloudinary URL: ${cloudinaryUrl}`);
      }
      
      alert(`${unuploadedPhotos.length} photo(s) uploaded successfully!`);
      setDescription('');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
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
      alert('No uploaded photos found!');
      return;
    }
    
    const urlText = uploadedPhotos.map(photo => 
      `Photo ${photo.id}: ${photo.cloudinaryUrl}`
    ).join('\n');
    
    navigator.clipboard.writeText(urlText).then(() => {
      alert('Photo URLs copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URLs to clipboard');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaCamera className="mr-2 text-green-600" />
        Live Camera Capture
      </h2>

      {/* Camera Preview */}
      <div className="mb-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
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
              <div className="text-center">
                <FaCamera size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Click "Start Camera" to begin</p>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-all shadow-lg"
              >
                <FaCamera size={24} />
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all shadow-lg"
                >
                  <FaCamera size={24} />
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-all shadow-lg"
                >
                  ×
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Description Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the cleanliness issue..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Captured Photos */}
      {photos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Captured Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Captured"
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
                      title="Preview"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
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

      {/* Uploaded Photos URLs Section */}
      {photos.some((photo) => photo.uploaded && photo.cloudinaryUrl) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Uploaded Photos & URLs</h3>
            <button
              onClick={copyUrlsToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
            >
              <FaCopy className="mr-2" />
              Copy URLs
            </button>
          </div>
          <div className="space-y-3">
            {photos
              .filter(photo => photo.uploaded && photo.cloudinaryUrl)
              .map((photo) => (
                <div key={photo.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FaCheckCircle className="text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          Uploaded at {photo.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 break-all">
                            {photo.cloudinaryUrl}
                          </span>
                          <div className="flex space-x-2 ml-3">
                            <button
                              onClick={() => navigator.clipboard.writeText(photo.cloudinaryUrl!)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Copy URL"
                            >
                              <FaCopy size={14} />
                            </button>
                            <button
                              onClick={() => window.open(photo.cloudinaryUrl!, '_blank')}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Open in new tab"
                            >
                              <FaExternalLinkAlt size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {photo.location && (
                        <div className="mt-2 text-xs text-gray-500">
                          📍 Location: {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
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
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center font-medium"
        >
          {isUploading ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" />
              Upload Photos
            </>
          )}
        </button>
      )}

      {/* Location Info */}
      {currentLocation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            Current Location
          </h4>
          <p className="text-sm text-blue-600">
            Latitude: {currentLocation.latitude.toFixed(6)}
          </p>
          <p className="text-sm text-blue-600">
            Longitude: {currentLocation.longitude.toFixed(6)}
          </p>
          <p className="text-sm text-blue-600">
            Accuracy: {currentLocation.accuracy.toFixed(0)}m
          </p>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Photo Preview</h3>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <img
                  src={previewPhoto.url}
                  alt="Preview"
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <strong className="mr-2">Captured:</strong>
                  {previewPhoto.timestamp.toLocaleString()}
                </div>
                {previewPhoto.location && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    <strong className="mr-2">Location:</strong>
                    <span>
                      {previewPhoto.location.latitude.toFixed(6)}, {previewPhoto.location.longitude.toFixed(6)}
                      <span className="ml-2 text-xs">
                        (±{previewPhoto.location.accuracy.toFixed(0)}m)
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <strong className="mr-2">Status:</strong>
                  {previewPhoto.uploaded ? (
                    <span className="text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-orange-600">Pending Upload</span>
                  )}
                </div>
                {previewPhoto.cloudinaryUrl && (
                  <div className="flex items-center">
                    <strong className="mr-2">Cloudinary URL:</strong>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 break-all">{previewPhoto.cloudinaryUrl}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(previewPhoto.cloudinaryUrl!)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Copy URL"
                      >
                        <FaCopy size={14} />
                      </button>
                      <button
                        onClick={() => window.open(previewPhoto.cloudinaryUrl!, '_blank')}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Open in new tab"
                      >
                        <FaExternalLinkAlt size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => removePhoto(previewPhoto.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Photo
                </button>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
