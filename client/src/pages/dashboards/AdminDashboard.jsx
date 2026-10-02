import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ArrowUpRight, CheckCircle2, FileCheck2, Shield, UserCheck, UserRoundCheck, Users, X, AlertTriangle } from 'lucide-react';
import WeatherWidget from '../../components/WeatherWidget';
import RecommendationEngine from '../../components/RecommendationEngine';

export default function AdminDashboard({ roleView }) {
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [assignForm, setAssignForm] = useState({
    officerId: '',
    severity: 'High',
    adminNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, repRes, offRes] = await Promise.all([
        axios.get('http://localhost:4000/api/operations/summary'),
        axios.get('http://localhost:4000/api/operations/reports?roleView=admin'),
        axios.get('http://localhost:4000/api/operations/officers')
      ]);

      setSummary(sumRes.data);
      setReports(repRes.data.reports || []);
      setOfficers(offRes.data.officers || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssignModal = (rep) => {
    setSelectedReport(rep);
    setMsg('');
    setAssignForm({
      officerId: rep.assignedOfficerId || (officers[0]?._id || ''),
      severity: rep.severity || 'High',
      adminNotes: rep.adminNotes || 'Assigned for priority field verification and soil health monitoring.'
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      const selectedOfficer = officers.find((o) => o._id === assignForm.officerId);
      await axios.patch(`http://localhost:4000/api/operations/reports/${selectedReport._id}/assign`, {
        officerId: assignForm.officerId,
        officerName: selectedOfficer?.fullName || 'Assigned Officer'
      });

      // Also update verification notes & severity
      await axios.patch(`http://localhost:4000/api/operations/reports/${selectedReport._id}/verify`, {
        severity: assignForm.severity,
        adminNotes: assignForm.adminNotes
      });

      setMsg('Officer assigned and diagnosis record verified!');
      setTimeout(() => {
        setSelectedReport(null);
        loadData();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign officer.');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleReports = filter === 'All'
    ? reports
    : filter === 'Needs Review'
    ? reports.filter((r) => r.status === 'pending_verification')
    : reports.filter((r) => r.status === filter);

  return (
    <div className="space-y-8 animate-rise">
      {/* Top Banner */}
      <section className="bg-[#1b3d2b] text-white p-7 sm:p-9 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8dfaa]">
              Central Agricultural Command & Operations
            </p>
            <h1 className="display-face text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
              District Disease Surveillance Platform
            </h1>
            <p className="mt-3 text-sm text-white/75 max-w-xl leading-relaxed">
              Verify incoming AI pathology alerts, dispatch field agronomists to high-risk outbreaks, and ensure farm compliance reports are fulfilled.
            </p>
          </div>

          <div className="border border-white/15 bg-white/5 px-4 py-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-[#b8dfaa]">System Status</p>
            <p className="mt-1 font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#8de17b] animate-ping" />
              All Platform Services Active
            </p>
          </div>
        </div>
      </section>

      {/* Live Microclimate Weather and Dynamic Operational Metrics */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <WeatherWidget />

        {/* Dynamic Admin Counts - Zero Placeholders */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#738475]">
              <Users size={16} className="text-[#3b7e49]" /> Registered Farmers
            </div>
            <p className="display-face text-3xl font-bold text-[#1d3d27] mt-2">
              {summary?.registeredFarmers ?? '--'}
            </p>
            <p className="text-[11px] text-[#718573] mt-1">Total platform producers</p>
          </div>

          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#738475]">
              <UserRoundCheck size={16} className="text-[#376daf]" /> Field Officers
            </div>
            <p className="display-face text-3xl font-bold text-[#1d3d27] mt-2">
              {summary?.activeOfficers ?? '--'}
            </p>
            <p className="text-[11px] text-[#718573] mt-1">Active agronomists</p>
          </div>

          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#738475]">
              <AlertTriangle size={16} className="text-[#a03e29]" /> Needs Review
            </div>
            <p className="display-face text-3xl font-bold text-[#a03e29] mt-2">
              {summary?.pendingReview ?? '--'}
            </p>
            <p className="text-[11px] text-[#718573] mt-1">Awaiting verification</p>
          </div>

          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#738475]">
              <Activity size={16} className="text-[#b06f22]" /> Total Incidents
            </div>
            <p className="display-face text-3xl font-bold text-[#1d3d27] mt-2">
              {summary?.totalReports ?? '--'}
            </p>
            <p className="text-[11px] text-[#718573] mt-1">{summary?.resolved ?? 0} resolved</p>
          </div>
        </div>
      </div>

      {/* Real-Time Agronomic Directives & Pathogen Containment Engine */}
      <RecommendationEngine />

      {/* Disease Diagnosis Queue */}
      <section className="border border-[#dce4d8] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4ebe0] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={19} className="text-[#367948]" />
              <h2 className="text-xl font-bold text-[#203a27]">Incoming Crop Pathology Queue</h2>
            </div>
            <p className="text-xs text-[#6e7e70] mt-0.5">Validate AI predictions, set alert severity, and dispatch field officers.</p>
          </div>

          <div className="flex flex-wrap border border-[#d5dfd1] p-0.5 text-xs font-bold">
            {['All', 'Needs Review', 'officer_assigned', 'under_investigation', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 capitalize transition ${
                  filter === f ? 'bg-[#205e38] text-white' : 'text-[#5d6f5f] hover:bg-[#f2f6f0]'
                }`}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#6e7e70] font-semibold animate-pulse">
              Loading incident database...
            </div>
          ) : visibleReports.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 size={32} className="text-[#367c48] mx-auto mb-2" />
              <p className="font-bold text-[#2d4734]">Queue is clear for this filter.</p>
              <p className="text-xs text-[#6e7e70] mt-1">No pending verification cases require admin attention.</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-[#f7faf5] text-[10px] font-bold uppercase tracking-[.14em] text-[#6d7e6f] border-b border-[#e5ece1]">
                <tr>
                  <th className="px-6 py-3.5">Farmer & Plot</th>
                  <th className="px-4 py-3.5">Predicted Pathology</th>
                  <th className="px-4 py-3.5">AI Confidence</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5">Assigned Officer</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ede3] text-xs">
                {visibleReports.map((row) => (
                  <tr key={row._id} className="hover:bg-[#fbfdfa] transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1f3e27]">
                        {row.user?.fullName || row.userId?.fullName || 'Registered Farmer'}
                      </p>
                      <p className="text-[11px] text-[#6b7d6d] mt-0.5">
                        {row.farmLocation || 'Main Field'} · {row.cropName || 'Crop'}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold text-[#25462d] capitalize">
                      {row.predictedDisease.replace(/___/g, ' · ').replace(/_/g, ' ')}
                    </td>

                    <td className="px-4 py-4 font-mono font-bold text-[#34533b]">
                      {(row.confidenceScore * 100).toFixed(1)}%
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        row.severity === 'Critical' ? 'bg-[#fde2dc] text-[#932c1b]' :
                        row.severity === 'High' ? 'bg-[#ffeedb] text-[#935212]' :
                        'bg-[#edf5ea] text-[#336e3f]'
                      }`}>
                        {row.severity || 'Medium'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-[#20577d] font-semibold">
                      {row.assignedOfficerName || <span className="text-[#a03e29] font-normal italic">Unassigned</span>}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        row.status === 'resolved' ? 'bg-[#eaf6e7] text-[#2c6e3b]' :
                        row.status === 'pending_verification' ? 'bg-[#fff0eb] text-[#a03e29]' :
                        'bg-[#edf4ff] text-[#1b5099]'
                      }`}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleOpenAssignModal(row)}
                        className="border border-[#2d6f43] bg-[#f2f8ee] hover:bg-[#205e38] hover:text-white text-[#205e38] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition"
                      >
                        Review / Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Review & Officer Assignment Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-rise">
          <div className="max-w-xl w-full bg-white border border-[#dce4d8] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e6ece2] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#697d6a]">
                  Incident Verification & Dispatch #{selectedReport._id.slice(-6)}
                </span>
                <h3 className="text-2xl font-bold text-[#1a3824] capitalize mt-0.5">
                  {selectedReport.predictedDisease.replace(/___/g, ' · ').replace(/_/g, ' ')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="grid h-8 w-8 place-items-center text-[#556957] hover:bg-[#f0f4ee]"
              >
                <X size={18} />
              </button>
            </div>

            {msg ? (
              <div className="my-8 text-center p-6 bg-[#f0f8ee] border border-[#d2e8cd]">
                <CheckCircle2 size={36} className="text-[#2d6f43] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#1f4a2b]">{msg}</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4 text-xs">
                <div className="bg-[#f8faf6] border border-[#e3ebe0] p-3 text-[#506853]">
                  <p><span className="font-bold">Farmer:</span> {selectedReport.user?.fullName || selectedReport.userId?.fullName || 'Registered Farmer'}</p>
                  <p><span className="font-bold">Location:</span> {selectedReport.farmLocation || 'Main Field'}</p>
                  <p><span className="font-bold">AI Confidence:</span> {(selectedReport.confidenceScore * 100).toFixed(1)}%</p>
                </div>

                {/* Severity Override */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#556b57] mb-1">
                    Confirmed Alert Severity
                  </label>
                  <select
                    value={assignForm.severity}
                    onChange={(e) => setAssignForm({ ...assignForm, severity: e.target.value })}
                    className="w-full border border-[#cfd9ca] px-3 py-2 text-xs outline-none focus:border-[#205e38]"
                  >
                    <option value="Low">Low - Monitored Routine</option>
                    <option value="Medium">Medium - Standard Precaution</option>
                    <option value="High">High - Prompt Field Action Required</option>
                    <option value="Critical">Critical - Immediate Outbreak Hazard</option>
                  </select>
                </div>

                {/* Real Registered Field Officer Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#556b57] mb-1">
                    Assign Field Agronomist / Officer
                  </label>
                  <select
                    required
                    value={assignForm.officerId}
                    onChange={(e) => setAssignForm({ ...assignForm, officerId: e.target.value })}
                    className="w-full border border-[#cfd9ca] px-3 py-2 text-xs outline-none focus:border-[#205e38]"
                  >
                    <option value="" disabled>Select an active officer...</option>
                    {officers.map((off) => (
                      <option key={off._id} value={off._id}>
                        {off.fullName} ({off.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Administrative Instruction Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#556b57] mb-1">
                    Administrative Directives / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={assignForm.adminNotes}
                    onChange={(e) => setAssignForm({ ...assignForm, adminNotes: e.target.value })}
                    className="w-full border border-[#cfd9ca] p-2.5 text-xs outline-none focus:border-[#205e38]"
                    placeholder="Provide specific notes or directives for the field officer..."
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-[#e6ece2] pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 border border-[#ccd8c8] text-xs font-bold uppercase text-[#556957]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#205e38] hover:bg-[#154627] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition disabled:opacity-70"
                  >
                    {submitting ? 'Dispatching...' : 'Verify & Dispatch Officer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
