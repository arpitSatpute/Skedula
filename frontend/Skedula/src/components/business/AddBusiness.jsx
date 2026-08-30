import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function AddBusiness() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getCurrentUser = () => {
    if (user) return user;
    try {
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      if (storedUser) {
        return JSON.parse(storedUser);
      } else if (userRole) {
        return { email: 'user@example.com', role: userRole, name: 'User' };
      }
      return null;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    businessId: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    mapLink: '',
    identity: '',
    crnnumber: '',
    gstnumber: '',
    openTime: '09:00',
    closeTime: '19:00'
  });

  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (!isEdit || !id) return;

    const loadBusinessData = async () => {
      setIsLoadingBusiness(true);
      try {
        const storedBusiness = sessionStorage.getItem('editBusiness');
        if (storedBusiness && storedBusiness !== 'null') {
          const businessData = JSON.parse(storedBusiness);
          setFormData({
            name: businessData.name || '',
            businessId: businessData.businessId || '',
            description: businessData.description || '',
            email: businessData.email || '',
            phone: businessData.phone || '',
            address: businessData.address || '',
            city: businessData.city || '',
            state: businessData.state || '',
            country: businessData.country || 'India',
            zipCode: businessData.zipCode || '',
            mapLink: businessData.mapLink || '',
            identity: businessData.identity || '',
            crnnumber: businessData.crnnumber || '',
            gstnumber: businessData.gstnumber || '',
            openTime: businessData.openTime || '09:00',
            closeTime: businessData.closeTime || '19:00'
          });
          sessionStorage.removeItem('editBusiness');
        } else {
          const response = await apiClient.get(`/business/get/${id}`);
          if (!ignore) {
            const businessData = response.data.data;
            setFormData({
              name: businessData.name || '',
              businessId: businessData.businessId || '',
              description: businessData.description || '',
              email: businessData.email || '',
              phone: businessData.phone || '',
              address: businessData.address || '',
              city: businessData.city || '',
              state: businessData.state || '',
              country: businessData.country || 'India',
              zipCode: businessData.zipCode || '',
              mapLink: businessData.mapLink || '',
              identity: businessData.identity || '',
              crnnumber: businessData.crnnumber || '',
              gstnumber: businessData.gstnumber || '',
              openTime: businessData.openTime || '09:00',
              closeTime: businessData.closeTime || '19:00'
            });
          }
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error.response?.data?.error?.message || 'Failed to load business');
        }
      } finally {
        if (!ignore) setIsLoadingBusiness(false);
      }
    };

    const timeoutId = setTimeout(loadBusinessData, 100);
    return () => {
      clearTimeout(timeoutId);
      ignore = true;
    };
  }, [id, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAutoFillSample = () => {
    setFormData({
      name: 'Aura Wellness & Aesthetics Sanctuary',
      description: 'Holistic skin therapies, restorative wellness treatments, and clinical consultations by certified experts.',
      email: currentUser?.email || 'contact@aurawellness.com',
      phone: '+91 98201 54321',
      businessId: 'AURA-IND-' + Math.floor(1000 + Math.random() * 9000),
      address: 'Suite 402, Green Boulevard, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560038',
      mapLink: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
      identity: 'ID-BLR-8921',
      crnnumber: 'CRN-7890124',
      gstnumber: '29ABCDE1234F1Z5',
      openTime: '09:30',
      closeTime: '20:00'
    });
    toast.info('Sample business profile populated!');
  };

  const handleSubmit = async (e) => {
    let ignore = false;
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.description || 
        !formData.identity || !formData.crnnumber || !formData.gstnumber || 
        !formData.openTime || !formData.closeTime) {
      setLoading(false);
      toast.warn('Please fill in all required fields marked with *');
      return;
    }

    try {
      if (!isEdit) {
        const response = await apiClient.post(`/business/register`, formData);
        if (!ignore) {
          if (response.status === 200 || response.status === 201) {
            toast.success('Business registered successfully!');
            navigate('/businesses');
          }
        }
      } else {
        const response = await apiClient.put(`/business/update/${id}`, formData);
        if (!ignore) {
          if (response.status === 200) {
            toast.success('Business updated successfully!');
            sessionStorage.removeItem('editBusiness');
            navigate('/businesses');
          }
        }
      }
    } catch (error) {
      if (!ignore) {
        toast.error(error.response?.data?.error?.message || 'Failed to save business');
      }
    } finally {
      if (!ignore) setLoading(false);
    }
    return () => {
      ignore = true;
    };
  };

  if (!currentUser) {
    return (
      <div className="py-20 px-6 min-h-[70vh] flex items-center justify-center bg-mesh-subtle">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border border-neutral-border shadow-card space-y-4">
          <h4 className="text-xl font-bold font-primary text-brand-primary">Owner Portal Required</h4>
          <p className="text-xs text-text-secondary">Please sign in as a Business Owner to register your enterprise sanctuary.</p>
          <button 
            className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm cursor-pointer"
            onClick={() => navigate('/login?role=owner')}
          >
            Sign In as Business Owner
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingBusiness) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Breadcrumb & Auto-Fill Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Cancel and Return</span>
          </Link>

          {!isEdit && (
            <button
              type="button"
              onClick={handleAutoFillSample}
              className="bg-brand-secondary/40 text-brand-primary border border-brand-primary/20 hover:bg-brand-secondary px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <i className="bi bi-magic"></i>
              <span>Auto-Fill Sample Data</span>
            </button>
          )}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          <div className="border-b border-neutral-border/60 pb-6">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {isEdit ? 'Update Venue' : 'Business Registration Wizard'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
              {isEdit ? 'Edit Business Information' : 'Register Your Business Profile'}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Provide accurate contact, location, legal compliance, and operating schedule details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. General Business Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <i className="bi bi-building text-brand-primary"></i>
                <span>General Business Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="e.g. Apex Wellness Spa"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="contact@business.com"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Business Description *
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    placeholder="Describe your services, specialties, and client experience..."
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs text-brand-primary outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <hr className="border-neutral-border/60" />

            {/* 2. Location Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <i className="bi bi-geo-alt text-brand-primary"></i>
                <span>Location & Map Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Suite / Street address"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP Code"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={formData.mapLink}
                    onChange={(e) => handleInputChange('mapLink', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-neutral-border/60" />

            {/* 3. Legal & Compliance */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <i className="bi bi-shield-check text-brand-primary"></i>
                <span>Legal & Verification Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Owner Identity Code *
                  </label>
                  <input
                    type="text"
                    value={formData.identity}
                    onChange={(e) => handleInputChange('identity', e.target.value)}
                    required
                    disabled={isEdit || loading}
                    placeholder="e.g. ID-8921"
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-mono font-semibold text-brand-primary outline-none transition-all disabled:opacity-60"
                  />
                  {isEdit && (
                    <span className="text-[10px] text-text-secondary mt-1 block">Locked after creation</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    CRN Number *
                  </label>
                  <input
                    type="text"
                    value={formData.crnnumber}
                    onChange={(e) => handleInputChange('crnnumber', e.target.value)}
                    required
                    disabled={isEdit || loading}
                    placeholder="e.g. CRN-48921"
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-mono font-semibold text-brand-primary outline-none transition-all disabled:opacity-60"
                  />
                  {isEdit && (
                    <span className="text-[10px] text-text-secondary mt-1 block">Locked after creation</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    value={formData.gstnumber}
                    onChange={(e) => handleInputChange('gstnumber', e.target.value)}
                    required
                    disabled={isEdit || loading}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-mono font-semibold text-brand-primary outline-none transition-all disabled:opacity-60"
                  />
                  {isEdit && (
                    <span className="text-[10px] text-text-secondary mt-1 block">Locked after creation</span>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-neutral-border/60" />

            {/* 4. Operating Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <i className="bi bi-clock-history text-brand-primary"></i>
                <span>Operating Schedule</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Opening Time *
                  </label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => handleInputChange('openTime', e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Closing Time *
                  </label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => handleInputChange('closeTime', e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-6 border-t border-neutral-border/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/businesses')}
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
                    <span>{isEdit ? 'Updating Business...' : 'Creating Business...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isEdit ? 'Save Changes' : 'Publish Business Profile'}</span>
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

export default AddBusiness;