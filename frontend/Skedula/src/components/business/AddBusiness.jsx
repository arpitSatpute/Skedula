import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';
import { BUSINESS_CATEGORIES } from '../../constants/categories';
import { showErrorToast } from '../../utils/errorHandler';

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
    category: 'Spa & Wellness',
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
    latitude: '',
    longitude: '',
    cancellationCutoffMinutes: 120,
    cancellationFeePercentage: 20,
    identity: '',
    crnnumber: '',
    gstnumber: '',
    openTime: '09:00',
    closeTime: '19:00'
  });

  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (!isEdit || !id) return;

    const loadBusinessData = async () => {
      setIsLoadingBusiness(true);
      try {
        let businessData = null;
        const storedBusiness = sessionStorage.getItem('editBusiness');
        if (storedBusiness && storedBusiness !== 'null') {
          try {
            businessData = JSON.parse(storedBusiness);
          } catch (_) {}
        }

        if (!businessData) {
          try {
            const userBizRes = await apiClient.get('/business/get/user');
            businessData = userBizRes.data?.data || userBizRes.data;
          } catch (_) {
            try {
              const pubBizRes = await apiClient.get(`/public/getBusiness/${id}`);
              businessData = pubBizRes.data?.data || pubBizRes.data;
            } catch (err) {
              console.error('Failed to load business from remote:', err);
            }
          }
        }

        if (!ignore && businessData) {
          setFormData({
            name: businessData.name || '',
            category: businessData.category || 'Spa & Wellness',
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
            latitude: businessData.latitude !== undefined && businessData.latitude !== null ? String(businessData.latitude) : '',
            longitude: businessData.longitude !== undefined && businessData.longitude !== null ? String(businessData.longitude) : '',
            cancellationCutoffMinutes: businessData.cancellationCutoffMinutes !== undefined && businessData.cancellationCutoffMinutes !== null ? businessData.cancellationCutoffMinutes : 120,
            cancellationFeePercentage: businessData.cancellationFeePercentage !== undefined && businessData.cancellationFeePercentage !== null ? businessData.cancellationFeePercentage : 20,
            identity: businessData.identity || '',
            crnnumber: businessData.crnnumber || businessData.CRNNumber || '',
            gstnumber: businessData.gstnumber || businessData.GSTNumber || '',
            openTime: businessData.openTime ? String(businessData.openTime).slice(0, 5) : '09:00',
            closeTime: businessData.closeTime ? String(businessData.closeTime).slice(0, 5) : '19:00'
          });
        }
      } catch (error) {
        if (!ignore) {
          showErrorToast(error, 'Failed to load business details');
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
      category: 'Spa & Wellness',
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
      latitude: '12.9784',
      longitude: '77.6408',
      cancellationCutoffMinutes: 120,
      cancellationFeePercentage: 20,
      identity: 'ID-BLR-8921',
      crnnumber: 'CRN-7890124',
      gstnumber: '29ABCDE1234F1Z5',
      openTime: '09:30',
      closeTime: '20:00'
    });
    toast.info('Sample business profile populated!');
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.warn('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success(`Coordinates detected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setDetectingGps(false);
      },
      (error) => {
        toast.error('Could not detect location: ' + error.message);
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

    const payload = {
      ...formData,
      latitude: formData.latitude !== '' && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : null,
      cancellationCutoffMinutes: formData.cancellationCutoffMinutes !== '' ? Number(formData.cancellationCutoffMinutes) : 120,
      cancellationFeePercentage: formData.cancellationFeePercentage !== '' ? Number(formData.cancellationFeePercentage) : 20.0,
      CRNNumber: formData.crnnumber,
      crnnumber: formData.crnnumber,
      GSTNumber: formData.gstnumber,
      gstnumber: formData.gstnumber
    };

    try {
      if (!isEdit) {
        const response = await apiClient.post(`/business/register`, payload);
        if (!ignore) {
          if (response.status === 200 || response.status === 201) {
            toast.success('Business registered successfully!');
            navigate('/businesses');
          }
        }
      } else {
        const response = await apiClient.put(`/business/update/${id}`, payload);
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
        showErrorToast(error, 'Failed to save business');
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
          <p className="text-xs text-text-secondary">Please sign in as a Business Owner to register your business.</p>
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Primary Service Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all cursor-pointer"
                  >
                    {BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                  <i className="bi bi-geo-alt text-brand-primary"></i>
                  <span>Location & Geolocation Coordinates</span>
                </h3>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps || loading}
                  className="bg-brand-secondary/40 hover:bg-brand-secondary text-brand-primary border border-brand-primary/20 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 w-fit cursor-pointer shadow-2xs"
                >
                  <i className={`bi ${detectingGps ? 'bi-arrow-repeat animate-spin' : 'bi-crosshair'}`}></i>
                  <span>{detectingGps ? 'Detecting GPS...' : 'Auto-Detect Current GPS Coordinates'}</span>
                </button>
              </div>

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

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Latitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="e.g. 12.9784"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-mono font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Longitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="e.g. 77.6408"
                    disabled={loading}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-mono font-semibold text-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
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
              <p className="text-[11px] text-text-secondary">
                <i className="bi bi-info-circle me-1 text-brand-primary"></i>
                Coordinates enable real-time distance sorting and "Near Me" radius filters for customers in your neighborhood.
              </p>
            </div>

            <hr className="border-neutral-border/60" />

            {/* 3. Cancellation Policy & Terms */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <i className="bi bi-shield-lock text-brand-primary"></i>
                <span>Cancellation Policy & Escrow Guarantee</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Cutoff Minutes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Cancellation Window (Minutes)
                    </label>
                    <span className="text-xs font-bold text-brand-primary">
                      {Math.floor(formData.cancellationCutoffMinutes / 60)}h {formData.cancellationCutoffMinutes % 60 > 0 ? `${formData.cancellationCutoffMinutes % 60}m` : ''} before booking
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={formData.cancellationCutoffMinutes}
                    onChange={(e) => handleInputChange('cancellationCutoffMinutes', e.target.value)}
                    disabled={loading}
                    placeholder="120"
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: '1 Hour', val: 60 },
                      { label: '2 Hours (Standard)', val: 120 },
                      { label: '4 Hours', val: 240 },
                      { label: '12 Hours', val: 720 },
                      { label: '24 Hours', val: 1440 }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handleInputChange('cancellationCutoffMinutes', preset.val)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          Number(formData.cancellationCutoffMinutes) === preset.val
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-neutral-background hover:bg-neutral-border/60 text-brand-primary border-neutral-border/70'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Late Cancellation Fee (%)
                    </label>
                    <span className="text-xs font-bold text-brand-primary">
                      {formData.cancellationFeePercentage}% deducted
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.cancellationFeePercentage}
                    onChange={(e) => handleInputChange('cancellationFeePercentage', e.target.value)}
                    disabled={loading}
                    placeholder="20"
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                  />
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: '0% (Full Refund)', val: 0 },
                      { label: '10%', val: 10 },
                      { label: '20% (Default)', val: 20 },
                      { label: '30%', val: 30 },
                      { label: '50%', val: 50 }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handleInputChange('cancellationFeePercentage', preset.val)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          Number(formData.cancellationFeePercentage) === preset.val
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-neutral-background hover:bg-neutral-border/60 text-brand-primary border-neutral-border/70'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Policy Preview Card */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                <i className="bi bi-shield-check text-emerald-700 text-lg shrink-0 mt-0.5"></i>
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold">Customer Guarantee Policy Preview:</p>
                  <p className="leading-relaxed text-emerald-900/90">
                    Cancellations initiated more than <strong>{Math.floor(formData.cancellationCutoffMinutes / 60)} hours</strong> before the scheduled appointment will receive a <strong>100% instant refund</strong> to their wallet.
                    Cancellations made within {Math.floor(formData.cancellationCutoffMinutes / 60)} hours will incur a <strong>{formData.cancellationFeePercentage}% late cancellation fee</strong> (customer receives {100 - Number(formData.cancellationFeePercentage)}% refund).
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-neutral-border/60" />

            {/* 4. Legal & Compliance */}
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

            {/* 5. Operating Schedule */}
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