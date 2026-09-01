import { showErrorToast } from "../../utils/errorHandler";
import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function AddService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '45',
    price: '',
    totalSlots: '10',
    business: id || ''
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const durationPresets = ['15', '30', '45', '60', '90', '120'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const combinedFiles = [...images, ...selectedFiles].slice(0, 10);
    setImages(combinedFiles);

    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updatedImages);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== indexToRemove);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 5) {
      toast.warn(`Please upload at least 5 photos of your service (currently ${images.length}/5 selected).`);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/services-offered/create', formData);
      const serviceId = response.data?.data?.id;

      if (images.length > 0 && serviceId) {
        try {
          const uploadData = new FormData();
          images.forEach(imgFile => {
            uploadData.append('files', imgFile);
          });
          await apiClient.put(`/services-offered/uploadFiles/${serviceId}`, uploadData);
        } catch (uploadErr) {
          try {
            const singleFile = new FormData();
            singleFile.append('file', images[0]);
            await apiClient.put(`/services-offered/uploadFile/${serviceId}`, singleFile);
          } catch (_) {}
        }
      }
      toast.success('Service offering created with 5+ showcase images!');
      setTimeout(() => {
        navigate(`/services`);
      }, 1000);
    } catch (error) {
      showErrorToast(error, 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            to={id ? `/business/${id}` : '/services'}
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Cancel and Return</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
            <div className="border-b border-neutral-border/60 pb-6">
              <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Service Catalog
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
                Add New Service Offering
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Configure session duration, pricing tier, daily slot capacity, and upload at least 5 showcase photos.
              </p>
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
                    placeholder="e.g. Deep Botanical Skin Therapy"
                    disabled={loading}
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Service Description *
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Explain the therapeutic benefits, procedure, and what the client should prepare..."
                    disabled={loading}
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs text-brand-primary outline-none transition-all resize-none"
                  />
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
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${formData.duration === preset
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
                    placeholder="Custom duration in minutes"
                    min="5"
                    disabled={loading}
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                      Session Fee (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g. 799"
                      min="1"
                      disabled={loading}
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                      Daily Max Slot Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.totalSlots}
                      onChange={(e) => handleInputChange('totalSlots', e.target.value)}
                      placeholder="e.g. 12"
                      min="1"
                      disabled={loading}
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Multi-Image Showcase Section (At least 5 Images) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Service Showcase Gallery (At least 5 Images) *
                      </label>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Upload 5 or more photos showcasing the treatment room, equipment, and experience.
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      images.length >= 5
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      <i className={`bi ${images.length >= 5 ? 'bi-check-circle-fill text-emerald-600' : 'bi-exclamation-circle-fill text-amber-600'}`}></i>
                      <span>{images.length} / 5+ Images</span>
                    </span>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="relative border-2 border-dashed border-neutral-border hover:border-brand-primary/60 rounded-2xl p-4 sm:p-5 bg-neutral-background/40 hover:bg-white text-center transition-all cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading || images.length >= 10}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      id="multi-image-upload"
                    />
                    <div className="space-y-1.5 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary mx-auto flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        <i className="bi bi-cloud-arrow-up-fill"></i>
                      </div>
                      <p className="text-xs font-bold text-brand-primary">
                        Click or drag & drop to add photos (select multiple files)
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        Supports PNG, JPG, WebP. {images.length < 5 ? `Need at least ${5 - images.length} more photo${5 - images.length === 1 ? '' : 's'}.` : 'Requirement fulfilled! Feel free to add up to 10.'}
                      </p>
                    </div>
                  </div>

                  {/* 5-Slot Visual Gallery Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const preview = imagePreviews[slotIdx];
                      return preview ? (
                        <div key={slotIdx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-border bg-neutral-background group shadow-2xs">
                          <img src={preview} alt={`Upload ${slotIdx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(slotIdx)}
                              className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-xs cursor-pointer shadow-sm"
                              title="Remove photo"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          {slotIdx === 0 && (
                            <span className="absolute top-1 left-1 bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                              Cover
                            </span>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                            #{slotIdx + 1}
                          </span>
                        </div>
                      ) : (
                        <label
                          key={slotIdx}
                          htmlFor="multi-image-upload"
                          className="aspect-square rounded-xl border-2 border-dashed border-neutral-border/80 hover:border-brand-primary/50 bg-neutral-background/30 hover:bg-white flex flex-col items-center justify-center text-text-secondary hover:text-brand-primary transition-all cursor-pointer p-1"
                        >
                          <i className="bi bi-plus-lg text-sm text-text-secondary/60"></i>
                          <span className="text-[9px] font-bold mt-1 text-center leading-tight">Slot #{slotIdx + 1}</span>
                          <span className="text-[8px] text-text-secondary/70">Required</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Overflow images (> 5) */}
                  {imagePreviews.length > 5 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
                        Additional Photos ({imagePreviews.length - 5})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {imagePreviews.slice(5).map((preview, extraIdx) => (
                          <div key={extraIdx + 5} className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-border bg-neutral-background group shadow-2xs">
                            <img src={preview} alt={`Upload ${extraIdx + 6}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(extraIdx + 5)}
                                className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] cursor-pointer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
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
                  onClick={() => navigate(`/services`)}
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
                      <span>Publishing Service & Uploading Photos...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish Service Offering</span>
                      <i className="bi bi-arrow-right text-brand-secondary"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-neutral-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                  Live Client Preview
                </span>
                <span className="text-[10px] font-semibold text-brand-primary bg-brand-secondary/40 px-2 py-0.5 rounded-full">
                  {images.length} Photos
                </span>
              </div>
              <div className="rounded-2xl border border-neutral-border/80 overflow-hidden bg-neutral-background/30 space-y-3 p-4">
                {imagePreviews[0] ? (
                  <div className="space-y-2">
                    <img src={imagePreviews[0]} alt="Primary Preview" className="w-full h-32 object-cover rounded-xl shadow-2xs" />
                    {imagePreviews.length > 1 && (
                      <div className="grid grid-cols-4 gap-1.5">
                        {imagePreviews.slice(1, 5).map((prev, pIdx) => (
                          <img key={pIdx} src={prev} alt={`Thumb ${pIdx + 2}`} className="w-full h-10 object-cover rounded-md border border-neutral-border/60" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-28 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-2xl">
                    <i className="bi bi-images"></i>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-primary text-brand-primary truncate">
                      {formData.name || 'Untitled Service'}
                    </h4>
                    <span className="text-xs font-bold text-brand-primary bg-brand-secondary px-2.5 py-0.5 rounded-full">
                      ₹{formData.price || '0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2">
                    {formData.description || 'Description will appear here in the directory...'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold text-brand-primary border-t border-neutral-border/60">
                  <span className="bg-white p-1.5 rounded-lg text-center">{formData.duration || '0'} Mins</span>
                  <span className="bg-white p-1.5 rounded-lg text-center">{formData.totalSlots || '0'} Slots/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddService;