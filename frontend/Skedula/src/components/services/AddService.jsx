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

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const durationPresets = ['15', '30', '45', '60', '90', '120'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post('/services-offered/create', formData);

      if (image && response.data?.data?.id) {
        try {
          const file = new FormData();
          file.append('file', image);
          await apiClient.put(`/services-offered/uploadFile/${response.data.data.id}`, file);
        } catch (error) {
          // silent error for image upload
        }
      }
      toast.success('Service offering created successfully!');
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
                Configure session duration, pricing tier, daily slot capacity, and cover imagery.
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-primary file:text-white hover:file:bg-brand-dark file:cursor-pointer"
                  />
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
                      <span>Publishing Service...</span>
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-2">
                Live Client Preview
              </span>
              <div className="rounded-2xl border border-neutral-border/80 overflow-hidden bg-neutral-background/30 space-y-3 p-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-28 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-2xl">
                    <i className="bi bi-image"></i>
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