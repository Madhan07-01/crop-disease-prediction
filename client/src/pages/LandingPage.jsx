import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Clock, Globe, Leaf, ScanLine, ShieldCheck, Sprout, UserCheck, UserRoundCog } from 'lucide-react';
import heroLeaf from '../assets/hero.png';

export default function LandingPage() {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('farmer');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  const quickLogins = [
    {
      role: 'farmer',
      title: 'Farmer Sign-in',
      subtitle: 'Scan leaves & track treatment records',
      email: 'farmer@agrivision.com',
      password: 'Farmer@123',
      icon: Sprout,
      color: 'border-[#2d6f43] bg-[#f0f7ed] text-[#1b4b2b]'
    },
    {
      role: 'officer',
      title: 'Field Officer Sign-in',
      subtitle: 'Manage assignments & record soil/health readings',
      email: 'officer@agrivision.com',
      password: 'Officer@123',
      icon: UserRoundCog,
      color: 'border-[#33688d] bg-[#edf4f8] text-[#1d4562]'
    },
    {
      role: 'admin',
      title: 'Administrator Sign-in',
      subtitle: 'Review diagnostics & verify platform operations',
      email: 'admin@agrivision.com',
      password: 'Admin@123',
      icon: ShieldCheck,
      color: 'border-[#7d4834] bg-[#fcf2ed] text-[#5c2b18]'
    }
  ];

  const handleQuickLogin = async (acc) => {
    setError('');
    setSubmitting(true);
    try {
      await login(acc.email, acc.password);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to sign in as ${acc.title}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.fullName, formData.email, formData.password, role);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#11311f] px-5 py-6 text-white sm:px-8 lg:px-12">
      {/* Top Bar with Timezone */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-[#2d6f43] text-white shadow-md">
            <Leaf size={20} />
          </span>
          <div>
            <span className="text-base font-bold tracking-[.18em]">AGRIVISION</span>
            <span className="hidden text-xs text-white/60 sm:inline ml-2">Crop Health & Diagnostic Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/80">
          <Globe size={14} className="text-[#96df87]" />
          <span>{clientTimezone}</span>
        </div>
      </nav>

      {/* Hero & Quick Roles Grid */}
      <section className="relative z-10 mx-auto max-w-7xl pt-10 pb-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          {/* Left Column: Mission & 1-Click Role Direct Sign-In */}
          <div className="animate-rise space-y-8">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#bce7aa]">
                <ScanLine size={16} /> Role-Separated Architecture
              </p>
              <h1 className="display-face mt-3 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                Integrated Crop Disease Detection & Field Operations.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
                From real-time CNN leaf diagnosis to field officer investigation and administrative verification—every agricultural role is cleanly separated and fully actionable.
              </p>
            </div>

            {/* Quick 1-Click Role Login Cards */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#bde8aa]">
                Fast Role Direct Access:
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickLogins.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      disabled={submitting}
                      onClick={() => handleQuickLogin(acc)}
                      className={`group flex flex-col justify-between border p-4 text-left shadow-md transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 ${acc.color}`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <Icon size={20} />
                          <ArrowRight size={14} className="opacity-60 transition group-hover:translate-x-1" />
                        </div>
                        <p className="mt-3 font-bold text-sm leading-snug">{acc.title}</p>
                        <p className="mt-1 text-[11px] opacity-80 leading-normal">{acc.subtitle}</p>
                      </div>
                      <div className="mt-4 border-t border-black/10 pt-2 text-[10px] font-mono opacity-70">
                        {acc.email}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Feature Badges */}
            <div className="flex flex-wrap gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#96df87]" /> Open-Meteo Live Weather & Risk</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#96df87]" /> Mobile-Ready Leaf Scanner</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-[#96df87]" /> Organic & Chemical Protocols</span>
            </div>
          </div>

          {/* Right Column: Custom Login / Register Form */}
          <section className="animate-rise w-full max-w-md justify-self-center bg-[#fcfdfa] p-1 text-[#132519] shadow-2xl shadow-black/40">
            <div className="border border-[#d7dfd2] p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#69806c]">Workspace Credentials</p>
                <span className="text-xs font-semibold text-[#307044]">{isLogin ? 'Sign In' : 'New Account'}</span>
              </div>

              <h2 className="display-face mt-2 text-3xl">
                {isLogin ? 'Sign into your portal.' : 'Create your role account.'}
              </h2>

              {error && (
                <div role="alert" className="mt-4 border-l-3 border-[#b44938] bg-[#fff1ee] p-3 text-xs text-[#8f3427]">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                {!isLogin && (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#5f7461]">Full Name</span>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Anand Sundaram"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full border border-[#cfd9ca] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2d6f43] focus:ring-1 focus:ring-[#2d6f43]"
                      />
                    </label>

                    {/* Role Selector */}
                    <div>
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#5f7461]">Platform Role</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'farmer', label: 'Farmer', icon: Sprout },
                          { id: 'officer', label: 'Field Officer', icon: UserRoundCog },
                          { id: 'admin', label: 'Admin', icon: ShieldCheck }
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setRole(item.id)}
                              className={`flex flex-col items-center gap-1 border p-2 text-xs font-bold transition ${
                                role === item.id
                                  ? 'border-[#2d6f43] bg-[#edf7ea] text-[#1d522f]'
                                  : 'border-[#d0dacb] bg-white text-[#637565] hover:bg-[#f6f9f3]'
                              }`}
                            >
                              <Icon size={16} />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#5f7461]">Email Address</span>
                  <input
                    required
                    type="email"
                    placeholder="user@agrivision.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-[#cfd9ca] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2d6f43] focus:ring-1 focus:ring-[#2d6f43]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#5f7461]">Password</span>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-[#cfd9ca] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2d6f43] focus:ring-1 focus:ring-[#2d6f43]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 bg-[#205e38] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#154627] disabled:opacity-70"
                >
                  {submitting ? 'Authenticating...' : isLogin ? 'Access Platform' : `Create ${role.toUpperCase()} Account`}
                  <ArrowRight size={17} />
                </button>
              </form>

              <div className="mt-5 border-t border-[#e2e9de] pt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-xs font-bold text-[#276a3e] hover:underline"
                >
                  {isLogin ? "Need a new account? Register here" : "Already have an account? Sign in here"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
