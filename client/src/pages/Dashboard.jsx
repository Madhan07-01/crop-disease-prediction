import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChevronDown, Leaf, LogOut, ShieldCheck, Sprout, UserRoundCog, ArrowLeftRight, UserCheck } from 'lucide-react';
import FarmerDashboard from './dashboards/FarmerDashboard';
import OfficerDashboard from './dashboards/OfficerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import WeatherWidget from '../components/WeatherWidget';

const dashboards = {
  farmer: {
    label: 'Farmer Workspace',
    icon: Sprout,
    view: FarmerDashboard,
    color: 'text-[#2e7445]',
    demoEmail: 'farmer@agrivision.com',
    demoPass: 'Farmer@123'
  },
  officer: {
    label: 'Field Officer Workspace',
    icon: UserRoundCog,
    view: OfficerDashboard,
    color: 'text-[#20587f]',
    demoEmail: 'officer@agrivision.com',
    demoPass: 'Officer@123'
  },
  admin: {
    label: 'Central Administration',
    icon: ShieldCheck,
    view: AdminDashboard,
    color: 'text-[#824424]',
    demoEmail: 'admin@agrivision.com',
    demoPass: 'Admin@123'
  }
};

export default function Dashboard() {
  const { user, login, logout } = useContext(AuthContext);
  const [activeRole, setActiveRole] = useState(user?.role || 'farmer');
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user?.role]);

  const handleInstantRoleLogin = async (targetRole) => {
    const target = dashboards[targetRole];
    if (!target) return;
    setSwitching(true);
    setShowWorkspaces(false);
    try {
      await login(target.demoEmail, target.demoPass);
      setActiveRole(targetRole);
    } catch (err) {
      console.warn('Instant role switch notice:', err.message);
      setActiveRole(targetRole); // fallback to view switch
    } finally {
      setSwitching(false);
    }
  };

  const active = dashboards[activeRole] || dashboards.farmer;
  const ActiveView = active.view;
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-[#16271c]">
      {/* Top Header with Weather & Timezone */}
      <header className="sticky top-0 z-30 border-b border-[#dce4d8] bg-[#f5f7f2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-[#1d5735] text-white shadow-md shadow-[#1d5735]/20">
              <Leaf size={20} />
            </span>
            <div>
              <p className="text-sm font-bold tracking-[.18em] text-[#1a442a]">AGRIVISION</p>
              <p className="hidden text-xs text-[#718273] sm:block">Integrated Crop Pathology Portal</p>
            </div>
          </div>

          {/* Center Compact Weather & Timezone */}
          <div className="hidden lg:block">
            <WeatherWidget compact />
          </div>

          {/* Right User & Role Workspace Switcher */}
          <div className="flex items-center gap-3">
            {/* Workspace Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWorkspaces(!showWorkspaces)}
                disabled={switching}
                className="flex items-center gap-2 border border-[#d2ded0] bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#2e5237] shadow-sm transition hover:border-[#8bb187]"
              >
                <ActiveIcon size={16} className={active.color} />
                <span className="hidden sm:inline">{active.label}</span>
                <ChevronDown size={14} />
              </button>

              {showWorkspaces && (
                <div className="absolute right-0 top-[calc(100%+.5rem)] w-80 border border-[#d2ded0] bg-white p-2.5 shadow-xl z-50">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#798a7b] border-b border-[#ebf0e8] mb-1">
                    Select Platform Role
                  </p>
                  {Object.entries(dashboards).map(([roleKey, item]) => {
                    const Icon = item.icon;
                    const isCurrentRole = roleKey === user?.role;
                    return (
                      <div
                        key={roleKey}
                        className={`p-2 rounded mb-1 transition ${
                          activeRole === roleKey ? 'bg-[#edf6ea]' : 'hover:bg-[#f6f9f3]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              setActiveRole(roleKey);
                              setShowWorkspaces(false);
                            }}
                            className="flex items-center gap-2.5 text-xs font-bold text-left flex-1"
                          >
                            <Icon size={16} className={item.color} />
                            <span>{item.label}</span>
                          </button>

                          {isCurrentRole ? (
                            <span className="text-[9px] font-bold uppercase bg-[#d9ebd4] px-1.5 py-0.5 text-[#2b603a]">
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInstantRoleLogin(roleKey)}
                              className="text-[10px] font-bold text-[#1b552d] border border-[#2d6f43] bg-white px-2 py-0.5 hover:bg-[#2d6f43] hover:text-white transition"
                              title={`Log in fully as ${item.label}`}
                            >
                              Log in
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="hidden border-l border-[#d8e2d4] pl-3 text-right sm:block">
              <p className="text-xs font-bold text-[#233d2a]">{user?.fullName || 'User'}</p>
              <p className="text-[11px] capitalize text-[#6b7c6d]">{user?.role || 'farmer'} account</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center text-[#933b2f] hover:bg-[#feece8] transition"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace View */}
      <main className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 lg:px-10">
        <div className="animate-rise mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#697d6a]">
            <span>Active View: {active.label}</span>
            {activeRole !== user?.role && (
              <span className="bg-[#fff1db] text-[#935919] px-2 py-0.5 rounded text-[10px] font-bold">
                Viewing Mode
              </span>
            )}
          </div>
          <div className="lg:hidden">
            <WeatherWidget compact />
          </div>
        </div>

        <ActiveView roleView={activeRole} />
      </main>
    </div>
  );
}
