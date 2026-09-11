import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import { extractServiceImages } from '../../utils/imageHelper';

function EditService() {
  const { id, serviceId } = useParams();
  const serviceData = JSON.parse(localStorage.getItem('serviceData')) || {};
  const [formData, setFormData] = useState({
    name: serviceData.name || '',
    description: serviceData.description || '',
    duration: serviceData.duration ? String(serviceData.duration) : '45',
    price: serviceData.price ? String(serviceData.price) : '',
    totalSlots: serviceData.totalSlots ? String(serviceData.totalSlots) : '10',
    business: id || ''
  });

  // Existing image URLs (from backend)
  const initialImages = extractServiceImages(serviceData, null).filter(Boolean);
  const [existingImages, setExistingImages] = useState(initialImages);
  
  // New image files selected by user
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState(null);
  const navigate = useNavigate();

  const durationPresets = ['15', '30', '45', '60', '90', '120'];

  // Verify ownership and load latest service data if needed
  useEffect(() => {
    let ignore = false;
    const verifyAndLoad = async () => {
      try {
        const [bizRes, serviceRes] = await Promise.allSettled([
          apiClient.get('/business/get/user'),
          apiClient.get(`/public/getService/${serviceId}`)
        ]);

        if (ignore) return;

        const myBizData = bizRes.status === 'fulfilled' ? (bizRes.value.data?.data || bizRes.value.data) : null;
        const myBusinessId = myBizData?.id;
        setOwnershipVerified(myBusinessId != null && String(myBusinessId) === String(id));

        const servData = serviceRes.status === 'fulfilled' ? (serviceRes.value.data?.data || serviceRes.value.data) : null;
        if (servData) {
          const s = servData;
          setFormData({
            name: s.name || '',
            description: s.description || '',
            duration: s.duration ? String(s.duration) : '45',
            price: s.price ? String(s.price) : '',
            totalSlots: s.totalSlots ? String(s.totalSlots) : '10',
            business: s.business || id
          });
          const fetchedImages = extractServiceImages(s, null).filter(Boolean);
          setExistingImages(fetchedImages);
        }
      } catch (_) {
        if (!ignore) setOwnershipVerified(false);
      }
    };
    verifyAndLoad();
    return () => { ignore = true; };
  }, [id, serviceId]);

  if (ownershipVerified === null) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (ownershipVerified === false) {
    return <Navigate to="/404" replace />;
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const totalCount = existingImages.length + newImages.length + selectedFiles.length;
    if (totalCount > 15) {
      toast.warn('Maximum 15 photos allowed per service.');
    }

    const combinedFiles = [...newImages, ...selectedFiles].slice(0, 15 - existingImages.length);
    setNewImages(combinedFiles);
    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews(newPreviews);
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    const updatedFiles = newImages.filter((_, idx) => idx !== indexToRemove);
    setNewImages(updatedFiles);
    const updatedPreviews = newImagePreviews.filter((_, idx) => idx !== indexToRemove);
    setNewImagePreviews(updatedPreviews);
  };

  const handleSetExistingAsCover = (index) => {
    if (index === 0) return;
    const target = existingImages[index];
    const rest = existingImages.filter((_, idx) => idx !== index);
    setExistingImages([target, ...rest]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.description || !formData.duration || 
        !formData.price || !formData.totalSlots) {
      setLoading(false);
      toast.warn('Please complete all required fields');
      return;
    }

    try {
      // 1. Update service details and retain current curated existing images
      const cleanedExisting = Array.from(new Set(existingImages.map(u => (typeof u === 'string' ? u.trim() : '')).filter(Boolean)));
      const requestData = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        totalSlots: parseInt(formData.totalSlots),
        business: parseInt(formData.business || id),
        imageUrl: cleanedExisting.length > 0 ? cleanedExisting.join(',') : null
      };
                  
      await apiClient.put(`/services-offered/update/${serviceId}`, requestData);

      // 2. Upload any newly added image files (backend appends to the updated imageUrl)
      if (newImages.length > 0) {
        try {
          const uploadData = new FormData();
          newImages.forEach(imgFile => {
            uploadData.append('files', imgFile);
          });
          await apiClient.put(`/services-offered/uploadFiles/${serviceId}`, uploadData);
        } catch (multiErr) {
          // Fallback to sequential uploads
          for (const img of newImages) {
            try {
              const singleFile = new FormData();
              singleFile.append('file', img);
              await apiClient.put(`/services-offered/uploadFile/${serviceId}`, singleFile);
            } catch (_) {}
          }
        }
      }

      toast.success('Service updated successfully with photos!');
      localStorage.removeItem('serviceData');
      
      setTimeout(() => {
        navigate(`/services/${serviceId}`);
      }, 500);
    } catch (err) {
      showErrorToast(err, 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const totalPhotosCount = existingImages.length + newImages.length;

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            to={`/services/${serviceId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Cancel and Return</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          <div className="border-b border-neutral-border/60 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Service Management
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
                Edit Service Offering
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Update session specifications, pricing, daily capacity, and showcase gallery.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter service name"
                  disabled={loading}
                  required
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your service in detail..."
                  disabled={loading}
                  required
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs text-brand-primary outline-none transition-all resize-none"
                />
                <span className="text-[10px] text-text-secondary mt-1 block">
                  {formData.description.length} characters
                </span>
              </div>

              {/* Duration Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Session Duration (Minutes) *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {durationPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleInputChange('duration', preset)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        formData.duration === preset
                          ? 'bg-brand-primary text-white shadow-2xs'
                          : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="30"
                  min="5"
                  disabled={loading}
                  required
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="500.00"
                    min="0.01"
                    disabled={loading}
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Daily Total Slots *
                  </label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) => handleInputChange('totalSlots', e.target.value)}
                    placeholder="10"
                    min="1"
                    disabled={loading}
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Multi-Image Showcase Management Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-border/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Service Gallery Images ({totalPhotosCount} photos)
                    </label>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Manage existing photos or upload additional treatment pictures.
                    </p>
                  </div>

                  <span className="bg-neutral-background text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-neutral-border flex items-center gap-1.5">
                    <i className="bi bi-images"></i>
                    <span>{totalPhotosCount} Total</span>
                  </span>
                </div>

                {/* Existing Images Grid */}
                {existingImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                        Active Showcase Photos ({existingImages.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setExistingImages([])}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <i className="bi bi-trash"></i>
                        <span>Remove All Photos</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                      {existingImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden border-2 border-neutral-border bg-neutral-background group shadow-2xs hover:border-brand-primary/50 transition-all"
                        >
                          <img
                            src={imgUrl}
                            alt={`Service photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Always-Visible Quick Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-rose-600/95 hover:bg-rose-700 text-white shadow-md flex items-center justify-center text-xs cursor-pointer z-10 transition-transform hover:scale-110 active:scale-95"
                            title="Remove photo from service"
                            aria-label="Remove photo"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>

                          {/* Top Left Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-brand-primary text-brand-secondary text-[8px] font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider z-10">
                              Cover Photo
                            </span>
                          ) : (
                            <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md z-10">
                              #{idx + 1}
                            </span>
                          )}

                          {/* Hover Overlay with Set Cover option */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-2 pointer-events-none">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetExistingAsCover(idx)}
                                className="w-full py-1 rounded-lg bg-brand-primary/95 text-brand-secondary text-[10px] font-bold hover:bg-brand-primary transition-colors cursor-pointer shadow-xs pointer-events-auto"
                              >
                                Set as Cover
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Photos Dropzone */}
                <div className="relative border-2 border-dashed border-neutral-border hover:border-brand-primary/60 rounded-2xl p-4 sm:p-5 bg-neutral-background/40 hover:bg-white text-center transition-all cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="edit-multi-image-upload"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary mx-auto flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                      <i className="bi bi-cloud-arrow-up-fill"></i>
                    </div>
                    <p className="text-xs font-bold text-brand-primary">
                      Click or drag & drop to add more photos (select multiple files)
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Supports PNG, JPG, WebP. You can delete or reorder any photo anytime.
                    </p>
                  </div>
                </div>

                {/* New Images Previews */}
                {newImagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Newly Added ({newImagePreviews.length}) – Will be uploaded when you save
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                      {newImagePreviews.map((preview, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400/80 bg-neutral-background group shadow-2xs"
                        >
                          <img src={preview} alt={`New upload ${pIdx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Always-Visible Quick Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(pIdx)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-rose-600/95 hover:bg-rose-700 text-white shadow-md flex items-center justify-center text-xs cursor-pointer z-10 transition-transform hover:scale-110 active:scale-95"
                            title="Remove newly added photo"
                            aria-label="Remove photo"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>

                          <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider z-10">
                            New
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-border/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/services/${serviceId}`)}
                disabled={loading}
                className="px-6 py-3 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving Changes & Uploading Photos...</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditService;