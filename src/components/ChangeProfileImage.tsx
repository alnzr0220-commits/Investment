import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader } from 'lucide-react';
import { api } from '../api';

interface ChangeProfileImageProps {
  currentImage: string;
  onClose: () => void;
  onSuccess: (newImageUrl: string) => void;
}

export const ChangeProfileImage: React.FC<ChangeProfileImageProps> = ({ 
  currentImage, 
  onClose, 
  onSuccess 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملف صورة صحيح');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setCustomUrl(url);
    setPreviewUrl(url);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      let imageUrl = '';

      if (uploadMethod === 'file' && selectedFile) {
        // Upload file
        const uploadResult = await api.uploadImage(selectedFile);
        imageUrl = uploadResult.imageUrl;
      } else if (uploadMethod === 'url' && customUrl) {
        // Use custom URL
        imageUrl = customUrl;
      } else {
        throw new Error('يرجى اختيار صورة أو إدخال رابط');
      }

      // Update profile image
      await api.updateProfileImage(token, imageUrl);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess(imageUrl);
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحديث الصورة');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              تم تحديث الصورة بنجاح
            </h3>
            <p className="text-sm text-gray-500">
              سيتم إغلاق هذه النافذة تلقائياً...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">تغيير الصورة الشخصية</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Image */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <img
              src={currentImage}
              alt="الصورة الحالية"
              className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
            />
            <div className="absolute bottom-0 right-0 bg-gray-600 rounded-full p-1">
              <Camera className="h-3 w-3 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">الصورة الحالية</p>
        </div>

        {/* Upload Method Selection */}
        <div className="mb-4">
          <div className="flex space-x-4 space-x-reverse">
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Upload className="h-4 w-4 inline ml-2" />
              رفع ملف
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadMethod === 'url'
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Camera className="h-4 w-4 inline ml-2" />
              رابط صورة
            </button>
          </div>
        </div>

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                اضغط لاختيار صورة
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF حتى 5MB
              </p>
            </button>
          </div>
        )}

        {/* URL Input */}
        {uploadMethod === 'url' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الصورة
            </label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="mb-4 text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">معاينة الصورة الجديدة:</p>
            <img
              src={previewUrl}
              alt="معاينة"
              className="h-20 w-20 rounded-full object-cover border-4 border-indigo-200 mx-auto"
              onError={() => {
                setError('لا يمكن تحميل الصورة من هذا الرابط');
                setPreviewUrl('');
              }}
            />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={handleSubmit}
            disabled={loading || (!selectedFile && !customUrl)}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-4 w-4 ml-2" />
                جاري التحديث...
              </>
            ) : (
              'تحديث الصورة'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};