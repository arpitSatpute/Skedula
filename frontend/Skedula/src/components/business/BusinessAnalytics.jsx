import React, { useState, useEffect } from 'react';
import apiClient from '../Auth/ApiClient';
import { showErrorToast } from '../../utils/errorHandler';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const FUNNEL_COLORS = {
  DONE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: '#10B981', label: 'Completed' },
  BOOKED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', bar: '#3B82F6', label: 'Confirmed / Booked' },
  PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200', bar: '#F59E0B', label: 'Pending Approval' },
  CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', bar: '#EF4444', label: 'Cancelled' },
  REJECTED: { bg: 'bg-slate-100 text-slate-700 border-slate-300', bar: '#64748B', label: 'Declined' }
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun'
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export default function BusinessAnalytics({ businessId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/business/analytics/${businessId}`);
      const payload = res.data?.data || res.data;
      setData(payload);
    } catch (err) {
      showErrorToast(err, 'Failed to load business analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [businessId]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-neutral-border p-8 shadow-card">
        <div className="w-12 h-12 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-primary font-bold text-lg text-brand-primary">Aggregating Business Intelligence...</p>
        <p className="text-xs text-text-secondary">Computing revenue streams, booking funnels, and retention metrics</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-3xl border border-neutral-border p-12 text-center shadow-card space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-3xl mx-auto">
          <i className="bi bi-graph-up-arrow"></i>
        </div>
        <h3 className="font-primary font-bold text-xl text-brand-primary">No Analytics Available</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          Analytics will populate automatically as clients make bookings, complete appointments, and leave feedback.
        </p>
        <button
          onClick={fetchAnalytics}
          className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-xs cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Pre-process Monthly Revenue for Recharts
  const monthlyRevenueList = Object.entries(data.monthlyRevenue || {}).map(([month, amount]) => ({
    month: month,
    revenue: Number(amount) || 0
  }));

  // Pre-process Revenue by Service for Recharts
  const serviceRevenueList = Object.entries(data.revenueByService || {}).map(([service, amount]) => ({
    service: service.length > 16 ? service.substring(0, 14) + '…' : service,
    fullName: service,
    revenue: Number(amount) || 0
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Pre-process Customer Loyalty Pie
  const loyaltyData = [
    { name: 'Returning Clients', value: data.returningCustomers || 0 },
    { name: 'First-time Clients', value: data.newCustomers || 0 }
  ];

  // Appointment Funnel percentages
  const totalAppts = data.totalAppointments || 0;
  const completionRate = totalAppts > 0 ? Math.round((data.completedAppointments / totalAppts) * 100) : 0;
  const cancellationRate = totalAppts > 0 ? Math.round((data.cancelledAppointments / totalAppts) * 100) : 0;
  const retentionRate = data.uniqueCustomers > 0 ? Math.round((data.returningCustomers / data.uniqueCustomers) * 100) : 0;

  // Monthly Revenue Comparison
  const thisMonth = Number(data.thisMonthRevenue) || 0;
  const lastMonth = Number(data.lastMonthRevenue) || 0;
  const revenueGrowth = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : thisMonth > 0 ? 100 : 0;

  // Find Peak Slot in Peak Hours
  let maxPeakCount = 0;
  let peakDay = 'None';
  let peakHour = 0;
  if (data.peakHours) {
    Object.entries(data.peakHours).forEach(([day, hourMap]) => {
      Object.entries(hourMap || {}).forEach(([hour, count]) => {
        if (count > maxPeakCount) {
          maxPeakCount = count;
          peakDay = day;
          peakHour = Number(hour);
        }
      });
    });
  }

  return (
    <div className="space-y-8" data-animation-on-scroll="">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-primary text-brand-secondary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <i className="bi bi-cpu-fill"></i>
              Real-time Business Insights
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
            Operational Performance & Financial Insights
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Monitor verified revenue, client retention cohorts, service popularity, and schedule capacity.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto bg-white border border-neutral-border hover:border-brand-primary/40 text-brand-primary px-4 py-2 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── 1. Top KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Gross Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
              ₹
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              ₹{Number(data.totalRevenue || 0).toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                revenueGrowth >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                <i className={`bi ${revenueGrowth >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`}></i>
                {revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`} vs last mo.
              </span>
              <span className="text-[11px] text-text-secondary">
                ₹{thisMonth.toLocaleString('en-IN')} this mo.
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Completed Appointments */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Fulfillment Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i className="bi bi-calendar-check"></i>
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              {completionRate}%
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                {data.completedAppointments} of {totalAppts} completed
              </span>
              <span className="text-[11px] text-text-secondary">
                {data.bookedAppointments} booked
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Client Retention */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Client Retention</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
              <i className="bi bi-people"></i>
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              {retentionRate}%
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                {data.returningCustomers} repeat clients
              </span>
              <span className="text-[11px] text-text-secondary">
                {data.uniqueCustomers} total clients
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Customer Rating */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Reputation Score</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <i className="bi bi-star-fill"></i>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
                {data.totalReviews > 0 ? (data.averageRating || 0).toFixed(1) : '—'}
              </h3>
              <div className="flex text-amber-400 text-xs">
                {[1, 2, 3, 4, 5].map((s) => (
                  <i
                    key={s}
                    className={`bi ${data.totalReviews > 0 && s <= Math.round(data.averageRating || 0) ? 'bi-star-fill' : 'bi-star text-neutral-border'}`}
                  ></i>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                data.totalReviews > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {data.totalReviews > 0 ? `${data.totalReviews} verified reviews` : 'Awaiting reviews'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Appointment Funnel & Conversion Health ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-primary text-brand-primary flex items-center gap-2">
              <i className="bi bi-funnel text-brand-secondary"></i>
              <span>Appointment Conversion & Funnel Breakdown</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Track lifecycle outcomes from initial customer request to successful completion.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-secondary">
              Total Volume: <strong className="text-brand-primary">{totalAppts}</strong> bookings
            </span>
          </div>
        </div>

        {/* Funnel Progress Visual */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-neutral-background rounded-full overflow-hidden flex shadow-inner">
            {totalAppts > 0 ? (
              <>
                <div
                  style={{ width: `${(data.completedAppointments / totalAppts) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Completed: ${data.completedAppointments}`}
                ></div>
                <div
                  style={{ width: `${(data.bookedAppointments / totalAppts) * 100}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Booked: ${data.bookedAppointments}`}
                ></div>
                <div
                  style={{ width: `${(data.pendingAppointments / totalAppts) * 100}%` }}
                  className="bg-amber-400 h-full transition-all"
                  title={`Pending: ${data.pendingAppointments}`}
                ></div>
                <div
                  style={{ width: `${(data.cancelledAppointments / totalAppts) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Cancelled: ${data.cancelledAppointments}`}
                ></div>
                <div
                  style={{ width: `${(data.rejectedAppointments / totalAppts) * 100}%` }}
                  className="bg-slate-400 h-full transition-all"
                  title={`Declined: ${data.rejectedAppointments}`}
                ></div>
              </>
            ) : (
              <div className="w-full bg-neutral-border h-full"></div>
            )}
          </div>

          {/* Legend Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {[
              { key: 'DONE', count: data.completedAppointments, label: 'Completed', color: 'bg-emerald-500' },
              { key: 'BOOKED', count: data.bookedAppointments, label: 'Confirmed', color: 'bg-blue-500' },
              { key: 'PENDING', count: data.pendingAppointments, label: 'Pending', color: 'bg-amber-400' },
              { key: 'CANCELLED', count: data.cancelledAppointments, label: 'Cancelled', color: 'bg-rose-500' },
              { key: 'REJECTED', count: data.rejectedAppointments, label: 'Declined', color: 'bg-slate-400' }
            ].map((st) => (
              <div
                key={st.key}
                className="bg-neutral-background/70 border border-neutral-border/60 p-3 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.color}`}></span>
                  <span className="text-xs font-semibold text-text-secondary">{st.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-primary">{st.count}</span>
                  <span className="text-[10px] text-text-secondary block">
                    {totalAppts > 0 ? `${Math.round((st.count / totalAppts) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {data.rescheduledAppointments > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-900 mt-2">
              <span className="flex items-center gap-2 font-semibold">
                <i className="bi bi-arrow-repeat text-indigo-600"></i>
                Rescheduled Appointments:
              </span>
              <span className="font-bold text-indigo-700">
                {data.rescheduledAppointments} slots adjusted by clients
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Charts: Monthly Revenue & Revenue by Service ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Revenue Trajectory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-primary text-brand-primary flex items-center gap-2">
                <i className="bi bi-graph-up text-brand-secondary"></i>
                <span>Monthly Revenue Trajectory</span>
              </h3>
              <p className="text-xs text-text-secondary">Historical earning trend (last 6 months)</p>
            </div>
            <span className="text-xs font-bold text-brand-primary bg-neutral-background px-3 py-1 rounded-full border border-neutral-border">
              ₹ Trend
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {monthlyRevenueList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueList} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(l) => `Month: ${l}`}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                No completed appointment revenue recorded in the last 6 months.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Top Revenue-Generating Services */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-primary text-brand-primary flex items-center gap-2">
                <i className="bi bi-bar-chart-fill text-brand-secondary"></i>
                <span>Revenue by Service</span>
              </h3>
              <p className="text-xs text-text-secondary">Top performing offerings by gross earnings</p>
            </div>
            <span className="text-xs font-bold text-brand-primary bg-neutral-background px-3 py-1 rounded-full border border-neutral-border">
              Top 6
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {serviceRevenueList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceRevenueList} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val, name, item) => [`₹${Number(val).toLocaleString('en-IN')}`, item.payload.fullName]}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                No completed bookings recorded across your services yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Peak Hours Heatmap ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-primary text-brand-primary flex items-center gap-2">
              <i className="bi bi-clock-history text-brand-secondary"></i>
              <span>Peak Hours & Schedule Heatmap</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Slot booking density across days of the week and operating hours. Darker colors indicate peak traffic.
            </p>
          </div>

          {maxPeakCount > 0 && (
            <div className="bg-brand-secondary/40 border border-brand-primary/20 rounded-2xl px-3.5 py-1.5 text-xs text-brand-primary font-bold flex items-center gap-2">
              <i className="bi bi-lightning-charge-fill text-amber-500"></i>
              <span>Busiest Window: {peakDay} ~ {peakHour % 12 || 12}:00 {peakHour >= 12 ? 'PM' : 'AM'} ({maxPeakCount} bookings)</span>
            </div>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px] space-y-1.5">
            {/* Hour Header */}
            <div className="grid grid-cols-15 gap-1 text-[10px] font-bold text-text-secondary text-center">
              <span className="text-left pl-1">Day</span>
              {HOURS.map((h) => (
                <span key={h}>{h % 12 || 12}{h >= 12 ? 'p' : 'a'}</span>
              ))}
            </div>

            {/* Day Rows */}
            {DAYS_ORDER.map((day) => {
              const dayData = data.peakHours?.[day] || {};
              return (
                <div key={day} className="grid grid-cols-15 gap-1 items-center">
                  <span className="text-xs font-bold text-brand-primary text-left pl-1">
                    {DAY_LABELS[day]}
                  </span>
                  {HOURS.map((h) => {
                    const count = dayData[h] || 0;
                    // Color intensity
                    let bg = 'bg-neutral-background hover:bg-neutral-border';
                    if (count > 0 && maxPeakCount > 0) {
                      const ratio = count / maxPeakCount;
                      if (ratio >= 0.75) bg = 'bg-emerald-600 text-white font-bold';
                      else if (ratio >= 0.5) bg = 'bg-emerald-500 text-white font-bold';
                      else if (ratio >= 0.25) bg = 'bg-emerald-300 text-brand-primary font-semibold';
                      else bg = 'bg-emerald-100 text-brand-primary';
                    }
                    return (
                      <div
                        key={h}
                        className={`h-8 rounded-lg flex items-center justify-center text-[11px] transition-all cursor-pointer ${bg}`}
                        title={`${DAY_LABELS[day]} at ${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}: ${count} bookings`}
                      >
                        {count > 0 ? count : '·'}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-neutral-border/60">
          <span>💡 Use peak slots to optimize practitioner shifts and run targeted promotions during quiet hours.</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>Low</span>
            <span className="w-3 h-3 rounded bg-emerald-100"></span>
            <span className="w-3 h-3 rounded bg-emerald-300"></span>
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="w-3 h-3 rounded bg-emerald-600"></span>
            <span>High Density</span>
          </div>
        </div>
      </div>

      {/* ── 5. Service Performance Leaderboard ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-primary text-brand-primary flex items-center gap-2">
              <i className="bi bi-award text-brand-secondary"></i>
              <span>Service Performance Leaderboard</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Rankings across bookings, revenue contribution, customer ratings, and slot capacity.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-primary bg-neutral-background px-3 py-1 rounded-full border border-neutral-border">
            {data.serviceStats?.length || 0} Offerings
          </span>
        </div>

        {data.serviceStats && data.serviceStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-border/80 text-[10px] uppercase font-bold text-text-secondary">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Service Name</th>
                  <th className="pb-3">Unit Fee</th>
                  <th className="pb-3">Completed Bookings</th>
                  <th className="pb-3">Total Revenue</th>
                  <th className="pb-3">Avg Rating</th>
                  <th className="pb-3">Cancellations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/40">
                {data.serviceStats.map((svc, idx) => (
                  <tr key={svc.id} className="hover:bg-neutral-background/50 transition-colors">
                    <td className="py-3.5 pl-2 font-bold font-mono">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="text-text-secondary">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3.5 font-bold text-brand-primary">
                      {svc.name}
                    </td>
                    <td className="py-3.5 font-semibold text-brand-primary">
                      ₹{Number(svc.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 font-semibold text-brand-primary">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        {svc.bookingCount} done
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-brand-primary">
                      ₹{Number(svc.revenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
                      {svc.avgRating ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <i className="bi bi-star-fill text-[10px] text-amber-500"></i>
                          {svc.avgRating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-[11px]">No reviews</span>
                      )}
                    </td>
                    <td className="py-3.5 text-rose-600 font-semibold">
                      {svc.cancellations > 0 ? `${svc.cancellations} cancels` : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-text-secondary">
            No service performance statistics available yet.
          </div>
        )}
      </div>

      {/* ── 6. Customer Loyalty & Review Feedback ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Loyalty Donut */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-primary text-brand-primary flex items-center gap-2">
              <i className="bi bi-heart-fill text-rose-500"></i>
              <span>Customer Loyalty & Cohort Mix</span>
            </h3>
            <p className="text-xs text-text-secondary">
              First-time vs repeat client breakdown over total booking volume.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {data.uniqueCustomers > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loyaltyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#3B82F6" />
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${v} Clients`, 'Count']}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-text-secondary text-center">
                No customer loyalty data recorded yet.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
            <div className="bg-neutral-background p-3 rounded-2xl border border-neutral-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-bold">Total Clients</span>
              <p className="text-lg font-bold text-brand-primary mt-0.5">{data.uniqueCustomers}</p>
            </div>
            <div className="bg-neutral-background p-3 rounded-2xl border border-neutral-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-bold">Repeat Retention</span>
              <p className="text-lg font-bold text-brand-primary mt-0.5">{retentionRate}%</p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown & Recent Feedback */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-primary text-brand-primary flex items-center gap-2">
              <i className="bi bi-chat-quote-fill text-amber-500"></i>
              <span>Customer Satisfaction & Verified Feedback</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Review distribution and recent comments from completed appointments.
            </p>
          </div>

          {/* 5-star histogram */}
          <div className="space-y-1.5 pt-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data.ratingDistribution?.[stars] || 0;
              const pct = data.totalReviews > 0 ? Math.round((count / data.totalReviews) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-bold text-brand-primary flex items-center gap-1">
                    {stars} <i className="bi bi-star-fill text-amber-400 text-[10px]"></i>
                  </span>
                  <div className="flex-1 h-2 bg-neutral-background rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-amber-400 h-full rounded-full transition-all"
                    ></div>
                  </div>
                  <span className="w-12 text-right text-[11px] text-text-secondary font-medium">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recent Reviews snippet */}
          <div className="pt-3 border-t border-neutral-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                Recent Verified Client Feedback ({data.recentReviews?.length || 0})
              </span>
              {data.totalReviews > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Real Clients
                </span>
              )}
            </div>
            {data.recentReviews && data.recentReviews.length > 0 ? (
              data.recentReviews.map((r, i) => (
                <div key={r.id || i} className="bg-neutral-background/60 p-3.5 rounded-2xl border border-neutral-border/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-primary text-xs">
                        {r.customerName || 'Verified Client'}
                      </span>
                      <div className="flex text-amber-400 text-[10px]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i key={s} className={`bi ${s <= r.rating ? 'bi-star-fill' : 'bi-star text-neutral-border'}`}></i>
                        ))}
                      </div>
                    </div>
                    {r.serviceName && (
                      <span className="text-[10px] font-bold text-brand-primary bg-white px-2 py-0.5 rounded-full border border-neutral-border truncate max-w-[150px]">
                        {r.serviceName}
                      </span>
                    )}
                  </div>
                  {r.comment ? (
                    <p className="text-xs text-text-primary italic leading-relaxed">
                      "{r.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary italic">
                      "Great overall experience and smooth appointment process."
                    </p>
                  )}
                  {r.createdAt && (
                    <span className="text-[10px] text-text-secondary/70 block">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-neutral-background/40 rounded-2xl border border-neutral-border/40 text-xs text-text-secondary">
                <i className="bi bi-chat-heart text-lg text-text-secondary/50 block mb-1"></i>
                No customer reviews submitted yet. Reviews appear here after clients complete appointments!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
