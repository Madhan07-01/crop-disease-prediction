import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Sprout, MapPin, Tag, ChevronRight, FileCheck2 } from 'lucide-react';

export default function ResultsModal({ result, onReset }) {
  const isHealthy = result.prediction.toLowerCase().includes('healthy');
  const formattedDisease = result.prediction.replace(/___/g, ' · ').replace(/_/g, ' ');

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#dce4d8] shadow-md overflow-hidden animate-rise">
      {/* Header Banner */}
      <div className={`p-6 text-white ${isHealthy ? 'bg-[#1e5834]' : 'bg-[#983827]'} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center bg-white/10 rounded-full border border-white/20">
            {isHealthy ? <CheckCircle2 className="w-7 h-7 text-[#abf29a]" /> : <AlertCircle className="w-7 h-7 text-[#ffcdca]" />}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-white/75">
              {isHealthy ? 'Pathogen Negative' : 'Pathogen Detected'} · {result.cropName || 'Crop'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-0.5 capitalize">
              {formattedDisease}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
            {(result.confidence * 100).toFixed(1)}% Match
          </span>
          <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
            result.severity === 'Critical' ? 'bg-[#4e1107] text-white' :
            result.severity === 'High' ? 'bg-[#ffeedd] text-[#863715]' :
            'bg-white/20 text-white'
          }`}>
            {result.severity || 'Medium'} Severity
          </span>
        </div>
      </div>

      {/* Field metadata snapshot */}
      <div className="bg-[#f7faf4] border-b border-[#e1eadb] px-6 py-3 flex flex-wrap items-center gap-6 text-xs text-[#556958]">
        {result.farmLocation && (
          <span className="flex items-center gap-1.5 font-semibold">
            <MapPin size={14} className="text-[#3b7e49]" /> {result.farmLocation}
          </span>
        )}
        <span className="flex items-center gap-1.5 font-semibold">
          <Tag size={14} className="text-[#3b7e49]" /> Status: Logged for Officer Verification
        </span>
        <span className="flex items-center gap-1.5 ml-auto text-[11px] text-[#788a7b]">
          Scanned: {new Date(result.scannedAt || Date.now()).toLocaleTimeString()}
        </span>
      </div>

      {/* Body: Actionable Treatments */}
      <div className="p-6 sm:p-8 space-y-6">
        {!isHealthy && result.treatment && (
          <>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#697d6a]">Intervention Protocols</p>
              <h3 className="text-xl font-bold text-[#1f3826] mt-1">Recommended Agricultural Treatments</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Organic */}
              <div className="border border-[#cfe0cb] bg-[#f4f9f2] p-5">
                <div className="flex items-center gap-2 text-[#245b34] font-bold text-sm mb-2">
                  <Sprout className="w-5 h-5 text-[#3b7e49]" />
                  <span>Organic & Biological Approach</span>
                </div>
                <p className="text-[#3a4f3e] text-xs leading-relaxed">
                  {result.treatment.organicTreatment || "Consult local organic farming advisor."}
                </p>
              </div>

              {/* Chemical */}
              <div className="border border-[#f0dac5] bg-[#fdf8f2] p-5">
                <div className="flex items-center gap-2 text-[#804217] font-bold text-sm mb-2">
                  <ShieldAlert className="w-5 h-5 text-[#b55e20]" />
                  <span>Chemical / Fungicidal Intervention</span>
                </div>
                <p className="text-[#593d25] text-xs leading-relaxed">
                  {result.treatment.chemicalTreatment || "Consult authorized agricultural officer for chemical prescription."}
                </p>
              </div>
            </div>

            {/* Cultural prevention steps */}
            {result.treatment.preventionSteps && result.treatment.preventionSteps.length > 0 && (
              <div className="border border-[#e1e9dd] bg-white p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#49654e] mb-3">
                  <FileCheck2 size={16} /> Agronomic Prevention & Best Practices
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs text-[#526655]">
                  {result.treatment.preventionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight size={14} className="text-[#3b7e49] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {isHealthy && (
          <div className="p-8 text-center bg-[#f4f8f1] border border-[#d6e5d2]">
            <CheckCircle2 size={40} className="text-[#367c48] mx-auto mb-2" />
            <h3 className="text-xl font-bold text-[#1f3f27]">Healthy Foliage Confirmed</h3>
            <p className="text-sm text-[#5a6e5d] max-w-md mx-auto mt-2 leading-relaxed">
              No evidence of fungal or bacterial pathogen lesions was detected on this sample. Continue scheduled preventive inspections and optimal drip watering.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 bg-[#f6f8f4] border-t border-[#e2e9dd] flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#718573]">Report ID: {result.reportId || 'Saved in Field Records'}</p>
        <button
          onClick={onReset}
          className="bg-[#205e38] hover:bg-[#154627] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm"
        >
          Scan Another Leaf
        </button>
      </div>
    </div>
  );
}
