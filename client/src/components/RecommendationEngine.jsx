import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';
import {
  Lightbulb,
  Droplets,
  Wind,
  ShieldCheck,
  Calculator,
  Sprout,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  FlaskConical,
  Calendar,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function RecommendationEngine({ defaultCrop = 'Tomato', defaultDisease = 'Tomato___Early_blight' }) {
  const { user } = useContext(AuthContext);
  const [crop, setCrop] = useState(defaultCrop);
  const [disease, setDisease] = useState(defaultDisease);
  const [advisoryData, setAdvisoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dosage calculator state
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcInput, setCalcInput] = useState({
    acreage: '1.0',
    tankSize: '16',
    dosagePerLiter: '2.5'
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const crops = [
    { name: 'Tomato', defaultDisease: 'Tomato___Early_blight' },
    { name: 'Potato', defaultDisease: 'Potato___Early_blight' },
    { name: 'Apple', defaultDisease: 'Apple___Apple_scab' },
    { name: 'Corn', defaultDisease: 'Corn_(maize)___Common_rust' },
    { name: 'Grape', defaultDisease: 'Grape___Black_rot' }
  ];

  const fetchAdvisories = async (selectedCrop, selectedDisease) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/recommendations/advisories?crop=${selectedCrop}&disease=${selectedDisease}`);
      setAdvisoryData(res.data);
    } catch (err) {
      console.warn('Advisory fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories(crop, disease);
  }, [crop, disease]);

  const handleCropChange = (cName) => {
    setCrop(cName);
    const matched = crops.find(c => c.name === cName);
    if (matched) {
      setDisease(matched.defaultDisease);
    }
  };

  const runDosageCalculation = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/recommendations/calculate-dosage`, {
        farmAcreage: calcInput.acreage,
        tankCapacityLiters: calcInput.tankSize,
        dilutionPerLiterGrams: calcInput.dosagePerLiter
      });
      setCalcResult(res.data);
    } catch (err) {
      alert('Failed to calculate dosage.');
    } finally {
      setCalculating(false);
    }
  };

  const userRole = user?.role || 'farmer';
  const roleSpecificAdvisories = advisoryData?.recommendationsByRole?.[userRole] || [];

  return (
    <section className="border border-[#dce4d8] bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-rise">
      {/* Engine Title & Crop Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5ebe1] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#2d6f43]">
            <Sparkles size={16} />
            <span>AI Real-Time Agronomic Advisor</span>
          </div>
          <h2 className="display-face text-2xl font-bold text-[#1a3824] mt-1">
            Live Field & Crop Recommendations
          </h2>
          <p className="text-xs text-[#6e7e70] mt-0.5">
            Synchronized with local microclimate conditions, pathogen biology, and role-tailored agronomic protocols.
          </p>
        </div>

        {/* Quick Crop Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border border-[#d5ded1] p-1 bg-[#fafcfa]">
          {crops.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleCropChange(c.name)}
              className={`px-3 py-1.5 text-xs font-bold transition ${
                crop === c.name
                  ? 'bg-[#205e38] text-white shadow-xs'
                  : 'text-[#566e5a] hover:bg-[#edf5ea]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Real-Time Microclimate Windows (Spray & Irrigation) */}
      {advisoryData?.environment && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Spray Window Status */}
          <div className={`border p-4.5 flex flex-col justify-between ${
            advisoryData.environment.sprayWindow.color === 'green'
              ? 'border-[#cfe4cb] bg-[#f2f8ef]'
              : advisoryData.environment.sprayWindow.color === 'amber'
              ? 'border-[#f5dfb8] bg-[#fef9ee]'
              : 'border-[#f3c2b8] bg-[#fdf2ef]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#355238]">
                  <Droplets size={15} className="text-[#3b7e49]" /> Real-Time Spray Window
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                  advisoryData.environment.sprayWindow.color === 'green'
                    ? 'bg-[#d8eed4] text-[#1c5528]'
                    : 'bg-[#ffeed6] text-[#935212]'
                }`}>
                  {advisoryData.environment.sprayWindow.status}
                </span>
              </div>
              <p className="mt-2.5 text-xs font-semibold text-[#29422f] leading-relaxed">
                {advisoryData.environment.sprayWindow.recommendation}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-[#5e7762] border-t border-black/5 pt-2">
              <span>Wind: {advisoryData.environment.windSpeed} km/h</span>
              <span>·</span>
              <span>Humidity: {advisoryData.environment.humidity}%</span>
              <span>·</span>
              <span>Rain: {advisoryData.environment.precipitation} mm</span>
            </div>
          </div>

          {/* Irrigation & Water Schedule */}
          <div className="border border-[#d2e2ce] bg-[#f6faf4] p-4.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2d5236]">
                  <Sprout size={15} className="text-[#3b7e49]" /> Irrigation Advisory
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 uppercase bg-[#e2ebd9] text-[#2c5b36]">
                  Microclimate-Tuned
                </span>
              </div>
              <p className="mt-2.5 text-xs font-semibold text-[#29422f] leading-relaxed">
                {advisoryData.environment.irrigation}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-[#5e7762] border-t border-black/5 pt-2 flex items-center gap-1.5">
              <Clock size={12} /> Optimal timing: 06:00 AM – 08:30 AM to minimize evaporation
            </div>
          </div>
        </div>
      )}

      {/* 2. Role-Tailored Real-Time Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#556d59] flex items-center gap-1.5">
            <Lightbulb size={15} className="text-[#b57f1e]" />
            <span>Priority Action Directives for {userRole.toUpperCase()}</span>
          </p>
          <span className="text-[11px] font-semibold text-[#3b7e49]">
            {crop} · {advisoryData?.pathogen?.pathogenType || 'Pathology Protocol'}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {roleSpecificAdvisories.map((rec, idx) => (
            <div key={idx} className="border border-[#e1e9dd] bg-[#fafcfa] p-4 flex flex-col justify-between">
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 uppercase mb-2 ${
                  rec.type === 'red' ? 'bg-[#fee8e3] text-[#9c2b18]' :
                  rec.type === 'amber' ? 'bg-[#ffeed6] text-[#935212]' :
                  rec.type === 'blue' ? 'bg-[#edf4ff] text-[#1e5899]' :
                  'bg-[#eaf5e6] text-[#2a6839]'
                }`}>
                  Directive 0{idx + 1}
                </span>
                <h4 className="font-bold text-sm text-[#1e3c26]">{rec.title}</h4>
                <p className="mt-1.5 text-xs text-[#526654] leading-relaxed">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Comprehensive Scientific Treatment Protocols */}
      {advisoryData?.pathogen && (
        <div className="border border-[#e1e9dd] bg-[#fafcfa] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5ece1] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#687f6b]">Scientific Treatment Protocol</span>
              <h3 className="font-bold text-base text-[#1c3a23] capitalize">
                {disease.replace(/___/g, ' · ').replace(/_/g, ' ')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCalculatorOpen(!calculatorOpen)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#205e38] border border-[#205e38] bg-white px-3 py-1.5 hover:bg-[#edf6ea] transition"
            >
              <Calculator size={14} />
              <span>{calculatorOpen ? 'Hide Dosage Calculator' : 'Field Dosage Calculator'}</span>
            </button>
          </div>

          {/* Interactive Farm Dosage Calculator Drawer */}
          {calculatorOpen && (
            <div className="border border-[#cde0ca] bg-[#f2f8ef] p-4.5 rounded-xs animate-rise">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1e562c] mb-3">
                <FlaskConical size={16} /> Interactive Tank & Chemical Dilution Calculator
              </div>

              <form onSubmit={runDosageCalculation} className="grid sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-[#556957] mb-1">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={calcInput.acreage}
                    onChange={(e) => setCalcInput({ ...calcInput, acreage: e.target.value })}
                    className="w-full border border-[#cfd9ca] bg-white px-2.5 py-1.5 outline-none focus:border-[#205e38]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#556957] mb-1">Sprayer Tank Size (Liters)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={calcInput.tankSize}
                    onChange={(e) => setCalcInput({ ...calcInput, tankSize: e.target.value })}
                    className="w-full border border-[#cfd9ca] bg-white px-2.5 py-1.5 outline-none focus:border-[#205e38]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#556957] mb-1">Dosage per Liter (g or ml)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={calcInput.dosagePerLiter}
                    onChange={(e) => setCalcInput({ ...calcInput, dosagePerLiter: e.target.value })}
                    className="w-full border border-[#cfd9ca] bg-white px-2.5 py-1.5 outline-none focus:border-[#205e38]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={calculating}
                    className="w-full bg-[#205e38] hover:bg-[#154627] text-white py-2 font-bold uppercase tracking-wider text-xs transition"
                  >
                    {calculating ? 'Calculating...' : 'Compute Mixing'}
                  </button>
                </div>
              </form>

              {calcResult && (
                <div className="mt-4 border-t border-[#d5e7d1] pt-3 grid sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white border border-[#d2e5ce] p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#6f8371]">Total Water</p>
                    <p className="text-base font-bold text-[#1f4728]">{calcResult.totalWaterNeededLiters} L</p>
                  </div>
                  <div className="bg-white border border-[#d2e5ce] p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#6f8371]">Chemical Needed</p>
                    <p className="text-base font-bold text-[#1f4728]">{calcResult.totalChemicalNeededKg} kg</p>
                  </div>
                  <div className="bg-white border border-[#d2e5ce] p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#6f8371]">Knapsack Loads</p>
                    <p className="text-base font-bold text-[#1f4728]">{calcResult.totalKnapsackTanks} Tanks</p>
                  </div>
                  <div className="bg-white border border-[#d2e5ce] p-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#6f8371]">Per Tank Dose</p>
                    <p className="text-base font-bold text-[#1f4728]">{calcResult.chemicalPerTankGrams} g/tank</p>
                  </div>
                  <div className="sm:col-span-4 bg-white border border-[#d2e5ce] p-3 text-[11px] text-[#425d45]">
                    <span className="font-bold">Mixing Protocol: </span>{calcResult.mixingInstructions}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Organic & Biological Solutions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-[#d0e4cb] bg-[#f4f9f2] p-4">
              <span className="text-xs font-bold text-[#235832] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sprout size={15} /> Organic & Biological Remedy
              </span>
              <div className="space-y-2 text-xs">
                {advisoryData.pathogen.organicSolutions?.map((sol, i) => (
                  <div key={i} className="border-b border-black/5 pb-2 last:border-0">
                    <p className="font-bold text-[#1e4527]">{sol.remedy} ({sol.dosage})</p>
                    <p className="text-[11px] text-[#556d58] mt-0.5">{sol.timing}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Targeted Chemical Solutions */}
            <div className="border border-[#eedbc4] bg-[#fdf9f4] p-4">
              <span className="text-xs font-bold text-[#83461b] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FlaskConical size={15} /> Chemical & Fungicidal Prescription
              </span>
              <div className="space-y-2 text-xs">
                {advisoryData.pathogen.chemicalSolutions?.map((chem, i) => (
                  <div key={i} className="border-b border-black/5 pb-2 last:border-0">
                    <p className="font-bold text-[#623717]">{chem.chemical} ({chem.dosage})</p>
                    <p className="text-[11px] text-[#71543b] mt-0.5">
                      PHI: {chem.phiDays} days · {chem.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cultural Practices */}
          <div className="bg-white border border-[#e1e9dd] p-4 text-xs">
            <p className="font-bold uppercase tracking-wider text-[#49654e] mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-[#3b7e49]" /> Agronomic Cultural Sanitation
            </p>
            <ul className="grid sm:grid-cols-3 gap-2 text-[#516854]">
              {advisoryData.pathogen.culturalPractices?.map((prac, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#3b7e49] font-bold">✓</span>
                  <span>{prac}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
