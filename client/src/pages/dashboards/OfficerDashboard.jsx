import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Clock, FileEdit, MapPin, Route, ShieldAlert, Sprout, Tag, Timer, UserCheck, X } from 'lucide-react';
import WeatherWidget from '../../components/WeatherWidget';
import RecommendationEngine from '../../components/RecommendationEngine';

export default function OfficerDashboard({ roleView }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [activeCase, setActiveCase] = useState(null);
  const [actionForm, setActionForm] = useState({
    soilPh: '6.5',
    moisturePercent: '72',
    affectedAreaPercent: '10',
    actionTaken: 'Applied targeted copper fungicide mist; instructed base drip irrigation.',
    notes: 'Canopy aeration improved through selective pruning. Farmer advised on night humidity.',
    status: 'treatment_applied'
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:4000/api/operations/reports?roleView=officer');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to fetch officer reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenActionModal = (report) => {
    setActiveCase(report);
    setSuccessMsg('');
    if (report.fieldReadings) {
      setActionForm({
        soilPh: report.fieldReadings.soilPh?.toString() || '6.5',
        moisturePercent: report.fieldReadings.moisturePercent?.toString() || '70',
        affectedAreaPercent: report.fieldReadings.affectedAreaPercent?.toString() || '10',
        actionTaken: report.fieldReadings.actionTaken || '',
        notes: report.fieldReadings.notes || '',
        status: report.status || 'treatment_applied'
      });
    } else {
      setActionForm({
        soilPh: '6.5',
        moisturePercent: '70',
        affectedAreaPercent: '10',
        actionTaken: 'Applied targeted fungal spray; pruned infected foliage to isolate outbreak.',
        notes: 'Advised farmer to sanitize tools and avoid overhead watering.',
        status: 'treatment_applied'
      });
    }
  };

  const handleRecordAction = async (e) => {
    e.preventDefault();
    if (!activeCase) return;
    setSubmitting(true);
    try {
      await axios.patch(`http://localhost:4000/api/operations/reports/${activeCase._id}/action`, {
        ...actionForm
      });
      setSuccessMsg('Field investigation and treatment recorded successfully!');
      setTimeout(() => {
        setActiveCase(null);
        fetchReports();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update field report.');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleReports = filter === 'All'
    ? reports
    : reports.filter((r) => r.status === filter);

  const pendingVisits = reports.filter((r) => ['pending_verification', 'officer_assigned'].includes(r.status)).length;
  const inProgress = reports.filter((r) => ['under_investigation', 'treatment_applied'].includes(r.status)).length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-8 animate-rise">
      {/* Officer Header Banner */}
      <section className="bg-[#183928] text-white p-7 sm:p-9 shadow-md">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8dfaa]">
              Agricultural Field Officer Workspace
            </p>
            <h1 className="display-face text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 leading-tight">
              Field Verification & Agronomic Response
            </h1>
            <p className="mt-3 text-sm text-white/75 max-w-xl leading-relaxed">
              Review assigned crop pathology cases, record physical soil & moisture parameters, and coordinate chemical or organic field treatment protocols.
            </p>
          </div>

          <div className="border border-white/15 bg-white/5 p-5">
            <Route size={20} className="text-[#b8dfaa]" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#b8dfaa]">Active Assigned Queue</p>
            <p className="display-face text-3xl font-bold mt-1">{reports.length} Cases</p>
            <p className="text-xs text-white/70 mt-1">{pendingVisits} require initial farm visit</p>
          </div>
        </div>
      </section>

      {/* Weather and Microclimate Status */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <WeatherWidget />

        {/* Operational Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-[#fff1ee] text-[#a03e29]"><ClipboardCheck size={20} /></div>
            <div>
              <p className="text-xs uppercase font-bold text-[#738475]">Pending Farm Visits</p>
              <p className="display-face text-2xl font-bold text-[#a03e29]">{pendingVisits}</p>
            </div>
          </div>
          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-[#edf4ff] text-[#1e5899]"><Timer size={20} /></div>
            <div>
              <p className="text-xs uppercase font-bold text-[#738475]">In Treatment</p>
              <p className="display-face text-2xl font-bold text-[#1e5899]">{inProgress}</p>
            </div>
          </div>
          <div className="border border-[#dce4d8] bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-[#eaf6e7] text-[#2c6e3b]"><UserCheck size={20} /></div>
            <div>
              <p className="text-xs uppercase font-bold text-[#738475]">Resolved Cases</p>
              <p className="display-face text-2xl font-bold text-[#2c6e3b]">{resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Agronomic Prescription & Diagnostic Advisory */}
      <RecommendationEngine />

      {/* Field Investigation Cases Queue */}
      <section className="border border-[#dce4d8] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4ebe0] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={19} className="text-[#367948]" />
              <h2 className="text-xl font-bold text-[#203a27]">Assigned Field Cases & Incidents</h2>
            </div>
            <p className="text-xs text-[#6e7e70] mt-0.5">Select a case to inspect observations and prescribe field treatment.</p>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap border border-[#d5dfd1] p-0.5 text-xs font-bold">
            {['All', 'officer_assigned', 'under_investigation', 'treatment_applied', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 capitalize transition ${
                  filter === st ? 'bg-[#205e38] text-white' : 'text-[#5d6f5f] hover:bg-[#f2f6f0]'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#6e7e70] font-semibold animate-pulse">
              Loading field investigation queue...
            </div>
          ) : visibleReports.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 size={32} className="text-[#367c48] mx-auto mb-2" />
              <p className="font-bold text-[#2d4734]">No field cases match the selected filter.</p>
              <p className="text-xs text-[#6e7e70] mt-1">All assigned tasks in this category are up to date.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e6ece2]">
              {visibleReports.map((item, idx) => (
                <div
                  key={item._id}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 px-2 hover:bg-[#fbfdf9] transition"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#556957]">#{item._id.slice(-6)}</span>
                      <h3 className="font-bold text-base text-[#1b3a24] capitalize truncate">
                        {item.predictedDisease.replace(/___/g, ' · ').replace(/_/g, ' ')}
                      </h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.severity === 'Critical' ? 'bg-[#fde2dc] text-[#932c1b]' :
                        item.severity === 'High' ? 'bg-[#ffeedb] text-[#935212]' :
                        'bg-[#edf5ea] text-[#336e3f]'
                      }`}>
                        {item.severity || 'Medium'}
                      </span>
                      <span className="bg-[#f0f4ee] px-2 py-0.5 text-[10px] font-bold text-[#455b48] capitalize">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#667768]">
                      <span className="font-semibold text-[#2c4c31]">
                        Crop: {item.cropName || 'Crop'}
                      </span>
                      {item.farmLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#3b7e49]" /> {item.farmLocation}
                        </span>
                      )}
                      <span>Farmer: {item.user?.fullName || item.userId?.fullName || 'Local Grower'}</span>
                      <span>Confidence: {(item.confidenceScore * 100).toFixed(1)}%</span>
                      <span>Reported: {new Date(item.scannedAt).toLocaleDateString()}</span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[#526a54] italic">
                        Farmer: "{item.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenActionModal(item)}
                    className="flex items-center gap-1.5 border border-[#2d6f43] bg-[#f2f8ee] hover:bg-[#205e38] hover:text-white text-[#205e38] px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition shrink-0"
                  >
                    <FileEdit size={14} /> Record Inspection
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Field Inspection & Action Recording Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-rise">
          <div className="max-w-2xl w-full bg-white border border-[#dce4d8] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e6ece2] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#697d6a]">
                  Field Inspection Form · Case #{activeCase._id}
                </span>
                <h3 className="text-2xl font-bold text-[#1a3824] capitalize mt-0.5">
                  {activeCase.predictedDisease.replace(/___/g, ' · ').replace(/_/g, ' ')}
                </h3>
              </div>
              <button
                onClick={() => setActiveCase(null)}
                className="grid h-8 w-8 place-items-center text-[#556957] hover:bg-[#f0f4ee]"
              >
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
              <div className="my-8 text-center p-6 bg-[#f0f8ee] border border-[#d2e8cd]">
                <CheckCircle2 size={36} className="text-[#2d6f43] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#1f4a2b]">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRecordAction} className="mt-5 space-y-4">
                {/* Farmer Plot Context */}
                <div className="bg-[#f8faf6] border border-[#e3ebe0] p-3 text-xs text-[#506853]">
                  <p><span className="font-bold">Farm Plot:</span> {activeCase.farmLocation || 'Main Block'}</p>
                  <p><span className="font-bold">Crop:</span> {activeCase.cropName || 'Leaf'}</p>
                  {activeCase.notes && <p><span className="font-bold">Farmer Remark:</span> "{activeCase.notes}"</p>}
                </div>

                {/* Soil & Physical Health Readings */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#556b57] mb-2">
                    Physical Field Measurements:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#627764] mb-1">Soil pH Level</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={actionForm.soilPh}
                        onChange={(e) => setActionForm({ ...actionForm, soilPh: e.target.value })}
                        className="w-full border border-[#cfd9ca] px-3 py-2 text-sm outline-none focus:border-[#205e38]"
                        placeholder="6.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#627764] mb-1">Soil Moisture (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={actionForm.moisturePercent}
                        onChange={(e) => setActionForm({ ...actionForm, moisturePercent: e.target.value })}
                        className="w-full border border-[#cfd9ca] px-3 py-2 text-sm outline-none focus:border-[#205e38]"
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#627764] mb-1">Affected Area (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={actionForm.affectedAreaPercent}
                        onChange={(e) => setActionForm({ ...actionForm, affectedAreaPercent: e.target.value })}
                        className="w-full border border-[#cfd9ca] px-3 py-2 text-sm outline-none focus:border-[#205e38]"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Treatment Prescribed */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#556b57] mb-1">
                    Treatment Action Prescribed / Administered
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={actionForm.actionTaken}
                    onChange={(e) => setActionForm({ ...actionForm, actionTaken: e.target.value })}
                    className="w-full border border-[#cfd9ca] p-3 text-xs outline-none focus:border-[#205e38]"
                    placeholder="Specific fungicide/pesticide dosage, organic spray, or cultural intervention..."
                  />
                </div>

                {/* Agronomist Field Remarks */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#556b57] mb-1">
                    Field Advisory Remarks for Farmer
                  </label>
                  <textarea
                    rows={2}
                    value={actionForm.notes}
                    onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                    className="w-full border border-[#cfd9ca] p-3 text-xs outline-none focus:border-[#205e38]"
                    placeholder="Pruning, irrigation adjustments, preventative guidelines..."
                  />
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#556b57] mb-1">
                    Updated Case Lifecycle Status
                  </label>
                  <select
                    value={actionForm.status}
                    onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                    className="w-full border border-[#cfd9ca] px-3 py-2 text-sm outline-none focus:border-[#205e38]"
                  >
                    <option value="under_investigation">Under Field Investigation</option>
                    <option value="treatment_applied">Treatment Applied / Prescribed</option>
                    <option value="resolved">Case Fully Resolved & Healthy</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 border-t border-[#e6ece2] pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveCase(null)}
                    className="px-4 py-2 border border-[#ccd8c8] text-xs font-bold uppercase text-[#556957]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#205e38] hover:bg-[#154627] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition disabled:opacity-70"
                  >
                    {submitting ? 'Recording...' : 'Save Field Report & Update Status'}
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
