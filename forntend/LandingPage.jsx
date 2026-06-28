import { motion } from "framer-motion";
import { Video, Bot, Sparkles, Sliders, Palette, Shield, Check, Calendar, ArrowRight, ChevronDown, Award } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage({ onGetStarted }) {
  const [faqOpen, setFaqOpen] = useState({
    0: true,
  });

  const toggleFaq = (index) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const features = [
    {
      icon: <Bot className="w-6 h-6 text-indigo-400" />,
      title: 'REAL-TIME AI COPILOT',
      description: 'Ask the in-meeting AI assistant to summarize discussions, list action items, and query topics instantly using Gemini-powered intelligence.',
    },
    {
      icon: <Palette className="w-6 h-6 text-cyan-400" />,
      title: 'INTERACTIVE REAL-TIME CANVAS',
      description: 'Draw, construct vector shapes, and write text on a collaborative synced drawing board that updates live for all connected participants.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      title: 'AUTOMATED MOM & SUMMARY',
      description: 'Instantly generate highly structured Minutes of Meeting (MOM), highlight points, and assign tasks with auto-detected deadlines when meetings wrap up.',
    },
    {
      icon: <Sliders className="w-6 h-6 text-emerald-400" />,
      title: 'HOST BREAKOUT CONTROL ROOM',
      description: 'Easily launch, assign, and merge custom breakout rooms in real-time, helping cross-collaborative subteams brain-dump project details.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-pink-400" />,
      title: 'SMART MEETING SCHEDULER',
      description: 'Plan meetings, pre-assign participants, and let the system send email reminders and custom calendar notifications to ensure full attendance.',
    },
    {
      icon: <Shield className="w-6 h-6 text-rose-400" />,
      title: 'PREMIUM TELEMENTRY DASHBOARD',
      description: 'Examine detailed reports tracking user join times, durations, public poll results, and action item completions inside a centralized index.',
    },
  ];

  const pricingTiers = [
    {
      name: 'FREE',
      price: '₹0',
      period: 'Forever Free',
      description: 'Perfect for small teams and developers seeking to test collaborative workflows.',
      features: [
        'Up to 45 minutes per session',
        'In-meeting real-time whiteboard',
        'Interactive community polling platform',
        'Attendance logs tracking reports',
        'Local file sharing and storage fallbacks'
      ],
      buttonText: 'Start Connecting Now',
      popular: false,
    },
    {
      name: 'ENTERPRISE PRO',
      price: '₹1999',
      period: 'per host / month',
      description: 'Best for advanced corporations requiring complete Gemini-guided workspace summaries.',
      features: [
        'unlimited duration group calls',
        'Gemini-3.5-Flash assistant context chats',
        'Automated AI summary and task extractions',
        'Host-directed real-time breakout splits',
        'Cloud-uploaded conference audio recordings',
        'Dedicated 24/7 Priority support channel'
      ],
      buttonText: 'Upgrade to Enterprise Pro',
      popular: true,
    }
  ];

  const faqs = [
    {
      q: 'What makes IntelliMeet Pro different from legacy apps like Google Meet or Zoom?',
      a: 'IntelliMeet Pro merges active collaboration structures with contextual generative model layers. Instead of treating meetings as disjointed video streams, we treat them as active data workspaces where AI summarizes chats, live whiteboard vectors update concurrently, and actions are auto-assigned to individuals in an analytics dashboard.',
    },
    {
      q: 'Does it support real-time audio and video feeds?',
      a: 'Absolutely! Our premium meeting framework uses browser streams paired with high-frequency socket synchronization nodes to mimic and track camera states, screen share loops, and voice activities.'
    },
    {
      q: 'Can I connect my own Google Gemini API Keys?',
      a: 'Yes. By default, our server leverages high-fidelity local fallback models so that everything works out-of-the-box. However, you can instantly link your custom Gemini Secrets directly under Settings in the user interface to power enterprise-grade AI summary layers.',
    },
    {
      q: 'Where do recordings and shared files store?',
      a: 'Meetings support PDF, DOCX, presentation decks, and image assets. Files are secure, uploaded via Cloudinary protocols or our persistent mock upload services, storing references inside the host database.'
    }
  ];

  return (
   <div id="landing-container" className="min-h-screen bg-gradient-to-b from-[#E0DFFD] via-[#F7F7FC] to-[#E0DFFD] text-[#46467A] font-sans overflow-x-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Interactive Header Navigation Bar */}
      <header id="landing-header" className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div id="header-logo" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">INTELLIMEET</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/25 text-indigo-400 uppercase tracking-widest">PRO</span>
          </div>
        </div>
        <div id="header-actions" className="flex items-center gap-4">
          <button id="btn-login" onClick={onGetStarted} className="text-sm font-medium hover:text-white text-slate-400 transition-colors bg-transparent border-none cursor-pointer">
            Login
          </button>
          <button id="btn-signup" onClick={onGetStarted} className="relative group overflow-hidden px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 border-none cursor-pointer">
            <span className="relative z-10 flex items-center gap-1">
              Launch Portal <ArrowRight className="w-4 h-4 text-indigo-200" />
            </span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative pt-16 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Tag Pill badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-medium tracking-wide mb-6">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen MERN Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6">
            WHERE VIDEO CONFERENCES MEET <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              GENERATIVE INTELLIGENCE 
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-xl max-w-2xl leading-relaxed mb-8">
            Empower your development sprint and product reviews with real-time vector boards, dynamic in-call AI chatbots, automated minutes of meetings, and interactive live polling dashboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              id="btn-hero-cta" 
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 flex items-center gap-2 text-md border-none cursor-pointer"
            >
              Get Started for Free <Sparkles className="w-5 h-5 text-indigo-200" />
            </button>
            <button 
              id="btn-hero-secondary"
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-md cursor-pointer"
            >
              Explore Sandbox features
            </button>
          </div>
        </motion.div>

        {/* Hero Visual Mockup Frame */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 relative rounded-2xl overflow-hidden glass-panel border border-white/10 p-2 max-w-5xl mx-auto shadow-2xl animate-fade-in"
        >
          <div className="flex border-b border-white/10 pb-2 mb-2 items-center justify-between px-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-wider">
              https://intellimeet.pro/session/room_demo_active
            </div>
            <div className="w-14" />
          </div>
          <img 
            src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=1200&auto=format&fit=crop&q=80" 
            alt="IntelliMeet Pro Interactive Platform Screen" 
            referrerPolicy="no-referrer"
            className="w-full rounded-xl aspect-[16/9] object-cover opacity-90 brightness-[0.85]"
          />
          {/* Overlaid UI components to showcase premium feel */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 glass-panel p-4 rounded-xl border border-white/10 max-w-[240px] text-left hidden sm:block shadow-2xl">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Summary Copilot</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Analyzing discussions... extracted **2 key action items** for Sarah and scheduled next code test.
            </p>
          </div>

          <div className="absolute bottom-12 right-8 glass-panel p-4 rounded-xl border border-white/10 max-w-[220px] text-left hidden sm:block shadow-2xl">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mb-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Collaborative Whiteboard</span>
            </div>
            <div className="w-full h-8 flex gap-1 items-end">
              <span className="w-4/12 h-6 bg-cyan-500/20 rounded border border-cyan-500/40" />
              <span className="w-8/12 h-8 bg-indigo-500/20 rounded border border-indigo-500/40" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grid Features Section */}
     <section
  id="features-section"
  className="py-20 bg-[#E0DFFD] border-y border-[#CFCFEA] px-6 md:px-12"
>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              SMARTER MEETINGS. UNIFIED WORKSPACES.
            </h2>
            <p className="text-slate-400">top shifting tabs to access whiteboard canvas nodes, scheduler calendars, or task checklists. IntelliMeet Pro hosts everything inside and outside the audio room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {features.map((feat, idx) => (
  <motion.div
    key={idx}
    whileHover={{ y: -4 }}
    className="p-6 rounded-2xl bg-[#46467A] border border-[#7766C6] hover:bg-[#5A5A96] transition-all shadow-xl text-left"
  >
    <div className="w-12 h-12 rounded-xl bg-[#2E2E5A] border border-[#7766C6] flex items-center justify-center mb-5">
      {feat.icon}
    </div>

    <h3 className="font-semibold text-lg text-white mb-3">
      {feat.title}
    </h3>

    <p className="text-sm leading-relaxed text-[#E0DFFD]">
      {feat.description}
    </p>
  </motion.div>
))}
          </div>
        </div>
      </section>

      {/* Pricing Packages Section */}
      <section id="pricing-section" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            TRANSPARENT PRICING MODELS
          </h2>
          <p className="text-slate-400">
            Build, test, and host collaborative rooms. Start with our sandbox model or unlock unlimited AI Summarization grids.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`p-8 rounded-2xl relative text-left ${
                tier.popular 
                ? 'bg-[#1E3A8A] border-2 border-[#4F8CFF] shadow-2xl' 
                  :'bg-[#BFD7FF] border border-[#7AA8FF] shadow-xl'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
            <h3 className={`text-lg font-bold mb-2 ${
  tier.popular ? 'text-white' : 'text-[#1E3A8A]'
}`}></h3>
              <div className="flex items-baseline gap-1 mb-2">
               <span
    className={`text-4xl sm:text-5xl font-extrabold ${
      tier.popular ? "text-white" : "text-[#1E3A8A]"
    }`}
  >
    {tier.price}
  </span>

              <span
    className={`text-xs font-medium ml-1 ${
      tier.popular ? "text-[#E0DFFD]" : "text-[#1E3A8A]"
    }`}
  >
    {tier.period}
  </span>
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${
  tier.popular ? 'text-[#E0DFFD]' : 'text-[#1E3A8A]'
}`}></p>
              <button 
                id={`pricing-btn-${idx}`}
                onClick={onGetStarted}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] border-none cursor-pointer ${
                  tier.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                   : 'bg-[#46467A] hover:bg-[#5A5A96] text-white'
                }`}
              >
                {tier.buttonText}
              </button>

              <div className="mt-8 border-t border-white/5 pt-6">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-4">Included capabilities:</span>
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feat, fIdx) => (
                   <li
  key={fIdx}
  className={`flex items-start gap-2.5 text-sm ${
    tier.popular ? "text-[#E0DFFD]" : "text-black"
  }`}
>
  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
  <span>{feat}</span>
</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS Section */}
      <section id="faq-section" className="py-20 bg-slate-900/20 border-t border-white/5 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">FREQUENTLY ASKED QUEStTIONS</h2>
            <p className="text-slate-400">Everything you need to know about the IntelliMeet conference platform.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
               className="rounded-xl bg-[#46467A] border border-[#7766C6] overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left py-5 px-6 font-semibold flex justify-between items-center bg-transparent group border-none cursor-pointer"
                >
        <span
  className="font-bold text-xl transition-colors group-hover:text-[#FFC212]"
  style={{ color: "#FFFFFF" }}
>
  {faq.q}
</span>
                  <ChevronDown className={`w-4 h-4 text-[#E0DFFD] group-hover:text-[#FFC212] transition-transform ${faqOpen[idx] ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen[idx] && (
                 <div
  className="px-6 pb-5 pt-3 text-base leading-relaxed border-t border-[#7766C6] text-left"
  style={{ color: "#E0DFFD" }}
>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Box Footer */}
      <section id="cta-section" className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl p-8 md:p-14 bg-[#46467A] border border-[#7766C6] relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#7766C6]/20 rounded-full blur-[80px] pointer-events-none" />
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">READY TO BOOST YOUR MEETING PRODUCTIVITY?</h2>
          <p className="text-[#E0DFFD] text-base md:text-lg max-w-2xl mx-auto mb-8">
            Experience clean, glassmorphic layout controls backed by real-time WebSockets and Gemini models today.
          </p>
          <button 
            id="btn-cta-bottom"
            onClick={onGetStarted}
            className="px-10 py-4 rounded-xl font-bold bg-[#7766C6] text-white hover:bg-[#6655B8] transition-all transform hover:scale-105 border-none cursor-pointer"
          >
            Start IntelliMeeting Free
          </button>
        </div>
      </section>

      {/* Simple elegant footer */}
      <footer id="landing-footer" className="py-8 border-t border-white/5 text-center px-6">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} IntelliMeet Pro Conference, Inc. All rights reserved. Built with extreme design precision.
        </p>
      </footer>
    </div>
  );
}