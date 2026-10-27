import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Loader2,
  Sprout,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  X,
  Smartphone,
  Monitor
} from 'lucide-react';
import ResultsModal from './ResultsModal';

export default function Scanner({ onScanComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropName, setCropName] = useState('Tomato');
  const [farmLocation, setFarmLocation] = useState('North Acre - Plot A');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // In-app WebRTC webcam state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Native input refs
  const nativeCameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const crops = ['Tomato', 'Potato', 'Apple', 'Corn (Maize)', 'Grape', 'Bell Pepper', 'Strawberry', 'Other Crop'];

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5 MB.');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
      stopLiveCamera();
    }
  };

  // Launch Live WebRTC Camera Stream
  const startLiveCamera = async () => {
    setError('');
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        // Fallback directly to native phone camera
        nativeCameraInputRef.current?.click();
        setCameraLoading(false);
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (envErr) {
        // Fallback for laptop webcams without 'environment' rear camera support
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      // Wait a tick for <video> element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch((playErr) => {
            console.warn('Video play auto-trigger notice:', playErr.message);
          });
        }
      }, 100);
    } catch (err) {
      console.warn('Webcam access issue, falling back to native phone camera:', err.message);
      nativeCameraInputRef.current?.click();
    } finally {
      setCameraLoading(false);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Capture frame from active live webcam stream
  const captureFromVideo = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const capturedFile = new File([blob], `leaf_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(capturedFile);
          setPreview(URL.createObjectURL(capturedFile));
          stopLiveCamera();
        }
      }, 'image/jpeg', 0.95);
    } catch (snapErr) {
      setError('Unable to capture frame. Please use device camera or file upload.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setError('');
    stopLiveCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please take a photo with the camera or upload a leaf image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('cropName', cropName);
    formData.append('farmLocation', farmLocation);
    formData.append('notes', notes);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image. Please ensure the AI microservice is active on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ResultsModal
        result={result}
        onReset={() => {
          setResult(null);
          handleReset();
          if (onScanComplete) onScanComplete();
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#dce4d8] p-6 sm:p-9 shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e5ebe1] pb-5 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#5e7762]">
          <Sprout size={16} className="text-[#2d6f43]" />
          <span>Intelligent Diagnostic Intake</span>
        </div>
        <h2 className="display-face text-3xl font-bold text-[#1b3a24] mt-1">Submit Field Leaf Diagnosis</h2>
        <p className="text-sm text-[#667768] mt-1">
          Capture using your mobile camera in the field, use the live webcam viewfinder, or choose from device storage.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 border-l-4 border-[#b44938] bg-[#fff2ef] p-4 text-xs font-semibold text-[#8f3427]">
          <AlertCircle size={17} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Mobile Camera Shutter Input (capture="environment" launches phone rear camera directly) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 2. Device Gallery / Storage File Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crop Species & Plot Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#546b57] mb-1.5 flex items-center gap-1.5">
              <Sprout size={14} className="text-[#3b7e49]" /> Crop Species
            </label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full border border-[#cfd9ca] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2d6f43]"
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#546b57] mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#3b7e49]" /> Field Plot / Block
            </label>
            <input
              type="text"
              required
              placeholder="e.g. North Acre - Plot 3B"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              className="w-full border border-[#cfd9ca] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2d6f43]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#546b57] mb-1.5 flex items-center gap-1.5">
            <FileText size={14} className="text-[#3b7e49]" /> Field Observations / Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Yellow margins and brown necrosis spotted on 4 plants"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-[#cfd9ca] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2d6f43]"
          />
        </div>

        {/* Input Zone: Camera Viewfinder / Preview / Capture Options */}
        <div className="border border-[#cfdac9] bg-[#fafcfa] p-5">
          {/* Active Live Webcam Viewfinder */}
          {isCameraActive ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-lg aspect-video bg-neutral-900 overflow-hidden border-2 border-[#2d6f43] shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder crosshairs */}
                <div className="absolute inset-0 border-2 border-white/40 pointer-events-none m-8 rounded-lg flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded">
                    Position Leaf Within Frame
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureFromVideo}
                  className="flex items-center gap-2 bg-[#205e38] hover:bg-[#154627] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition"
                >
                  <Camera size={16} /> Snap Photo Now
                </button>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="flex items-center gap-1 border border-[#cfd9ca] bg-white px-4 py-2.5 text-xs font-bold uppercase text-[#556957]"
                >
                  <X size={15} /> Close Viewfinder
                </button>
              </div>
            </div>
          ) : preview ? (
            /* Selected / Captured Image Preview */
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <img
                src={preview}
                alt="Captured Leaf Preview"
                className="max-h-64 max-w-full object-contain border border-[#cfd9ca] shadow-sm bg-white"
              />
              <p className="mt-3 text-xs font-bold text-[#2d6f43] flex items-center gap-1">
                <CheckCircle2 size={15} /> Leaf photo ready for AI analysis
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 border border-[#2d6f43] bg-[#edf6ea] text-[#1c4e2b] px-3.5 py-1.5 text-xs font-bold"
                >
                  <Camera size={13} /> Retake with Camera
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-1.5 border border-[#cfd9ca] bg-white text-[#526654] px-3.5 py-1.5 text-xs font-bold"
                >
                  <FolderOpen size={13} /> Choose Another File
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#a03e29] font-bold hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            /* Choice of 3 Simple Capture Channels */
            <div className="flex flex-col items-center justify-center text-center p-5 space-y-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#edf6ea] text-[#2d6f43]">
                <Camera size={26} />
              </div>

              <div>
                <p className="text-base font-bold text-[#1f3a25]">Select Leaf Image Source</p>
                <p className="text-xs text-[#6e7f6f] mt-0.5">
                  Designed for mobile field use and desktop uploads.
                </p>
              </div>

              {/* Three Targeted Action Buttons */}
              <div className="grid sm:grid-cols-3 gap-3 w-full max-w-xl pt-2">
                {/* 1. Mobile Native Camera Button */}
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border border-[#205e38] bg-[#205e38] hover:bg-[#154627] text-white p-4 shadow-sm transition"
                >
                  <Smartphone size={22} />
                  <span className="text-xs font-bold uppercase tracking-wider">Mobile Camera</span>
                  <span className="text-[10px] opacity-80 font-normal">Opens phone rear shutter</span>
                </button>

                {/* 2. Device Gallery / Storage Picker */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border border-[#205e38] bg-white hover:bg-[#f3f7f0] text-[#205e38] p-4 shadow-sm transition"
                >
                  <FolderOpen size={22} />
                  <span className="text-xs font-bold uppercase tracking-wider">Device Gallery</span>
                  <span className="text-[10px] text-[#697d6a] font-normal">Photos / Storage Files</span>
                </button>

                {/* 3. Live Desktop Webcam Viewfinder */}
                <button
                  type="button"
                  onClick={startLiveCamera}
                  disabled={cameraLoading}
                  className="flex flex-col items-center justify-center gap-2 border border-[#cfd9ca] bg-white hover:bg-[#f6f9f3] text-[#344d37] p-4 shadow-sm transition disabled:opacity-50"
                >
                  <Monitor size={22} className={cameraLoading ? 'animate-spin' : ''} />
                  <span className="text-xs font-bold uppercase tracking-wider">Live Viewfinder</span>
                  <span className="text-[10px] text-[#697d6a] font-normal">Webcam stream in-app</span>
                </button>
              </div>

              <p className="text-[11px] text-[#869687]">
                Supported Formats: JPG, JPEG, PNG (Up to 5 MB)
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
            !file
              ? 'bg-[#e2e9df] text-[#8fa191] cursor-not-allowed'
              : 'bg-[#205e38] hover:bg-[#154627] text-white shadow-md'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Analyzing with PyTorch ResNet50 CNN...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              <span>Diagnose Leaf Disease & Prescribe Protocol</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
