export type Language = 'en' | 'hi' | 'bn';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  
  // Camera Section
  liveCameraCapture: string;
  startCamera: string;
  stopCamera: string;
  capturePhoto: string;
  clickToStart: string;
  
  // Photo Management
  capturedPhotos: string;
  selectedPhotos: string;
  photoUploadDashboard: string;
  clickToSelectPhotos: string;
  dragAndDrop: string;
  
  // Description
  description: string;
  descriptionOptional: string;
  describeIssue: string;
  
  // Upload
  uploadPhotos: string;
  uploading: string;
  uploadSuccess: string;
  uploadFailed: string;
  uploadFailedTryAgain: string;
  
  // Status
  uploaded: string;
  pendingUpload: string;
  deletePhoto: string;
  preview: string;
  
  // Location
  locationInformation: string;
  currentLocation: string;
  latitude: string;
  longitude: string;
  accuracy: string;
  
  // URLs
  uploadedPhotosUrls: string;
  copyUrls: string;
  copyUrl: string;
  openInNewTab: string;
  photoUrlsCopied: string;
  noUploadedPhotos: string;
  
  // Photo Preview Modal
  photoPreview: string;
  captured: string;
  status: string;
  cloudinaryUrl: string;
  close: string;
  
  // Alerts
  locationAccessDenied: string;
  cameraAccessFailed: string;
  checkPermissions: string;
  cloudinaryNotConfigured: string;
  setCloudinaryName: string;
  
  // Actions
  copy: string;
  delete: string;
  view: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    appTitle: 'Safai Citizen',
    appSubtitle: 'Help make your city cleaner by reporting issues with live camera photos',
    
    // Camera Section
    liveCameraCapture: 'Live Camera Capture',
    startCamera: 'Start Camera',
    stopCamera: 'Stop Camera',
    capturePhoto: 'Capture Photo',
    clickToStart: 'Click "Start Camera" to begin',
    
    // Photo Management
    capturedPhotos: 'Captured Photos',
    selectedPhotos: 'Selected Photos',
    photoUploadDashboard: 'Photo Upload Dashboard',
    clickToSelectPhotos: 'Click to select photos or drag and drop',
    dragAndDrop: 'drag and drop',
    
    // Description
    description: 'Description',
    descriptionOptional: 'Description (Optional)',
    describeIssue: 'Describe the cleanliness issue...',
    
    // Upload
    uploadPhotos: 'Upload Photos',
    uploading: 'Uploading...',
    uploadSuccess: 'photo(s) uploaded successfully!',
    uploadFailed: 'Upload failed. Please try again.',
    uploadFailedTryAgain: 'Upload failed. Please try again.',
    
    // Status
    uploaded: 'Uploaded',
    pendingUpload: 'Pending Upload',
    deletePhoto: 'Delete Photo',
    preview: 'Preview',
    
    // Location
    locationInformation: 'Location Information',
    currentLocation: 'Current Location',
    latitude: 'Latitude',
    longitude: 'Longitude',
    accuracy: 'Accuracy',
    
    // URLs
    uploadedPhotosUrls: 'Uploaded Photos & URLs',
    copyUrls: 'Copy URLs',
    copyUrl: 'Copy URL',
    openInNewTab: 'Open in new tab',
    photoUrlsCopied: 'Photo URLs copied to clipboard!',
    noUploadedPhotos: 'No uploaded photos found!',
    
    // Photo Preview Modal
    photoPreview: 'Photo Preview',
    captured: 'Captured',
    status: 'Status',
    cloudinaryUrl: 'Cloudinary URL',
    close: 'Close',
    
    // Alerts
    locationAccessDenied: 'Location access denied. Photos will be uploaded without location data.',
    cameraAccessFailed: 'Failed to access camera. Please check permissions.',
    checkPermissions: 'Please check permissions.',
    cloudinaryNotConfigured: 'Cloudinary not configured! Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file with your actual Cloudinary cloud name.',
    setCloudinaryName: 'Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file with your actual Cloudinary cloud name.',
    
    // Actions
    copy: 'Copy',
    delete: 'Delete',
    view: 'View',
  },
  
  hi: {
    // Header
    appTitle: 'सफाई नागरिक',
    appSubtitle: 'लाइव कैमरा फोटो के साथ मुद्दों की रिपोर्ट करके अपने शहर को साफ बनाने में मदद करें',
    
    // Camera Section
    liveCameraCapture: 'लाइव कैमरा कैप्चर',
    startCamera: 'कैमरा शुरू करें',
    stopCamera: 'कैमरा बंद करें',
    capturePhoto: 'फोटो कैप्चर करें',
    clickToStart: 'शुरू करने के लिए "कैमरा शुरू करें" पर क्लिक करें',
    
    // Photo Management
    capturedPhotos: 'कैप्चर किए गए फोटो',
    selectedPhotos: 'चयनित फोटो',
    photoUploadDashboard: 'फोटो अपलोड डैशबोर्ड',
    clickToSelectPhotos: 'फोटो चुनने के लिए क्लिक करें या खींचें और छोड़ें',
    dragAndDrop: 'खींचें और छोड़ें',
    
    // Description
    description: 'विवरण',
    descriptionOptional: 'विवरण (वैकल्पिक)',
    describeIssue: 'सफाई की समस्या का वर्णन करें...',
    
    // Upload
    uploadPhotos: 'फोटो अपलोड करें',
    uploading: 'अपलोड हो रहा है...',
    uploadSuccess: 'फोटो सफलतापूर्वक अपलोड हो गए!',
    uploadFailed: 'अपलोड विफल। कृपया पुनः प्रयास करें।',
    uploadFailedTryAgain: 'अपलोड विफल। कृपया पुनः प्रयास करें।',
    
    // Status
    uploaded: 'अपलोड हो गया',
    pendingUpload: 'अपलोड लंबित',
    deletePhoto: 'फोटो हटाएं',
    preview: 'पूर्वावलोकन',
    
    // Location
    locationInformation: 'स्थान की जानकारी',
    currentLocation: 'वर्तमान स्थान',
    latitude: 'अक्षांश',
    longitude: 'देशांतर',
    accuracy: 'सटीकता',
    
    // URLs
    uploadedPhotosUrls: 'अपलोड किए गए फोटो और URL',
    copyUrls: 'URL कॉपी करें',
    copyUrl: 'URL कॉपी करें',
    openInNewTab: 'नए टैब में खोलें',
    photoUrlsCopied: 'फोटो URL क्लिपबोर्ड में कॉपी हो गए!',
    noUploadedPhotos: 'कोई अपलोड किए गए फोटो नहीं मिले!',
    
    // Photo Preview Modal
    photoPreview: 'फोटो पूर्वावलोकन',
    captured: 'कैप्चर किया गया',
    status: 'स्थिति',
    cloudinaryUrl: 'क्लाउडिनरी URL',
    close: 'बंद करें',
    
    // Alerts
    locationAccessDenied: 'स्थान की पहुंच से इनकार। फोटो बिना स्थान डेटा के अपलोड होंगे।',
    cameraAccessFailed: 'कैमरा तक पहुंचने में विफल। कृपया अनुमतियों की जांच करें।',
    checkPermissions: 'कृपया अनुमतियों की जांच करें।',
    cloudinaryNotConfigured: 'क्लाउडिनरी कॉन्फ़िगर नहीं है! कृपया अपने .env.local फ़ाइल में NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME सेट करें।',
    setCloudinaryName: 'कृपया अपने .env.local फ़ाइल में NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME सेट करें।',
    
    // Actions
    copy: 'कॉपी',
    delete: 'हटाएं',
    view: 'देखें',
  },
  
  bn: {
    // Header
    appTitle: 'সাফাই নাগরিক',
    appSubtitle: 'লাইভ ক্যামেরা ফটো দিয়ে সমস্যা রিপোর্ট করে আপনার শহরকে পরিষ্কার করতে সাহায্য করুন',
    
    // Camera Section
    liveCameraCapture: 'লাইভ ক্যামেরা ক্যাপচার',
    startCamera: 'ক্যামেরা শুরু করুন',
    stopCamera: 'ক্যামেরা বন্ধ করুন',
    capturePhoto: 'ফটো ক্যাপচার করুন',
    clickToStart: 'শুরু করতে "ক্যামেরা শুরু করুন" ক্লিক করুন',
    
    // Photo Management
    capturedPhotos: 'ক্যাপচার করা ফটো',
    selectedPhotos: 'নির্বাচিত ফটো',
    photoUploadDashboard: 'ফটো আপলোড ড্যাশবোর্ড',
    clickToSelectPhotos: 'ফটো নির্বাচন করতে ক্লিক করুন বা টেনে আনুন',
    dragAndDrop: 'টেনে আনুন',
    
    // Description
    description: 'বিবরণ',
    descriptionOptional: 'বিবরণ (ঐচ্ছিক)',
    describeIssue: 'পরিচ্ছন্নতার সমস্যার বর্ণনা দিন...',
    
    // Upload
    uploadPhotos: 'ফটো আপলোড করুন',
    uploading: 'আপলোড হচ্ছে...',
    uploadSuccess: 'ফটো সফলভাবে আপলোড হয়েছে!',
    uploadFailed: 'আপলোড ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    uploadFailedTryAgain: 'আপলোড ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
    
    // Status
    uploaded: 'আপলোড হয়েছে',
    pendingUpload: 'আপলোড বাকি',
    deletePhoto: 'ফটো মুছুন',
    preview: 'পূর্বরূপ',
    
    // Location
    locationInformation: 'অবস্থানের তথ্য',
    currentLocation: 'বর্তমান অবস্থান',
    latitude: 'অক্ষাংশ',
    longitude: 'দ্রাঘিমাংশ',
    accuracy: 'নির্ভুলতা',
    
    // URLs
    uploadedPhotosUrls: 'আপলোড করা ফটো এবং URL',
    copyUrls: 'URL কপি করুন',
    copyUrl: 'URL কপি করুন',
    openInNewTab: 'নতুন ট্যাবে খুলুন',
    photoUrlsCopied: 'ফটো URL ক্লিপবোর্ডে কপি হয়েছে!',
    noUploadedPhotos: 'কোনো আপলোড করা ফটো পাওয়া যায়নি!',
    
    // Photo Preview Modal
    photoPreview: 'ফটো পূর্বরূপ',
    captured: 'ক্যাপচার করা হয়েছে',
    status: 'অবস্থা',
    cloudinaryUrl: 'ক্লাউডিনারি URL',
    close: 'বন্ধ করুন',
    
    // Alerts
    locationAccessDenied: 'অবস্থান অ্যাক্সেস অস্বীকার। ফটো অবস্থান ডেটা ছাড়াই আপলোড হবে।',
    cameraAccessFailed: 'ক্যামেরা অ্যাক্সেস করতে ব্যর্থ। অনুগ্রহ করে অনুমতি পরীক্ষা করুন।',
    checkPermissions: 'অনুগ্রহ করে অনুমতি পরীক্ষা করুন।',
    cloudinaryNotConfigured: 'ক্লাউডিনারি কনফিগার করা হয়নি! অনুগ্রহ করে আপনার .env.local ফাইলে NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME সেট করুন।',
    setCloudinaryName: 'অনুগ্রহ করে আপনার .env.local ফাইলে NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME সেট করুন।',
    
    // Actions
    copy: 'কপি',
    delete: 'মুছুন',
    view: 'দেখুন',
  },
};

export const getTranslation = (language: Language, key: keyof Translations): string => {
  return translations[language][key] || translations.en[key] || key;
};
