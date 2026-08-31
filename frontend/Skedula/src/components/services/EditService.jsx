import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

function EditService() {
  const { id, serviceId } = useParams();
  const serviceData = JSON.parse(localStorage.getItem('serviceData')) || {};
  const [service] = useState(serviceData);
  const [formData, setFormData] = useState({
    name: service.name || '',
    description: service.description || '',    
    duration: service.duration || '45',
    price: service.price || '',
    totalSlots: service.totalSlots || '10',
    business: id || ''
  });
  const [loading, setLoading] = useState(false);
  // null = still checking, true = owner confirmed, false = unauthorized
  const [ownershipVerified, setOwnershipVerified] = useState(null);
  const navigate = useNavigate();

  // Verify that the id in the URL matches the owner's own business before
  // allowing access. This prevents URL-manipulation attacks such as
  // /services/edit/999/123 where 999 is another owner's business.
  useEffect(() => {
    let ignore = false;
    const verifyOwnership = async () => {
      try {
        const res = await apiClient.get('/business/get/user');
        const myBusinessId = res.data?.data?.id;
        if (!ignore) {
          // Convert both to strings for a safe comparison (URL param is a string)
          setOwnershipVerified(myBusinessId != null && String(myBusinessId) === String(id));
        }
      } catch (_) {
        if (!ignore) setOwnershipVerified(false);
      }
    };
    verifyOwnership();
    return () => { ignore = true; };
  }, [id]);

  // Still verifying — show a spinner
  if (ownershipVerified === null) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not the owner of this business — redirect to 404
  if (ownershipVerified === false) {
    return <Navigate to="/404" replace />;
  }



  const durationPresets = ['15', '30', '45', '60', '90', '120'];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      const requestData = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        totalSlots: parseInt(formData.totalSlots),
        business: formData.business
      };
                  
      await apiClient.put(`/services-offered/update/${serviceId}`, requestData);
      toast.info('Service updated successfully!');
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

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-3xl space-y-8">
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
          <div className="border-b border-neutral-border/60 pb-6">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Service Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
              Edit Service Offering
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Update session parameters, rates, slot limits, or client instructions.
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
                    <span>Updating Service...</span>
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