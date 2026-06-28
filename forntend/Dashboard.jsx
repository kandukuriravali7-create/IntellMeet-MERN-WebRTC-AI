import { useState, useEffect } from 'react';
import { 
  Video, Plus, Calendar, Clock, Sparkles, BarChart2, LogOut, 
  Settings, Key, ListTodo, FileText, ArrowRight, User, RefreshCw, CheckCircle, Flame, ShieldAlert, BookOpen, Layers
} from 'lucide-react';

export default function Dashboard({ user, onLogout, onJoinMeeting }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Input forms state
  const [joinId, setJoinId] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDesc, setScheduleDesc] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState('30');
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  // Selected meeting for detail modal
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [compilingAi, setCompilingAi] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/meetings');
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (e) {
      console.error('Meetings fetch occurred an error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantMeeting = async () => {
    try {
      const res = await fetch('/api/meetings/create-instant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer jwt_token_${user.id}`
        },
        body: JSON.stringify({ title: `${user.name}'s Collaboration Space` }),
      });
      if (res.ok) {
        const meet = await res.json();
        onJoinMeeting(meet.id, meet.passcode);
      }
    } catch (e) {
      console.error('Instant meeting spawn failed:', e);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    setScheduleError('');
    setScheduleSuccess('');

    if (!scheduleTitle || !scheduleDate || !scheduleTime) {
      setScheduleError('Please input Title, Date, and Time parameters.');
      return;
    }

    try {
      const res = await fetch('/api/meetings/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer jwt_token_${user.id}`
        },
        body: JSON.stringify({
          title: scheduleTitle,
          description: scheduleDesc,
          date: scheduleDate,
          startTime: scheduleTime,
          duration: parseInt(scheduleDuration, 10),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScheduleSuccess(`Meeting scheduled with Alphanumeric ID: ${data.meeting.id}`);
        setScheduleTitle('');
        setScheduleDesc('');
        setScheduleDate('');
        setScheduleTime('');
        fetchMeetings();
      } else {
        const err = await res.json();
        setScheduleError(err.error || 'Meeting scheduling failed.');
      }
    } catch (e) {
      setScheduleError('Server communication timeout.');
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    onJoinMeeting(joinId.trim(), joinPasscode.trim());
  };

  const examineMeetingDetails = async (meet) => {
    setSelectedMeeting(meet);
    setAiReport(null);
    setCompilingAi(false);

    // Fetch AI Summarizer logs
    try {
      setCompilingAi(true);
      const res = await fetch(`/api/meetings/${meet.id}/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const parsed = await res.json();
        setAiReport(parsed);
      }
    } catch (err) {
      console.error('AI summary fetch failed:', err);
    } finally {
      setCompilingAi(false);
    }
  };

  // Metrics
  const activeCount = meetings.filter((m) => m.status === 'active').length;
  const totalDuration = meetings.reduce((acc, current) => acc + (current.duration || 30), 0);

  return (
    <div id="dashboard-host" className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-black text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar navigation controls */}
      <aside id="dash-sidebar" className="w-full md:w-64 bg-slate-900 border-r border-white/5 py-6 px-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase">IntelliMeet</span>
              <span className="text-[10px] font-bold block text-indigo-400 -mt-1 uppercase">Control Room</span>
            </div>
          </div>

          {/* User profile layout block */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E0DFFD] /60 border border-white/5 mb-6 hover:bg-slate-900/40 transition-colors duration-200">
            <div 
              className="rounded-full overflow-hidden shrink-0 border border-white/10 relative transition-transform duration-300 hover:scale-110 flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/10"
              style={{ width: '48px', height: '48px' }}
            >
              {/* Default avatar first letter placeholder */}
              <span className="text-white font-extrabold text-lg select-none uppercase">
                {(user?.name || 'U').charAt(0)}
              </span>

              {/* Uploaded Profile Photo supporting profileImage */}
              {user?.profileImage && user.profileImage.trim() !== '' && (
                <img 
                  src={user.profileImage} 
                  referrerPolicy="no-referrer" 
                  alt="User profile avatar" 
                  className="absolute inset-0 w-full h-full object-cover rounded-full z-10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs truncate max-w-full text-white">{user?.name}</h4>
              <p className="text-[10px] text-slate-500 truncate max-w-full">{user?.email}</p>
            </div>
          </div>

          {/* Sidebar Tabs */}
          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                activeTab === 'overview' 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Workspace Hub</span>
            </button>
            <button 
              onClick={() => setActiveTab('sessions')} 
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                activeTab === 'sessions' 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Sessions Index</span>
            </button>
            <button 
              onClick={() => setActiveTab('insights')} 
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                activeTab === 'insights' 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Insights Hub</span>
            </button>
          </nav>
        </div>

        <div>
          {/* Version Credit & Logout */}
          <div className="border-t border-white/5 pt-4">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out profile</span>
            </button>
            <span className="text-[9px] text-slate-600 font-mono block mt-4 text-center">
              INTELLIMEET ENGINE v2.5
            </span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main id="dash-main" className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Top greeting notification rail */}
        <header id="dash-main-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Welcome back, {user.name.split(' ')[0]} 
              <span className="animate-pulse inline-block text-lg">💡</span>
            </h1>
            <p className="text-xs text-slate-400">Manage interactive drawing boards, view analytics, or check on scheduled call calendars.</p>
          </div>
          <button 
            onClick={fetchMeetings} 
            className="px-3 py-1.5 rounded-lg hover:border-slate-700 bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resync dashboard</span>
          </button>
        </header>

        {/* METRICS ROW CARDS */}
        <section id="metrics-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Registered Events</span>
            <div className="text-3xl font-black mt-1 text-white">{meetings.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">Scheduled and active sessions combined</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Live Active Rooms</span>
            <div className="text-3xl font-black mt-1 text-emerald-400 flex items-center gap-1.5">
              <span>{activeCount}</span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Available to connect instantly</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Avg Call Duration</span>
            <div className="text-3xl font-black mt-1 text-white">{meetings.length > 0 ? Math.round(totalDuration / meetings.length) : 0} Mins</div>
            <p className="text-[10px] text-slate-400 mt-1">Estimated duration metrics</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">AI Synthesizer status</span>
            <div className="text-3xl font-black mt-1 text-white uppercase text-sm tracking-widest text-indigo-300">ONLINE-READY</div>
            <p className="text-[10px] text-slate-400 mt-1">Gemini-3.5-Flash pipeline operational</p>
          </div>
        </section>

        {/* ACTIVE MODULE VIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side actions and join console */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* Call Controls Panel */}
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900/80 via-slate-900/30 to-indigo-950/10 border border-white/5">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-400" />
                  <span>INTERACTIVE REAL-TIME LAUNCHPAD</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Option 1: Instant Start */}
                  <div className="p-5 rounded-xl bg-[#E0DFFD] border border-white/5 flex flex-col justify-between hover:border-slate-800 transition-all">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                        <Plus className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-200">Start an Instant Meeting</h3>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1 mb-6">Launch an ad-hoc classroom workspace with full drawing canvas, and polls control dashboard instantly.</p>
                    </div>
                    <button 
                      onClick={handleInstantMeeting}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition-all shadow-md mt-auto shadow-indigo-600/20"
                    >
                      Spawn Board Room
                    </button>
                  </div>

                  {/* Option 2: Join with ID */}
                  <form onSubmit={handleJoin} className="p-5 rounded-x bg-[#E0DFFD] border border-white/5 flex flex-col justify-between hover:border-slate-800 transition-all">
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                        <Key className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-200">Connect to Room ID</h3>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1 mb-4">Enter an active meeting code and designated passcode to participate in active drawings.</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="Meeting ID (e.g., meet_active_demo)" 
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Passcode PIN (Optional, e.g. 90210)" 
                        value={joinPasscode}
                        onChange={(e) => setJoinPasscode(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    >
                      Enter Room Match
                    </button>
                  </form>

                </div>
              </div>

              {/* Attendance Tracker Logs & History */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
                <h3 className="font-bold text-sm leading-none text-white mb-4">Previous Collaboration Sessions List</h3>
                
                {meetings.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No preceding meeting records located.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {meetings.slice(0, 4).map((meet) => (
                      <div key={meet.id} className="p-3.5 rounded-xl bg-[#E0DFFD] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs truncate max-w-[200px] text-slate-200">{meet.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              meet.status === 'active' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : meet.status === 'scheduled' 
                                ? 'bg-indigo-500/20 text-indigo-400' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {meet.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span>ID: {meet.id}</span>
                            <span>•</span>
                            <span>{meet.date} at {meet.startTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {meet.status === 'active' ? (
                            <button 
                              onClick={() => onJoinMeeting(meet.id, meet.passcode)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition-all shrink-0"
                            >
                              Join Call
                            </button>
                          ) : (
                            <button 
                              onClick={() => examineMeetingDetails(meet)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-all shrink-0"
                            >
                              Explore Insights
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right side scheduling calendar */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Meeting Scheduler Dashboard</span>
                </h2>

                <form onSubmit={handleScheduleMeeting} className="flex flex-col gap-4">
                  {scheduleError && (
                    <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px]">
                      {scheduleError}
                    </div>
                  )}
                  {scheduleSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px]">
                      {scheduleSuccess}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Session Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Weekly Scrum / Product Review" 
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      className="w-full bg-[#E0DFFD] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description (Agenda)</label>
                    <textarea 
                      placeholder="Discussing release pipeline updates, resolving git conflict nodes..." 
                      value={scheduleDesc}
                      onChange={(e) => setScheduleDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-[#E0DFFD]  border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date</label>
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-[#E0DFFD] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Time</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 03:30 PM"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-[#E0DFFD] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated duration</label>
                    <select 
                      value={scheduleDuration}
                      onChange={(e) => setScheduleDuration(e.target.value)}
                      className="w-full bg-[#E0DFFD] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition-all text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 mt-2"
                  >
                    <span>Register to Calendar</span>
                    <Clock className="w-4 h-4 text-indigo-300" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* DETAILS SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
            <h2 className="text-md font-bold mb-6 text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Registered Session Repository ({meetings.length})</span>
            </h2>

            {meetings.length === 0 ? (
              <div className="text-center py-14 text-slate-500">
                <p>No meeting registries located. Use the schedule block to start scheduling conferences.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meetings.map((meet) => (
                  <div key={meet.id} className="p-5 rounded-xl bg-[#46467A] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="font-extrabold text-sm text-white">{meet.title}</h3>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                          meet.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : meet.status === 'scheduled' 
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                            : 'bg-slate-800 text-slate-400 border border-white/5'
                        }`}>
                          {meet.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 mb-4">{meet.description || 'No meeting log agendas specified.'}</p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4 mt-6">
                      <div className="text-[10px] text-slate-500">
                        <span className="block">{meet.date}</span>
                        <span className="block mt-0.5">{meet.startTime} ({meet.duration || 30} mins)</span>
                      </div>
                      <div className="flex gap-2">
                        {meet.status === 'active' ? (
                          <button 
                            onClick={() => onJoinMeeting(meet.id, meet.passcode)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition-all"
                          >
                            Join Active Session
                          </button>
                        ) : (
                          <button 
                            onClick={() => examineMeetingDetails(meet)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-all"
                          >
                            Analyze
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI INSIGHTS PORTAL TAB */}
        {activeTab === 'insights' && (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5">
            <h2 className="text-md font-bold mb-4 text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>SMART AI SUMMARIES CONSOLE</span>
            </h2>
            <p className="text-xs text-slate-400 mb-8 max-w-2xl leading-normal">
              Select any past or active configuration session to explore summaries, checklist highlights, and task assignments automatically extracted using `@google/genai` models.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Completed Meeting logs</span>
                {meetings.map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => examineMeetingDetails(m)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col ${
                      selectedMeeting?.id === m.id 
                        ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                        : 'bg-[#E0DFFD] border-white/5 text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs truncate max-w-full">{m.title}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{m.date} - {m.startTime}</span>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8">
                {selectedMeeting ? (
                  <div className="p-6 rounded-xl bg-[#E0DFFD] border border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100">{selectedMeeting.title}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Session ID: {selectedMeeting.id} • Assigned Host: {selectedMeeting.hostName}</p>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">
                        Action report checklist
                      </span>
                    </div>

                    {compilingAi ? (
                      <div className="flex flex-col items-center justify-center py-14 text-center">
                        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
                        <span className="text-xs text-slate-400">Generative model compiling highlights and structured summary pipelines...</span>
                      </div>
                    ) : aiReport ? (
                      <div className="flex flex-col gap-6">
                        {/* Summary */}
                        <div>
                          <h4 className="text-[11px] uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1 mb-2">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Executive Summary</span>
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-white/5">{aiReport.summary}</p>
                        </div>

                        {/* Highlights */}
                        <div>
                          <h4 className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1 mb-2">
                             <CheckCircle className="w-3.5 h-3.5" />
                            <span>Critical Discussion Highlights</span>
                          </h4>
                          <ul className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl border border-white/5">
                            {aiReport.highlights.map((h, i) => (
                              <li key={i} className="flex gap-2 text-xs text-slate-300">
                                <span className="text-cyan-400 shrink-0">•</span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Items */}
                        <div>
                          <h4 className="text-[11px] uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1 mb-2.5">
                            <ListTodo className="w-3.5 h-3.5" />
                            <span>AI Assignments Checkbox</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {aiReport.actionItems.map((item, i) => (
                              <div key={i} className="p-3 rounded-lg bg-slate-900 border border-white/5 flex flex-col justify-between">
                                <div>
                                  <span className="text-xs font-bold text-slate-200 block leading-normal">{item.task}</span>
                                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-white/5">{item.assigneeName}</span>
                                    <span>•</span>
                                    <span>{item.deadline}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-10 text-center">Failed to connect summary pipelines.</p>
                    )}
                  </div>
                ) : (
                  <div className="p-12 rounded-xl bg-[#E0DFFD]/60 border border-white/5 border-dashed text-center text-slate-500 flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 text-slate-700 mb-3" />
                    <p className="text-xs">No target session analyzed yet. Trigger any module on your left list to fetch summaries.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MEETING ANALYSIS INSIGHTS MODAL (Fallback Details overlay) */}
      {selectedMeeting && activeTab !== 'insights' && (
        <div className="fixed inset-0 z-50 bg-[#E0DFFD]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center bg-[#E0DFFD] px-6 py-4 border-b border-white/5">
              <h3 className="font-extrabold text-sm">{selectedMeeting.title} Analysis Report</h3>
              <button 
                onClick={() => setSelectedMeeting(null)}
                className="text-slate-500 hover:text-white font-black text-xs"
              >
                Close ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-6">
              
              {/* Core Details metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#E0DFFD] p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Status</span>
                  <span className="text-xs font-bold text-white uppercase">{selectedMeeting.status}</span>
                </div>
                <div className="bg-[#E0DFFD] p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Passcode PIN</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">{selectedMeeting.passcode}</span>
                </div>
                <div className="bg-[#E0DFFD] p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Assigned Host</span>
                  <span className="text-xs font-bold text-white">{selectedMeeting.hostName}</span>
                </div>
                <div className="bg-[#E0DFFD] p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase text-slate-500 font-bold block">Scheduled Date</span>
                  <span className="text-xs font-bold text-white">{selectedMeeting.date}</span>
                </div>
              </div>

              {/* Attendance Log listings */}
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2.5">Attendance Tracking Logs ({selectedMeeting.attendance?.length || 0})</h4>
                {(!selectedMeeting.attendance || selectedMeeting.attendance.length === 0) ? (
                  <p className="text-[11px] text-slate-500 italic">No attendance records generated yet (occurs at session termination).</p>
                ) : (
                  <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-xl border border-white/5 space-y-1">
                    {selectedMeeting.attendance.map((att, i) => (
                      <div key={i} className="flex justify-between items-center text-xs py-1">
                        <span className="font-bold text-slate-300">{att.name}</span>
                        <div className="flex gap-4 text-slate-500 text-[10px]">
                          <span>In: {new Date(att.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>Left: {att.leftAt ? new Date(att.leftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                          <span className="text-indigo-400 font-bold">{att.duration} Mins</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summaries */}
              {compilingAi ? (
                <div className="text-center py-6">
                  <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-400">Loading AI Summary highlights...</span>
                </div>
              ) : aiReport ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#E0DFFD] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase text-indigo-400 font-bold block mb-1">AI AUTOMATED MOM SUMMARY</span>
                    <p className="text-xs text-slate-300 leading-normal">{aiReport.summary}</p>
                  </div>

                  <div className="bg-[#E0DFFD] p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase text-purple-400 font-bold block mb-2">Automated Tasks Checklist</span>
                    <div className="flex flex-col gap-1.5">
                      {aiReport.actionItems.map((act, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300 py-0.5">
                          <span>• {act.task}</span>
                          <span className="text-indigo-400 font-mono">{act.assigneeName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}