import { useState, useEffect } from 'react';
import LandingPage from "./frontend/components/LandingPage";
import Dashboard from "./frontend/components/Dashboard";
import MeetingRoom from "./frontend/components/MeetingRoom";
import { Video, Bot, Lock, Mail, User as UserIcon, Keyboard, ArrowRight, ShieldAlert } from 'lucide-react';

export default function App() {
  // Navigation / Application layout states
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  
  // Auth users metadata
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Active call specifications
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [activePasscode, setActivePasscode] = useState('');

  // Form parameters
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorText, setErrorText] = useState('');
  const [infoText, setInfoText] = useState('');

  // Persists logins across session restarts
  useEffect(() => {
    const token = localStorage.getItem('intellimeet_token');
    if (token) {
      fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Stale profile');
      })
      .then((data) => {
        // Build mock visual details if empty
        setUser(data);
        setAuthToken(token);
        setCurrentView('dashboard');
      })
      .catch(() => {
        localStorage.removeItem('intellimeet_token');
      });
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    setInfoText('');

    if (!email || !password) {
      setErrorText('Please specify both Email and Password fields.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('intellimeet_token', data.token.replace('Bearer ', ''));
        setCurrentView('dashboard');
        
        // Reset inputs
        setEmail('');
        setPassword('');
      } else {
        const err = await res.json();
        setErrorText(err.error || 'Check login credentials combination.');
      }
    } catch {
      setErrorText('Server communication timed out.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    setInfoText('');

    if (!fullName || !email || !password) {
      setErrorText('All registration fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('intellimeet_token', data.token.replace('Bearer ', ''));
        setInfoText('Registration successful!');
        setTimeout(() => {
          setCurrentView('dashboard');
          setFullName('');
          setEmail('');
          setPassword('');
        }, 1200);
      } else {
        const err = await res.json();
        setErrorText(err.error || 'Registration failed.');
      }
    } catch {
      setErrorText('Server communications timed out.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('intellimeet_token');
    setUser(null);
    setAuthToken(null);
    setCurrentView('landing');
  };

  const handleConnectMeeting = (meetId, customCode) => {
    setActiveMeetingId(meetId);
    setActivePasscode(customCode || '90210');
    setCurrentView('meeting');
  };

  const handleLeaveCall = () => {
    setActiveMeetingId(null);
    setCurrentView('dashboard');
  };

  return (
<div id="intellimeet-app-frame" className="min-h-screen bg-[#E0DFFD] font-sans antialiased text-slate-100">
      
      {/* 1. Landing view layout orchestrator */}
      {currentView === 'landing' && (
        <LandingPage onGetStarted={() => {
          setAuthMode('login');
          setCurrentView('auth');
        }} />
      )}

      {/* 2. Glassmorphic popup auth blocks overlays */}
      {currentView === 'auth' && (
<div id="auth-canvas" className="min-h-screen flex items-center justify-center p-6 relative bg-[#E0DFFD]">
          {/* Backdrops */}
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-900/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-900/10 rounded-full blur-[100px]" />

          <div className="w-full max-w-sm rounded-3xl p-6 md:p-8 bg-slate-900 border border-white/5 shadow-2xl relative z-10 flex flex-col justify-center">
            
            {/* Logo header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold tracking-wide uppercase text-white">IntelliMeet Pro</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">AI-Powered Collaboration</p>
            </div>

            {/* Error & Info Panels */}
            {errorText && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-left flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}
            {infoText && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-left">
                {infoText}
              </div>
            )}

            {/* Login / Register selectors */}
            <div className="flex border-b border-white/5 mb-6">
              <button 
                onClick={() => {
                  setErrorText('');
                  setAuthMode('login');
                }}
                className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider text-center border-b ${
                  authMode === 'login' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setErrorText('');
                  setAuthMode('register');
                }}
                className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider text-center border-b ${
                  authMode === 'register' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'
                }`}
              >
                Register
              </button>
            </div>

            {/* Forms rendering */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#E0DFFD] block mb-1 text-left">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="e.g. john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#E0DFFD]border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#E0DFFD] block mb-1 text-left">Secret Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="Password credentials..." 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#E0DFFD] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 mt-2 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Authorize Profile</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </button>

                <div className="mt-4 border-t border-white/5 pt-4 text-center">
                  <span className="text-[9px] text-slate-500 block">DEMO USERS FOR SANDBOX TESTING:</span>
                  <div className="flex justify-center gap-2 mt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setEmail('sushant@example.com');
                        setPassword('password123');
                      }}
                      className="px-2 py-1 rounded bg-[#E0DFFD] hover:bg-slate-850 text-[9px] hover:text-white border border-white/5 transition-colors"
                    >
                      Sushant (Host)
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setEmail('mayuresh@example.com');
                        setPassword('password123');
                      }}
                      className="px-2 py-1 rounded bg-[#E0DFFD] hover:bg-slate-850 text-[9px] hover:text-white border border-white/5 transition-colors"
                    >
                      Mayuresh (Lead)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1 text-left">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="e.g. Sushant / Mayuresh" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#E0DFFD] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1 text-left">Personal Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="e.g. user@domain.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#E0DFFD] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1 text-left">Secret password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="Password credentials..." 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#E0DFFD] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 mt-2 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Build Profile</span>
                  <ArrowRight className="w-4 h-4 text-indigo-300" />
                </button>
              </form>
            )}

            {/* Back button */}
            <button 
              onClick={() => setCurrentView('landing')}
              className="text-[10px] font-bold text-slate-500 hover:text-white mt-6 bg-transparent"
            >
              ← Back to Overview website
            </button>

          </div>
        </div>
      )}

      {/* 3. Dashboard management viewport */}
      {currentView === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onJoinMeeting={handleConnectMeeting} 
        />
      )}

      {/* 4. Active meeting room viewport orchestration */}
      {currentView === 'meeting' && user && activeMeetingId && (
        <MeetingRoom 
          user={user} 
          meetingId={activeMeetingId} 
          passcode={activePasscode} 
          onLeave={handleLeaveCall} 
        />
      )}

    </div>
  );
}