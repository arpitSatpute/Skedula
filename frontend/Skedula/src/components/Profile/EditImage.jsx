import React, { useState, useRef } from 'react';

function EditImage({ onImageSelect, currentImage, onCancel }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }
    setLoading(true);
    try {
      await onImageSelect(selectedImage);
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(currentImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-neutral-border shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
          <div>
            <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Avatar Configuration
            </span>
            <h3 className="text-xl font-bold font-primary text-brand-primary mt-1">
              Update Profile Picture
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-text-secondary flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current / Preview Image */}
        {previewUrl && (
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-card mx-auto"
              />
              {selectedImage && (
                <span className="absolute top-0 right-0 bg-brand-secondary text-brand-primary rounded-full p-1 border-2 border-white shadow-xs">
                  <i className="bi bi-check-lg text-xs"></i>
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-text-secondary mt-2">
              {selectedImage ? 'Selected preview' : 'Current profile photo'}
            </p>
          </div>
        )}

        {/* Drag & Drop Box */}
        <div
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-primary bg-brand-secondary/20'
              : 'border-neutral-border hover:border-brand-primary/60 bg-neutral-background/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl">
              <i className="bi bi-cloud-arrow-up"></i>
            </div>
            <p className="text-xs font-bold text-brand-primary">
              {isDragging ? 'Drop your image here' : 'Choose or drag a photo'}
            </p>
            <p className="text-[11px] text-text-secondary">
              PNG, JPG or WebP up to 5MB
            </p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {selectedImage && (
          <div className="flex items-center justify-between p-3 bg-neutral-background rounded-2xl border border-neutral-border text-xs">
            <div className="truncate mr-2">
              <p className="font-bold text-brand-primary truncate">{selectedImage.name}</p>
              <p className="text-[10px] text-text-secondary">
                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleClear}
              disabled={loading}
              className="text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedImage || loading}
            className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>Save Avatar</span>
                <i className="bi bi-arrow-right text-brand-secondary"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditImage;