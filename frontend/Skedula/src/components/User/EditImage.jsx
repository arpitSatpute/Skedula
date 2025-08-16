import React, { useState, useRef } from 'react';

function EditImage({ onImageSelect, currentImage, onCancel }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
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

  // Handle upload
  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    
    try {
      await onImageSelect(selectedImage);
      
      // Reset form after successful upload
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      // Don't close the modal on error, let user try again
    } finally {
      setLoading(false);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(currentImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
         style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-gradient text-white border-0 rounded-top-4" 
                   style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-image me-2"></i>
                    Edit Profile Picture
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={onCancel}
                    disabled={loading}
                  ></button>
                </div>
              </div>
              
              <div className="card-body p-4">
                {/* Current/Preview Image */}
                {previewUrl && (
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="rounded-circle border border-3 border-light shadow-sm"
                        style={{
                          width: '150px', 
                          height: '150px', 
                          objectFit: 'cover'
                        }}
                      />
                      {selectedImage && (
                        <span className="position-absolute top-0 end-0 bg-success rounded-circle border border-3 border-white d-flex align-items-center justify-content-center" 
                              style={{width: '40px', height: '40px', transform: 'translate(25%, -25%)'}}>
                          <i className="bi bi-check-lg text-white"></i>
                        </span>
                      )}
                    </div>
                    <p className="text-muted mt-2 small">
                      {selectedImage ? 'New image selected' : 'Current profile picture'}
                    </p>
                  </div>
                )}

                {/* Drag and Drop Area */}
                <div 
                  className={`border-2 border-dashed rounded-3 p-4 text-center mb-4 ${
                    isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ minHeight: '200px', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="d-flex flex-column align-items-center justify-content-center h-100">
                    <i className={`bi bi-cloud-upload fs-1 mb-3 ${isDragging ? 'text-primary' : 'text-secondary'}`}></i>
                    <h6 className="fw-semibold mb-2">
                      {isDragging ? 'Drop your image here' : 'Choose or drag an image'}
                    </h6>
                    <p className="text-muted small mb-3">
                      Drag and drop an image here, or click to browse
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <i className="bi bi-folder2-open me-1"></i>
                      Browse Files
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {/* Selected File Info */}
                {selectedImage && (
                  <div className="alert alert-success border-0 bg-success bg-opacity-10 mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-image me-2"></i>
                      <div className="flex-grow-1">
                        <strong>{selectedImage.name}</strong>
                        <br />
                        <small className="text-muted">
                          Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleClear}
                        title="Remove selected image"
                        disabled={loading}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-3 justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancel
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!selectedImage || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-1"></i>
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditImage;