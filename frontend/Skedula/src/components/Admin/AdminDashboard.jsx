import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW', 'BUSINESSES', 'SERVICES', 'USERS'
  const [loading, setLoading] = useState(true);

  // Analytics
  const [analytics, setAnalytics] = useState(null);

  // Businesses
  const [businesses, setBusinesses] = useState([]);
  const [bizStatusFilter, setBizStatusFilter] = useState('ALL');
  const [bizSearch, setBizSearch] = useState('');

  // Services
  const [services, setServices] = useState([]);
  const [srvStatusFilter, setSrvStatusFilter] = useState('ALL');

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Escrow Vault
  const [escrowSummary, setEscrowSummary] = useState({
    totalEscrowBalance: 0,
    totalReleasedToBusinesses: 0,
    totalRefundedToCustomers: 0,
    totalPlatformFeesEarned: 0,
    activeHoldsCount: 0,
    ledger: []
  });
  const [escrowStatusFilter, setEscrowStatusFilter] = useState('ALL');
  const [escrowSearch, setEscrowSearch] = useState('');

  // Bootstrap Admin tool
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapping, setBootstrapping] = useState(false);

  // Load All Admin Data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, bizRes, srvRes, usersRes, escrowRes] = await Promise.allSettled([
        apiClient.get('/api/v1/admin/analytics'),
        apiClient.get(`/api/v1/admin/businesses?status=${bizStatusFilter}&search=${encodeURIComponent(bizSearch)}`),
        apiClient.get(`/api/v1/admin/services?status=${srvStatusFilter}`),
        apiClient.get('/api/v1/admin/users'),
        apiClient.get('/api/v1/admin/escrow')
      ]);

      if (analyticsRes.status === 'fulfilled') {
        const raw = analyticsRes.value.data;
        setAnalytics(raw?.data || raw || null);
      }
      if (bizRes.status === 'fulfilled') {
        const raw = bizRes.value.data;
        setBusinesses(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      }
      if (srvRes.status === 'fulfilled') {
        const raw = srvRes.value.data;
        setServices(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      }
      if (usersRes.status === 'fulfilled') {
        const raw = usersRes.value.data;
        setUsers(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      }
      if (escrowRes.status === 'fulfilled') {
        const raw = escrowRes.value.data;
        setEscrowSummary(raw?.data || raw || {});
      }
    } catch (err) {
      toast.error('Failed to load administrative control center');
    } finally {
      setLoading(false);
    }
  }, [bizStatusFilter, bizSearch, srvStatusFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Business Actions
  const handleApproveBusiness = async (id) => {
    try {
      await apiClient.put(`/api/v1/admin/business/${id}/approve`);
      toast.success('Business activated & approved for public booking!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to approve business');
    }
  };

  const handleLockBusiness = async (id) => {
    if (!window.confirm('Suspending this business will cancel and refund all active client appointments. Continue?')) {
      return;
    }
    try {
      await apiClient.put(`/api/v1/admin/business/${id}/lock`);
      toast.warn('Business suspended. All pending and booked appointments refunded.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to suspend business');
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this business record?')) {
      return;
    }
    try {
      await apiClient.delete(`/api/v1/admin/business/${id}`);
      toast.success('Business permanently removed from registry.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete business');
    }
  };

  // Service Actions
  const handleLockService = async (id) => {
    try {
      await apiClient.put(`/api/v1/admin/service/${id}/lock`);
      toast.warn('Service locked. Active bookings cancelled.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to lock service');
    }
  };

  const handleUnlockService = async (id) => {
    try {
      await apiClient.put(`/api/v1/admin/service/${id}/unlock`);
      toast.success('Service marked AVAILABLE.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to unlock service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    try {
      await apiClient.delete(`/api/v1/admin/service/${id}`);
      toast.success('Service deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  // User Role Management
  const handleToggleUserRole = async (userId, targetRole, currentRoles) => {
    const hasRole = currentRoles.includes(targetRole);
    try {
      await apiClient.put(`/api/v1/admin/user/${userId}/role?role=${targetRole}&addRole=${!hasRole}`);
      toast.success(`${targetRole} role ${hasRole ? 'revoked from' : 'granted to'} user.`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  // Fast Bootstrap Admin
  const handleBootstrapAdmin = async (e) => {
    e.preventDefault();
    if (!bootstrapEmail.trim()) {
      toast.warn('Please enter an email address');
      return;
    }
    setBootstrapping(true);
    try {
      await apiClient.post(`/auth/bootstrap-admin?email=${encodeURIComponent(bootstrapEmail.trim())}`);
      toast.success(`User ${bootstrapEmail} elevated to ADMIN successfully!`);
      setBootstrapEmail('');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to promote user to Admin');
    } finally {
      setBootstrapping(false);
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
  });

  const filteredEscrowLedger = useMemo(() => {
    let list = escrowSummary?.ledger || [];
    if (escrowStatusFilter !== 'ALL') {
      list = list.filter(item => item.status === escrowStatusFilter);
    }
    if (escrowSearch.trim()) {
      const q = escrowSearch.toLowerCase();
      list = list.filter(item =>
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.customerEmail && item.customerEmail.toLowerCase().includes(q)) ||
        (item.businessName && item.businessName.toLowerCase().includes(q)) ||
        (item.businessOwnerName && item.businessOwnerName.toLowerCase().includes(q)) ||
        (item.serviceName && item.serviceName.toLowerCase().includes(q)) ||
        (item.appointmentCode && item.appointmentCode.toLowerCase().includes(q)) ||
        (item.escrowTransactionId && item.escrowTransactionId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [escrowSummary?.ledger, escrowStatusFilter, escrowSearch]);

  return (
    <div className="py-10 md:py-14 px-4 sm:px-6 bg-mesh-subtle min-h-screen">
      <div className="container mx-auto max-w-7xl space-y-8">

        {/* Executive Dashboard Header */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-neutral-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6" data-animation-on-scroll="">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-brand-primary text-brand-secondary text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                <i className="bi bi-shield-lock-fill"></i>
                Executive Control
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Platform Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-primary text-brand-primary">
              System Administration & Command Center
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Oversee business approvals, regulate service listings, manage account privileges, and monitor financial escrow transactions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDashboardData}
              className="bg-neutral-background hover:bg-neutral-border/60 text-brand-primary border border-neutral-border px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="bi bi-arrow-clockwise text-brand-primary"></i>
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl p-2 border border-neutral-border shadow-xs flex flex-wrap items-center gap-1.5">
          {[
            { id: 'OVERVIEW', label: 'Platform Overview', icon: 'bi-grid-1x2' },
            { id: 'ESCROW', label: `Escrow Vault (${escrowSummary?.activeHoldsCount || 0} active)`, icon: 'bi-shield-lock' },
            { id: 'BUSINESSES', label: `Businesses (${(Array.isArray(businesses) ? businesses : []).length})`, icon: 'bi-building' },
            { id: 'SERVICES', label: `Services Catalog (${(Array.isArray(services) ? services : []).length})`, icon: 'bi-scissors' },
            { id: 'USERS', label: `Users & Roles (${(Array.isArray(users) ? users : []).length})`, icon: 'bi-people' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-brand-primary hover:bg-neutral-background'
              }`}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8" data-animation-on-scroll="">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Gross Escrow Balance */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Escrow Funds</span>
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-base">
                    <i className="bi bi-wallet2"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-brand-primary">
                  ₹{(analytics?.totalEscrowBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-text-secondary">Secured customer balances across all wallets</p>
              </div>

              {/* Platform Revenue (5% Fee) */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Platform Net Revenue</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-emerald-700">
                  ₹{(analytics?.totalPlatformRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-text-secondary">Cumulative 5% platform fees on completed bookings</p>
              </div>

              {/* Registered Businesses */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Verified Sanctuaries</span>
                  <div className="w-9 h-9 rounded-xl bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-base">
                    <i className="bi bi-building-check"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-brand-primary">
                  {analytics?.activeBusinesses || 0}{' '}
                  <span className="text-sm font-normal text-text-secondary">/ {analytics?.totalBusinesses || 0}</span>
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {analytics?.lockedBusinesses || 0} business{analytics?.lockedBusinesses !== 1 ? 'es' : ''} currently suspended
                </p>
              </div>

              {/* Total Appointments */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Appointment Volume</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-base">
                    <i className="bi bi-calendar2-check"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-brand-primary">
                  {analytics?.totalAppointments || 0}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {analytics?.completedAppointments || 0} completed • {analytics?.cancelledAppointments || 0} cancelled
                </p>
              </div>
            </div>

            {/* Quick Admin Elevation Tool */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-border/60 pb-4">
                <div>
                  <h4 className="text-base font-bold font-primary text-brand-primary">
                    Quick Admin Provisioning & Elevation Tool
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Instantly grant <code className="text-brand-primary font-bold">ROLE_ADMIN</code> to any platform user for operational coverage.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBootstrapAdmin} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter user email to elevate to Administrator..."
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                  className="flex-1 bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={bootstrapping}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-card cursor-pointer disabled:opacity-50"
                >
                  {bootstrapping ? 'Promoting...' : 'Promote to Administrator'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESSES MANAGEMENT */}
        {activeTab === 'BUSINESSES' && (
          <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden space-y-4 p-6 sm:p-8" data-animation-on-scroll="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-border/60">
              <div className="flex items-center gap-2">
                {['ALL', 'AVAILABLE', 'UNAVAILABLE'].map(st => (
                  <button
                    key={st}
                    onClick={() => setBizStatusFilter(st)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      bizStatusFilter === st
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-background text-text-secondary hover:text-brand-primary'
                    }`}
                  >
                    {st === 'ALL' ? 'All Businesses' : st === 'AVAILABLE' ? 'Active' : 'Suspended'}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-72 relative">
                <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs"></i>
                <input
                  type="text"
                  placeholder="Filter by name, ID, or city..."
                  value={bizSearch}
                  onChange={(e) => setBizSearch(e.target.value)}
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-full py-2 pl-9 pr-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Businesses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-border/60 text-[11px] uppercase tracking-wider text-text-secondary">
                    <th className="pb-3 font-bold">Business Name & ID</th>
                    <th className="pb-3 font-bold">Location</th>
                    <th className="pb-3 font-bold">Contact</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/40">
                  {businesses.map(b => {
                    const isAvailable = b.status === 'AVAILABLE';
                    return (
                      <tr key={b.id} className="hover:bg-neutral-background/40 transition-colors">
                        <td className="py-4 pr-3">
                          <span className="font-bold text-brand-primary block">{b.name}</span>
                          <span className="text-[10px] font-mono text-text-secondary">#{b.businessId}</span>
                        </td>
                        <td className="py-4 pr-3 text-text-secondary">
                          <span>{b.city || 'N/A'}, {b.state || ''}</span>
                        </td>
                        <td className="py-4 pr-3 text-text-secondary">
                          <span className="block text-brand-primary font-medium">{b.phone || 'No phone'}</span>
                          <span className="text-[10px]">{b.email}</span>
                        </td>
                        <td className="py-4 pr-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            ● {b.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {isAvailable ? (
                            <button
                              onClick={() => handleLockBusiness(b.id)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveBusiness(b.id)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Activate / Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBusiness(b.id)}
                            className="px-3 py-1 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {businesses.length === 0 && (
                <div className="p-8 text-center text-text-secondary text-xs">
                  No businesses found matching this query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES CATALOG OVERVIEW */}
        {activeTab === 'SERVICES' && (
          <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden space-y-4 p-6 sm:p-8" data-animation-on-scroll="">
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-border/60">
              {['ALL', 'AVAILABLE', 'UNAVAILABLE'].map(st => (
                <button
                  key={st}
                  onClick={() => setSrvStatusFilter(st)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    srvStatusFilter === st
                      ? 'bg-brand-primary text-white'
                      : 'bg-neutral-background text-text-secondary hover:text-brand-primary'
                  }`}
                >
                  {st === 'ALL' ? 'All Services' : st === 'AVAILABLE' ? 'Active Services' : 'Locked Services'}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-border/60 text-[11px] uppercase tracking-wider text-text-secondary">
                    <th className="pb-3 font-bold">Service & ID</th>
                    <th className="pb-3 font-bold">Provider Sanctuary</th>
                    <th className="pb-3 font-bold">Session Specs</th>
                    <th className="pb-3 font-bold">Price</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/40">
                  {services.map(s => {
                    const isAvailable = s.status === 'AVAILABLE';
                    return (
                      <tr key={s.id} className="hover:bg-neutral-background/40 transition-colors">
                        <td className="py-4 pr-3">
                          <span className="font-bold text-brand-primary block">{s.name}</span>
                          <span className="text-[10px] font-mono text-text-secondary">#{s.serviceOfferedId}</span>
                        </td>
                        <td className="py-4 pr-3 text-text-secondary font-medium">
                          {s.businessName || 'Business ID #' + s.businessId}
                        </td>
                        <td className="py-4 pr-3 text-text-secondary">
                          <span>{s.duration} mins • {s.totalSlots} daily slots</span>
                        </td>
                        <td className="py-4 pr-3 font-bold text-brand-primary">
                          ₹{s.price}
                        </td>
                        <td className="py-4 pr-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            ● {s.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {isAvailable ? (
                            <button
                              onClick={() => handleLockService(s.id)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                            >
                              Lock Service
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnlockService(s.id)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Unlock Service
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="px-3 py-1 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {services.length === 0 && (
                <div className="p-8 text-center text-text-secondary text-xs">
                  No services matching this filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: USERS & PRIVILEGES */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden space-y-4 p-6 sm:p-8" data-animation-on-scroll="">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-border/60">
              <h3 className="text-base font-bold font-primary text-brand-primary">Platform User Directory</h3>
              <div className="w-full sm:w-72 relative">
                <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs"></i>
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-full py-2 pl-9 pr-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-border/60 text-[11px] uppercase tracking-wider text-text-secondary">
                    <th className="pb-3 font-bold">User Name</th>
                    <th className="pb-3 font-bold">Email</th>
                    <th className="pb-3 font-bold">Assigned Roles</th>
                    <th className="pb-3 font-bold text-right">Role Elevation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/40">
                  {filteredUsers.map(u => {
                    const roles = Array.isArray(u.roles) ? u.roles : [];
                    const isAdmin = roles.includes('ADMIN');
                    const isOwner = roles.includes('OWNER');

                    return (
                      <tr key={u.id} className="hover:bg-neutral-background/40 transition-colors">
                        <td className="py-4 pr-3 font-bold text-brand-primary">
                          {u.name || 'User #' + u.id}
                        </td>
                        <td className="py-4 pr-3 text-text-secondary">
                          {u.email}
                        </td>
                        <td className="py-4 pr-3 space-x-1">
                          {roles.map(r => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : r === 'OWNER'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-neutral-border text-text-secondary'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserRole(u.id, 'ADMIN', roles)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border ${
                              isAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                : 'bg-neutral-background text-text-secondary border-neutral-border hover:text-brand-primary'
                            }`}
                          >
                            {isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                          </button>

                          <button
                            onClick={() => handleToggleUserRole(u.id, 'OWNER', roles)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border ${
                              isOwner
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-neutral-background text-text-secondary border-neutral-border hover:text-brand-primary'
                            }`}
                          >
                            {isOwner ? 'Revoke Owner' : 'Grant Owner'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-text-secondary text-xs">
                  No users found matching this search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ESCROW VAULT & LEDGER (ADMIN ONLY) */}
        {activeTab === 'ESCROW' && (
          <div className="space-y-8" data-animation-on-scroll="">
            {/* Escrow Security Banner */}
            <div className="bg-gradient-to-r from-brand-primary via-[#2C3E50] to-brand-primary text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-brand-primary text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                    <i className="bi bi-shield-lock-fill"></i>
                    Platform Escrow Vault
                  </span>
                  <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Admin Exclusive Oversight
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-primary">Trust & Custody Ledger</h2>
                <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  All customer funds are locked in this platform escrow vault the moment an appointment is booked.
                  Funds remain securely quarantined until the provider completes the session or a cancellation refund triggers.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 min-w-[200px] z-10">
                <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Active In Escrow</p>
                <h3 className="text-3xl font-extrabold text-amber-300 font-primary mt-1">
                  ₹{(escrowSummary?.totalEscrowBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-white/80 mt-0.5">
                  {escrowSummary?.activeHoldsCount || 0} active appointment hold{(escrowSummary?.activeHoldsCount || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Escrow Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Active Holds */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Live Escrow Balance</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base">
                    <i className="bi bi-lock-fill"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-amber-600">
                  ₹{(escrowSummary?.totalEscrowBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-text-secondary">Secured funds awaiting service delivery</p>
              </div>

              {/* Total Released to Businesses */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Disbursed to Providers</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-emerald-700">
                  ₹{(escrowSummary?.totalReleasedToBusinesses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-text-secondary">Pushed to business wallets upon completion</p>
              </div>

              {/* Total Refunded to Customers */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Returned to Clients</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-base">
                    <i className="bi bi-arrow-counterclockwise"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-blue-700">
                  ₹{(escrowSummary?.totalRefundedToCustomers || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-text-secondary">Refunded back on cancellation or rejection</p>
              </div>

              {/* Cumulative Platform Take (5%) */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Platform Take (5%)</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-base">
                    <i className="bi bi-pie-chart-fill"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-primary text-indigo-700">
                  ₹{(escrowSummary?.totalPlatformFeesEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-text-secondary">Retained platform commission from settled sessions</p>
              </div>
            </div>

            {/* Escrow Ledger Explorer & Filters */}
            <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden">
              <div className="p-6 border-b border-neutral-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold font-primary text-brand-primary flex items-center gap-2">
                    <i className="bi bi-journal-text text-brand-secondary"></i>
                    <span>Real-Time Escrow Ledger</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Transparent transaction trail documenting who paid, for whom, for what, and current custody state
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Status Filters */}
                  <div className="flex items-center bg-neutral-background rounded-full p-1 border border-neutral-border text-xs">
                    {[
                      { id: 'ALL', label: 'All Entries' },
                      { id: 'HELD_IN_ESCROW', label: 'Held' },
                      { id: 'RELEASED_TO_BUSINESS', label: 'Settled' },
                      { id: 'REFUNDED_TO_CUSTOMER', label: 'Refunded' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setEscrowStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                          escrowStatusFilter === f.id
                            ? 'bg-brand-primary text-white shadow-2xs'
                            : 'text-text-secondary hover:text-brand-primary'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs"></i>
                    <input
                      type="text"
                      placeholder="Search who, whom, or what..."
                      value={escrowSearch}
                      onChange={e => setEscrowSearch(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-3 py-2 text-xs bg-neutral-background border border-neutral-border rounded-full focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Escrow Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-background/70 border-b border-neutral-border text-text-secondary uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="py-3.5 px-5">Who Added Funds (Customer)</th>
                      <th className="py-3.5 px-5">For Whom (Sanctuary / Provider)</th>
                      <th className="py-3.5 px-5">For What (Service & Session)</th>
                      <th className="py-3.5 px-5 text-right">Escrow Amount & Split</th>
                      <th className="py-3.5 px-5 text-center">Custody Status</th>
                      <th className="py-3.5 px-5 text-right">Audit Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-border/60">
                    {filteredEscrowLedger.map(item => {
                      const isHeld = item.status === 'HELD_IN_ESCROW';
                      const isReleased = item.status === 'RELEASED_TO_BUSINESS';
                      const isRefunded = item.status === 'REFUNDED_TO_CUSTOMER';

                      const custInitial = (item.customerName || 'C').charAt(0).toUpperCase();

                      return (
                        <tr key={item.id} className="hover:bg-neutral-background/30 transition-colors">
                          {/* WHO Added Funds */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-secondary/20 text-brand-primary font-bold flex items-center justify-center text-xs shrink-0">
                                {custInitial}
                              </div>
                              <div>
                                <p className="font-bold text-brand-primary">{item.customerName || 'Customer'}</p>
                                <p className="text-[11px] text-text-secondary">{item.customerEmail}</p>
                                {item.customerCode && (
                                  <span className="inline-block mt-0.5 text-[9px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                    {item.customerCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* FOR WHOM */}
                          <td className="py-4 px-5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <i className="bi bi-building text-brand-primary text-xs"></i>
                                <span className="font-bold text-brand-primary">{item.businessName || 'Business'}</span>
                              </div>
                              <p className="text-[11px] text-text-secondary">
                                Owner: {item.businessOwnerName || 'Owner'}
                              </p>
                              <p className="text-[10px] text-text-secondary/80">{item.businessOwnerEmail}</p>
                            </div>
                          </td>

                          {/* FOR WHAT */}
                          <td className="py-4 px-5">
                            <div className="space-y-1">
                              <span className="font-bold text-brand-primary text-xs block">
                                {item.serviceName || 'Service Session'}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {item.appointmentCode && (
                                  <span className="text-[10px] font-mono bg-neutral-background border border-neutral-border px-2 py-0.5 rounded-md text-text-secondary">
                                    Ref: {item.appointmentCode}
                                  </span>
                                )}
                                {item.appointmentDateTime && (
                                  <span className="text-[10px] text-text-secondary flex items-center gap-1">
                                    <i className="bi bi-clock"></i>
                                    {new Date(item.appointmentDateTime).toLocaleString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* AMOUNT & SPLIT */}
                          <td className="py-4 px-5 text-right">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-sm font-primary text-brand-primary">
                                ₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-[10px] text-text-secondary">
                                Provider: ₹{(item.businessShare || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-[9px] text-emerald-600 font-medium">
                                Fee (5%): ₹{(item.platformFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </td>

                          {/* ESCROW STATUS */}
                          <td className="py-4 px-5 text-center">
                            {isHeld && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                <i className="bi bi-lock-fill"></i>
                                Held in Escrow
                              </span>
                            )}
                            {isReleased && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <i className="bi bi-check-circle-fill"></i>
                                Released to Provider
                              </span>
                            )}
                            {isRefunded && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <i className="bi bi-arrow-counterclockwise"></i>
                                Refunded to Client
                              </span>
                            )}
                          </td>

                          {/* TIMESTAMPS */}
                          <td className="py-4 px-5 text-right text-[11px] text-text-secondary">
                            <div>
                              <span className="block font-medium">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                              </span>
                              <span className="text-[10px] text-text-secondary/80">
                                {item.releasedAt ? `Settled ${new Date(item.releasedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Locked in Vault'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredEscrowLedger.length === 0 && (
                  <div className="p-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-background text-text-secondary flex items-center justify-center text-xl mx-auto">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <p className="text-sm font-bold text-brand-primary">No Escrow Transactions Found</p>
                    <p className="text-xs text-text-secondary">
                      {escrowSearch ? 'Try clearing your search query.' : 'New appointments will automatically record fund custody here.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
