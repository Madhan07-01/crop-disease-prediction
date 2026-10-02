import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpRight, CheckCircle2, ChevronLeft, Clock, FileText, History, Leaf, MapPin, ScanLine, ShieldAlert, Sprout, Tag, UserCheck, X } from 'lucide-react';
import Scanner from '../../components/Scanner';
import WeatherWidget from '../../components/WeatherWidget';
import RecommendationEngine from '../../components/RecommendationEngine';

export default function FarmerDashboard() {
  const [history, setHistory] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:4000/api/history');
      setHistory(res.data.predictions || []);
    } catch (error) {
      console.error('Failed to fetch farmer history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1 bg-[#eaf6e7] text-[#2c6e3b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Resolved</span>;
      case 'treatment_applied':
        return <span className="inline-flex items-center gap-1 bg-[#f5ecff] text-[#6929a5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"><Sprout size={12} /> Treatment Applied</span>;
      case 'under_investigation':
        return <span className="inline-flex items-center gap-1 bg-[#edf4ff] text-[#1b5099] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> Officer Inspecting</span>;
      case 'officer_assigned':
        return <span className="inline-flex items-center gap-1 bg-[#fff6e6] text-[#9c5f11] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"><UserCheck size={12} /> Officer Assigned</span>;
      case 'pending_verification':
      default:
        return <span className="inline-flex items-center gap-1 bg-[#fff0eb] text-[#a03e29] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> Pending Verification</span>;
    }
  };

  const filteredHistory = statusFilter === 'All'
    ? history
    : history.filter((item) => (item.status || 'pending_verification') === statusFilter);

  const activeIncidents = history.filter((i) => (i.status || 'pending_verification') !== 'resolved').length;
  const resolvedCount = history.filter((i) => i.status === 'resolved').length;

  if (showScanner) {
    return (
      <section className="animate-rise space-y-6">
        <button
          onClick={() => setShowScanner(false)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2d6f43] hover:text-[#184627]"
        >
          <ChevronLeft size={17} /> Return to Field Overview
        </button>
        <Scanner onScanComplete={() => { setShowScanner(false); fetchHistory(); }} />
      </section>
    );
  }

  return (
    <div className="space-y-8 animate-rise">
      {/* Top Banner */}
      <section className="bg-[#183d27] text-white p-7 sm:p-9 shadow-md">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8dfaa]">
              Farmer Field Intelligence Workspace
            </p>
            <h1 className="display-face text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 leading-tight">
              Protect Every Leaf. Track Every Solution.
            </h1>
            <p className="mt-3 text-sm text-white/75 max-w-xl leading-relaxed">
              Capture crop leaf imagery, receive immediate ResNet50 neural diagnoses, and coordinate verified field visits with district agricultural officers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center gap-2 bg-[#2d7a46] hover:bg-[#236338] text-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-[#000]/20"
            >
              <ScanLine size={18} /> New Crop Scan <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Live Microclimate Weather and Metrics */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <WeatherWidget />

        {/* Live Farm Summary Card */}
        <article className="border border-[#dce4d8] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#697d6a] border-b border-[#e6ece2] pb-3">
              <Leaf size={16} className="text-[#3b7e49]" />
              <span>Farm Field Status</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="border border-[#e7eee2] bg-[#fafcfa] p-3">
                <p className="text-[11px] font-bold uppercase text-[#738475]">Total Scans</p>
                <p className="display-face text-2xl font-bold text-[#1d3d27] mt-1">{history.length}</p>
              </div>
              <div className="border border-[#e7eee2] bg-[#fafcfa] p-3">
                <p className="text-[11px] font-bold uppercase text-[#a03e29]">Active Issues</p>
                <p className="display-face text-2xl font-bold text-[#a03e29] mt-1">{activeIncidents}</p>
              </div>
              <div className="border border-[#e7eee2] bg-[#fafcfa] p-3">
                <p className="text-[11px] font-bold uppercase text-[#2c6e3b]">Resolved</p>
                <p className="display-face text-2xl font-bold text-[#2c6e3b] mt-1">{resolvedCount}</p>
              </div>
            </div>

            <p className="mt-5 text-xs text-[#596e5c] leading-relaxed">
              {activeIncidents > 0
                ? `${activeIncidents} incident report(s) are actively logged in the district registry for agricultural review.`
                : 'All fields currently monitored are in verified health. Run routine scans during high humidity periods.'}
            </p>
          </div>

          <div className="mt-5 border-t border-[#e6ece2] pt-4">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full text-center text-xs font-bold uppercase tracking-wider text-[#2d6f43] hover:underline"
            >
              + Submit new crop observation
            </button>
          </div>
        </article>
      </div>

      {/* Real-Time Agronomic & Treatment Recommendation Engine */}
      <RecommendationEngine />

      {/* Field Reports History Section */}
      <section className="border border-[#dce4d8] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4ebe0] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <History size={19} className="text-[#367948]" />
              <h2 className="text-xl font-bold text-[#203a27]">My Field Incident Reports</h2>
            </div>
            <p className="text-xs text-[#6e7e70] mt-0.5">Real-time status tracking from submission to officer treatment verification.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap border border-[#d5dfd1] p-0.5 text-xs font-bold">
            {['All', 'pending_verification', 'officer_assigned', 'under_investigation', 'treatment_applied', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 capitalize transition ${
                  statusFilter === st ? 'bg-[#205e38] text-white' : 'text-[#5d6f5f] hover:bg-[#f2f6f0]'
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
              Loading field registry from server...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <Leaf size={32} className="text-[#a5b9a2] mx-auto mb-2" />
              <p className="font-bold text-[#2d4734]">No reports match this status.</p>
              <p className="text-xs text-[#6e7e70] mt-1">Take a leaf photo anytime to log an incident.</p>
              <button
                onClick={() => setShowScanner(true)}
                className="mt-4 border border-[#2d6f43] text-[#2d6f43] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#edf6ea]"
              >
                Start First Scan
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e6ece2]">
              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedReport(item)}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-2 hover:bg-[#fbfdf9] cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#1e3c26] capitalize">
                        {item.predictedDisease.replace(/___/g, ' · ').replace(/_/g, ' ')}
                      </span>
                      {getStatusBadge(item.status)}
                      <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                        item.severity === 'Critical' ? 'bg-[#fde2dc] text-[#932c1b]' :
                        item.severity === 'High' ? 'bg-[#ffeedb] text-[#935212]' :
                        'bg-[#edf5ea] text-[#336e3f]'
                      }`}>
                        {item.severity || 'Medium'} Severity
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#677769]">
                      <span className="flex items-center gap-1 font-semibold text-[#425945]">
                        <Tag size={13} className="text-[#3b7e49]" /> {item.cropName || 'Crop'}
                      </span>
                      {item.farmLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#3b7e49]" /> {item.farmLocation}
                        </span>
                      )}
                      <span>Confidence: {(item.confidenceScore * 100).toFixed(1)}%</span>
                      <span>Scanned: {new Date(item.scannedAt).toLocaleDateString()} at {new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {item.assignedOfficerName && (
                      <p className="text-[11px] font-semibold text-[#20577d]">
                        Field Officer: {item.assignedOfficerName}
                      </p>
                    )}
                  </div>

                  <button
                    className="grid h-8 w-8 place-items-center border border-[#d2dfcd] text-[#2d6f43] group-hover:bg-[#eaf4e6] shrink-0"
                    title="View Full Diagnosis Record"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-rise">
          <div className="max-w-2xl w-full bg-white border border-[#dce4d8] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e6ece2] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#697d6a]">
                  Report Record #{selectedReport._id}
                </span>
                <h3 className="text-xl font-bold text-[#1a3824] capitalize mt-0.5">
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

            <div className="mt-5 space-y-5 text-xs text-[#445747]">
              <div className="grid grid-cols-2 gap-3 bg-[#fafcfa] border border-[#e4ece0] p-3.5">
                <div>
                  <span className="font-bold text-[#697d6a] uppercase">Current Lifecycle Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <span className="font-bold text-[#697d6a] uppercase">AI Confidence & Severity:</span>
                  <p className="font-bold text-sm text-[#1d3d27] mt-1">
                    {(selectedReport.confidenceScore * 100).toFixed(1)}% · {selectedReport.severity || 'Medium'} Severity
                  </p>
                </div>
                <div>
                  <span className="font-bold text-[#697d6a] uppercase">Plot Location:</span>
                  <p className="font-semibold mt-1">{selectedReport.farmLocation || 'Main Field'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#697d6a] uppercase">Assigned Officer:</span>
                  <p className="font-semibold mt-1 text-[#255f8a]">{selectedReport.assignedOfficerName || 'Awaiting Admin Assignment'}</p>
                </div>
              </div>

              {selectedReport.notes && (
                <div>
                  <p className="font-bold uppercase tracking-wider text-[#697d6a]">Farmer Notes:</p>
                  <p className="mt-1 border-l-2 border-[#3b7e49] bg-[#f8faf7] p-2.5 text-xs italic">
                    "{selectedReport.notes}"
                  </p>
                </div>
              )}

              {/* Officer Field Readings (if available) */}
              {selectedReport.fieldReadings ? (
                <div className="border border-[#cfe0cb] bg-[#f4f9f2] p-4">
                  <div className="flex items-center gap-2 font-bold text-[#1f562e] uppercase tracking-wider mb-2">
                    <UserCheck size={16} /> Verified Field Investigation Readings
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="bg-white border border-[#d3e3cf] p-2">
                      <p className="text-[10px] uppercase font-bold text-[#6b7e6d]">Soil pH</p>
                      <p className="text-base font-bold text-[#204a29]">{selectedReport.fieldReadings.soilPh ?? 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-[#d3e3cf] p-2">
                      <p className="text-[10px] uppercase font-bold text-[#6b7e6d]">Moisture</p>
                      <p className="text-base font-bold text-[#204a29]">{selectedReport.fieldReadings.moisturePercent ? `${selectedReport.fieldReadings.moisturePercent}%` : 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-[#d3e3cf] p-2">
                      <p className="text-[10px] uppercase font-bold text-[#6b7e6d]">Affected Area</p>
                      <p className="text-base font-bold text-[#204a29]">{selectedReport.fieldReadings.affectedAreaPercent ? `${selectedReport.fieldReadings.affectedAreaPercent}%` : 'N/A'}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-xs text-[#2b4c32]">
                    Action Taken: {selectedReport.fieldReadings.actionTaken}
                  </p>
                  {selectedReport.fieldReadings.notes && (
                    <p className="text-xs text-[#526a54] mt-1">
                      Remarks: {selectedReport.fieldReadings.notes}
                    </p>
                  )}
                  <p className="text-[10px] text-[#718573] mt-2">
                    Recorded by {selectedReport.fieldReadings.officerName} on {new Date(selectedReport.fieldReadings.recordedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="border border-[#e7ede2] bg-[#fbfcfb] p-3 text-xs text-[#6c7d6e]">
                  Field officer physical assessment pending. Treatment protocols below may be initiated immediately.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-[#e6ece2] pt-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-[#205e38] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
