import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare, ScreenShareOff, 
  Send, Users, HelpCircle, Palette, Calendar, MessageSquare, Sparkles, LogOut,
  Trash2, Plus, BarChart2, CheckCircle, FileText, Upload, Copy, Share2, Layers, Grid, Sliders, Play, Square, Settings, Laptop
} from 'lucide-react';

// Sub-component to safely assign media stream objects to React video elements
function VideoFeed({ stream, isMuted, userName, isLocal, connectionState }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`p-1 bg-slate-900 border rounded-2xl aspect-[16/10] relative overflow-hidden shadow-xl transition-all ${
      isLocal ? 'border-indigo-500/40' :
      connectionState === 'connected' ? 'border-emerald-500/50 shadow-emerald-500/5' :
      connectionState === 'connecting' ? 'border-yellow-500/50 animate-pulse' : 'border-white/5'
    }`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted || isLocal}
        className="w-full h-full object-cover rounded-xl bg-[#E0DFFD]"
      />
      <div className="absolute top-4 left-4 bg-[#E0DFFD]/80 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 border border-white/5 z-10">
        <span className={`w-1.5 h-1.5 rounded-full ${
          isLocal ? 'bg-indigo-400' :
          connectionState === 'connected' ? 'bg-emerald-400' :
          connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-rose-400'
        }`} />
        <span>{userName} {isLocal && '(You)'}</span>
        {connectionState && !isLocal && (
          <span className="text-[8px] font-mono text-slate-500 bg-[#E0DFFD]/45 px-1 rounded-md lowercase">({connectionState})</span>
        )}
      </div>
    </div>
  );
}

export default function MeetingRoom({ user, meetingId, passcode, onLeave }) {
  // Socket Ref
  const socketRef = useRef(null);

  // WebRTC Refs
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pcsRef = useRef({}); // maps socketId -> RTCPeerConnection

  // Media state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]); // Array of { socketId, userId, userName, stream, connectionState }
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // Devices State Selection
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  // General meeting details state
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [whiteboardElements, setWhiteboardElements] = useState([]);

  // Right sidebar layout tabs
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat');
  const [showSidebar, setShowSidebar] = useState(true);

  // Form input variables
  const [chatInput, setChatInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Poll forms
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Copy indicator
  const [copySuccess, setCopySuccess] = useState(false);

  // Canvas details
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const prevPosRef = useRef({ x: 0, y: 0 });
  const [drawTool, setDrawTool] = useState('draw');
  const [drawColor, setDrawColor] = useState('#818cf8');
  const [strokeWidth, setStrokeWidth] = useState(4);

  // STUN ICE servers for public connection exchange
  const iceConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // 1. Initial configuration: Acquire cameras/mics & enumerate devices
  useEffect(() => {
    let active = true;

    async function initializeUserMediaDevices() {
      try {
        // Enforce actual navigator user media capture
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Fetch input hardware directories
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videos = devices.filter(d => d.kind === 'videoinput');
        const audios = devices.filter(d => d.kind === 'audioinput');

        setVideoDevices(videos);
        setAudioDevices(audios);

        if (videos.length > 0) setSelectedVideoId(videos[0].deviceId);
        if (audios.length > 0) setSelectedAudioId(audios[0].deviceId);

        // Connect the Socket context
        connectSocketServer(stream);

      } catch (err) {
        console.error('Failed to grab camera streams in browser sandbox:', err);
        // Fallback with empty stream or alerting state
        const canvasMock = document.createElement('canvas');
        canvasMock.width = 640;
        canvasMock.height = 480;
        const ctx = canvasMock.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 480);
        
        ctx.fillStyle = '#6366f1';
        ctx.font = '20px sans-serif';
        ctx.fillText('Secure Sandbox Visual Mode', 100, 240);

        try {
          const mockStream = canvasMock.captureStream(10);
          localStreamRef.current = mockStream;
          setLocalStream(mockStream);
          connectSocketServer(mockStream);
        } catch (e) {
          console.error('Could not create empty stream fallback:', e);
          connectSocketServer(null);
        }
      }
    }

    initializeUserMediaDevices();

    // REST api fetching
    fetch(`/api/meetings/${meetingId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Query error');
        return res.json();
      })
      .then((data) => {
        setMeeting(data);
        setParticipants(data.participants || []);
        setPolls(data.polls || []);
        setWhiteboardElements(data.whiteboard || []);
      })
      .catch((err) => console.error('Error querying initial meeting profiles:', err));

    fetch(`/api/meetings/${meetingId}/files`)
      .then((res) => res.json())
      .then((files) => setSharedFiles(files || []))
      .catch(() => {});

    return () => {
      active = false;
      // Stop all track processes on leave
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      // Close peers
      Object.keys(pcsRef.current).forEach(k => {
        pcsRef.current[k].close();
      });
      pcsRef.current = {};

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [meetingId]);

  // Connects socket.io-client
  function connectSocketServer(stream) {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket link established: ' + socket.id);
      socket.emit('join_meeting', {
        meetingId,
        userId: user.id,
        userName: user.name,
      });
    });

    // Received roster list of other connected socket clients
    socket.on('all_users_roster', (roster) => {
      console.log('Roster of existing endpoints received:', roster);
      // For each connected socket endpoint, initiate a target RTCPeerConnection offer
      roster.forEach(({ socketId, userId, userName }) => {
        initiatePeerConnection(socketId, userId, userName, stream, true);
      });
    });

    // Received broadcast that a new user entered
    socket.on('user_joined_broadcast', ({ socketId, userId, userName }) => {
      console.log(`Endpoint ${userName} (${socketId}) joined active pool.`);
      // New peer joins. We allow the joining peer to initiate connections, 
      // or we can pre-create the peer connection and wait for their signals package.
      initiatePeerConnection(socketId, userId, userName, stream, false);
      
      setParticipants(prev => {
        if (prev.some((p) => p.userId === userId)) return prev;
        return [
          ...prev,
          {
            id: `part_${userId}`,
            userId,
            name: userName,
            role: 'participant',
            joinedAt: new Date().toISOString(),
            audio: true,
            video: true,
          }
        ];
      });
    });

    // WebRTC signaling dispatcher handling offer/answer/ice candidates
    socket.on('receive_rtc_signal', async ({ senderSocketId, signal }) => {
      let pc = pcsRef.current[senderSocketId];

      if (!pc) {
        // Find user info in remote streams list or participants list
        const part = participants.find(p => p.socketId === senderSocketId) || {};
        pc = initiatePeerConnection(senderSocketId, part.userId || 'remote_id', part.name || 'Remote Guest', stream, false);
      }

      try {
        if (signal.type === 'offer') {
          console.log(`Received WebRTC offer from ${senderSocketId}`);
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          socket.emit('send_rtc_signal', {
            to: senderSocketId,
            signal: { type: 'answer', sdp: answer }
          });
        } 
        else if (signal.type === 'answer') {
          console.log(`Received WebRTC answer from ${senderSocketId}`);
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } 
        else if (signal.type === 'candidate') {
          console.log(`Received ICE Candidate from ${senderSocketId}`);
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('Error processing signaling pipeline:', err);
      }
    });

    // Peer disconnected
    socket.on('user_left_broadcast', ({ socketId, userId, userName }) => {
      console.log(`Peer ${userName} left room indices.`);
      if (pcsRef.current[socketId]) {
        pcsRef.current[socketId].close();
        delete pcsRef.current[socketId];
      }
      setRemoteStreams(prev => prev.filter(s => s.socketId !== socketId));
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    });

    // Auxiliary sync lists
    socket.on('new_message', (chatMsg) => {
      setChatMessages((prev) => [...prev, chatMsg]);
    });

    socket.on('canvas_draw_received', (element) => {
      setWhiteboardElements((prev) => [...prev, element]);
    });

    socket.on('canvas_clear_received', () => {
      setWhiteboardElements([]);
    });

    socket.on('poll_created_received', (dbPoll) => {
      setPolls((prev) => [...prev, dbPoll]);
    });

    socket.on('poll_votes_updated', (updatedPoll) => {
      setPolls((prev) => prev.map((p) => (p.id === updatedPoll.id ? updatedPoll : p)));
    });

    socket.on('poll_closed_received', (pollId) => {
      setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, isActive: false } : p)));
    });
  }

  // Orchestrating RTCPeerConnection connections and local track attachments
  function initiatePeerConnection(targetSocketId, peerUserId, peerUserName, stream, isInitiator) {
    if (pcsRef.current[targetSocketId]) {
      return pcsRef.current[targetSocketId];
    }

    console.log(`Constructing RTCPeerConnection targeting ${peerUserName} [Initiator: ${isInitiator}]`);
    const pc = new RTCPeerConnection(iceConfiguration);

    // Attach ICE dispatcher
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('send_rtc_signal', {
          to: targetSocketId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Listen to connectionState metrics
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`Connection targeting socket ID ${targetSocketId} updated state: ${state}`);
      setRemoteStreams(prev => prev.map(s => {
        if (s.socketId === targetSocketId) {
          return { ...s, connectionState: state };
        }
        return s;
      }));
    };

    // Captured remote track
    pc.ontrack = (event) => {
      console.log(`Ontrack triggered for target ${peerUserName}`);
      const [remoteStream] = event.streams;

      setRemoteStreams(prev => {
        const index = prev.findIndex(s => s.socketId === targetSocketId);
        if (index !== -1) {
          const cloned = [...prev];
          cloned[index] = {
            ...cloned[index],
            stream: remoteStream,
            connectionState: pc.connectionState
          };
          return cloned;
        } else {
          return [
            ...prev,
            {
              socketId: targetSocketId,
              userId: peerUserId,
              userName: peerUserName,
              stream: remoteStream,
              connectionState: pc.connectionState
            }
          ];
        }
      });
    };

    // Loop active tracks inside local media stream to output to this destination peer connection
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pcsRef.current[targetSocketId] = pc;

    // Send visual state to the hook
    setRemoteStreams(prev => {
      if (prev.some(s => s.socketId === targetSocketId)) return prev;
      return [
        ...prev,
        {
          socketId: targetSocketId,
          userId: peerUserId,
          userName: peerUserName,
          stream: null,
          connectionState: 'connecting'
        }
      ];
    });

    if (isInitiator) {
      // Create actual RTC SDP offer
      pc.onnegotiationneeded = async () => {
        try {
          console.log(`Creating SDP negotiation offer targets ${peerUserName}`);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socketRef.current) {
            socketRef.current.emit('send_rtc_signal', {
              to: targetSocketId,
              signal: { type: 'offer', sdp: offer }
            });
          }
        } catch (e) {
          console.error('SDP offer connection pipeline failed:', e);
        }
      };
    }

    return pc;
  }

  // Device selections changing mechanisms
  async function selectHardwareInputDevice(type, deviceId) {
    if (!localStream) return;
    try {
      if (type === 'video') {
        setSelectedVideoId(deviceId);
        
        // Stop current visual track processes
        const currentVideoTrack = localStream.getVideoTracks()[0];
        if (currentVideoTrack) currentVideoTrack.stop();

        const constraints = {
          video: { deviceId: { exact: deviceId } },
          audio: selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true
        };

        const freshStream = await navigator.mediaDevices.getUserMedia(constraints);
        const freshVideoTrack = freshStream.getVideoTracks()[0];

        localStream.removeTrack(currentVideoTrack);
        localStream.addTrack(freshVideoTrack);

        // Feed to remote peers
        updateTracksAcrossPeers('video', freshVideoTrack);

      } else {
        setSelectedAudioId(deviceId);

        const currentAudioTrack = localStream.getAudioTracks()[0];
        if (currentAudioTrack) currentAudioTrack.stop();

        const constraints = {
          video: selectedVideoId ? { deviceId: { exact: selectedVideoId } } : true,
          audio: { deviceId: { exact: deviceId } }
        };

        const freshStream = await navigator.mediaDevices.getUserMedia(constraints);
        const freshAudioTrack = freshStream.getAudioTracks()[0];

        localStream.removeTrack(currentAudioTrack);
        localStream.addTrack(freshAudioTrack);

        // Feed to remote peers
        updateTracksAcrossPeers('audio', freshAudioTrack);
      }
    } catch (e) {
      console.error('Selected physical media capture device failed:', e);
    }
  }

  function updateTracksAcrossPeers(kind, track) {
    Object.values(pcsRef.current).forEach((pc) => {
      const senders = pc.getSenders();
      const match = senders.find((s) => s.track && s.track.kind === kind);
      if (match) {
        match.replaceTrack(track);
      }
    });
  }

  // Client buttons toggle functions
  const toggleMic = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = !nextState));
    }
  };

  const toggleCamera = () => {
    const nextState = !isCamOff;
    setIsCamOff(nextState);
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = !nextState));
    }
  };

  const toggleScreen = async () => {
    if (!isSharingScreen) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        const videoTrack = stream.getVideoTracks()[0];

        updateTracksAcrossPeers('video', videoTrack);

        videoTrack.onended = () => {
          stopScreenSharingFlow();
        };

        setIsSharingScreen(true);
      } catch (err) {
        console.error('Screen sharing capture request rejected:', err);
      }
    } else {
      stopScreenSharingFlow();
    }
  };

  function stopScreenSharingFlow() {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (localStream) {
      const originalVideoTrack = localStream.getVideoTracks()[0];
      if (originalVideoTrack) {
        updateTracksAcrossPeers('video', originalVideoTrack);
      }
    }
    setIsSharingScreen(false);
  }

  // Controls whiteboard drawings
  useEffect(() => {
    if (!showWhiteboard || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(450, parent.clientHeight - 80);
      drawElements();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(parent);

    const drawElements = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      whiteboardElements.forEach((el) => {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (el.type === 'draw' || el.type === 'eraser') {
          if (!el.points || el.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(el.points[0], el.points[1]);
          for (let i = 2; i < el.points.length; i += 2) {
            ctx.lineTo(el.points[i], el.points[i + 1]);
          }
          ctx.stroke();
        } else if (el.type === 'line') {
          if (!el.points || el.points.length < 4) return;
          ctx.beginPath();
          ctx.moveTo(el.points[0], el.points[1]);
          ctx.lineTo(el.points[2], el.points[3]);
          ctx.stroke();
        } else if (el.type === 'rect') {
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        }
      });
    };

    drawElements();

    return () => {
      resizeObserver.disconnect();
    };
  }, [showWhiteboard, whiteboardElements]);

  // Chat message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      meetingId,
      senderId: user.id,
      senderName: user.name,
      text: chatInput.trim(),
    });
    setChatInput('');
  };

  // AI interactive prompt
  const handleAskAssistant = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse('');

    try {
      const res = await fetch(`/api/meetings/${meetingId}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiPrompt.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.answer);
      } else {
        setAiResponse('AI service temporary unreachable.');
      }
    } catch {
      setAiResponse('Communication timeout with Gemini servers.');
    } finally {
      setAiLoading(false);
    }
  };

  // Poll Forms operations
  const handleCreatePollSubmit = (e) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !socketRef.current) return;

    const filtered = pollOptions.filter((o) => o.trim() !== '');
    if (filtered.length < 2) return;

    const uniqueId = `poll_${Math.floor(1000 + Math.random() * 9000)}`;
    const pollObj = {
      id: uniqueId,
      question: pollQuestion.trim(),
      options: filtered,
      votes: filtered.reduce((acc, _, idx) => ({ ...acc, [idx]: 0 }), {}),
      votedUsers: {},
      isActive: true,
      createdByName: user.name,
    };

    socketRef.current.emit('create_poll', { meetingId, poll: pollObj });
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const submitVote = (pollId, optIndex) => {
    if (!socketRef.current) return;
    socketRef.current.emit('vote_poll', {
      meetingId,
      pollId,
      optionIndex: optIndex,
      userId: user.id,
    });
  };

  const handleClosePoll = (pollId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('close_poll', { meetingId, pollId });
  };

  // Canvas strokes
  const startDrawingOnCanvas = (e) => {
    if (!canvasRef.current || drawTool === 'eraser') return;
    isDrawingRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    prevPosRef.current = { x, y };
  };

  const drawOnCanvas = (e) => {
    if (!isDrawingRef.current || !canvasRef.current || !socketRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let el = null;
    const uid = `wb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (drawTool === 'draw') {
      el = {
        id: uid,
        type: 'draw',
        color: drawColor,
        size: strokeWidth,
        points: [prevPosRef.current.x, prevPosRef.current.y, x, y],
      };
      prevPosRef.current = { x, y };
    } else if (drawTool === 'line') {
      el = {
        id: uid,
        type: 'line',
        color: drawColor,
        size: strokeWidth,
        points: [prevPosRef.current.x, prevPosRef.current.y, x, y],
      };
    } else if (drawTool === 'rect') {
      const w = x - prevPosRef.current.x;
      const h = y - prevPosRef.current.y;
      el = {
        id: uid,
        type: 'rect',
        color: drawColor,
        size: strokeWidth,
        x: prevPosRef.current.x,
        y: prevPosRef.current.y,
        width: w,
        height: h,
      };
    }

    if (el) {
      setWhiteboardElements((prev) => [...prev, el]);
      socketRef.current.emit('draw_canvas', { meetingId, element: el });
    }
  };

  const stopDrawingOnCanvas = () => {
    isDrawingRef.current = false;
  };

  const clearWhiteboardCanvas = () => {
    if (!socketRef.current) return;
    setWhiteboardElements([]);
    socketRef.current.emit('clear_canvas', { meetingId });
  };

  const copyCredentialsClipboard = () => {
    const text = `Meeting Room Alphanumeric ID: ${meetingId}\nPIN Passcode: ${passcode}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const triggerLeaveArchive = async () => {
    try {
      await fetch(`/api/meetings/${meetingId}/end`, { method: 'POST' });
    } catch {}
    onLeave();
  };

  return (
    <div id="room-workspace" className="min-h-screen bg-[#E0DFFD] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Upper Navigation block */}
      <header id="room-header" className="px-6 py-4 bg-slate-900/95 border-b border-white/5 flex items-center justify-between gap-6 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <VideoIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm truncate text-white leading-tight">
              {meeting?.title || 'Interactive WebRTC Conference'}
            </h2>
            <div className="flex items-center gap-2.5 mt-1 text-[10px] text-slate-400">
              <span className="font-mono bg-[#E0DFFD] px-1.5 py-0.5 rounded tracking-wide leading-none border border-white/5">ID: {meetingId}</span>
              <span className="font-mono text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10 leading-none">PIN: {passcode}</span>
              <button 
                onClick={copyCredentialsClipboard}
                className="hover:text-white shrink-0 bg-transparent flex items-center gap-1 font-semibold text-slate-400"
                title="Copy Creds"
              >
                {copySuccess ? <span className="text-emerald-400 text-[10px] font-bold">Successfully Copied!</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-semibold tracking-widest px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>WebSockets Signaling Enabled</span>
          </span>

          <button
            onClick={() => setShowDeviceSelector(!showDeviceSelector)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative"
            title="Configure Cameras & Mics"
          >
            <Settings className="w-4 h-4" />
          </button>

          {meeting?.hostId === user.id ? (
            <button 
              id="btn-close-meeting"
              onClick={triggerLeaveArchive}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>End Call</span>
            </button>
          ) : (
            <button 
              id="btn-leave-meeting"
              onClick={onLeave}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Room</span>
            </button>
          )}
        </div>
      </header>

      {/* Device Selectors drop overlay */}
      {showDeviceSelector && (
        <div className="relative z-30 bg-slate-900 border-b border-white/5 py-4 px-6 flex flex-col md:flex-row gap-6 items-center justify-center font-sans">
          <div className="flex flex-col gap-1 w-full max-w-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Video Feed source</span>
            <select
              value={selectedVideoId}
              onChange={(e) => selectHardwareInputDevice('video', e.target.value)}
              className="bg-[#E0DFFD] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              {videoDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full max-w-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Microphone Input source</span>
            <select
              value={selectedAudioId}
              onChange={(e) => selectHardwareInputDevice('audio', e.target.value)}
              className="bg-[#E0DFFD] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              {audioDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 5)}`}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowDeviceSelector(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold mt-4 md:mt-auto"
          >
            Finished Setup
          </button>
        </div>
      )}

      {/* Main viewport panels */}
      <section id="room-mid-section" className="flex-1 flex overflow-hidden">
        
        {/* Left side grid block */}
        <div className="flex-1 overflow-y-auto p-6 relative flex flex-col gap-6">
          
          {showWhiteboard ? (
            /* COLLABORATIVE SVG CANVAS DRAWER OVERLAY */
            <div className="flex-1 flex flex-col bg-slate-900 border border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl relative min-h-[450px]">
              <header className="flex justify-between items-center pb-3 border-b border-white/10 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span className="font-extrabold text-xs">Collaborative synched drawing board</span>
                </div>

                {/* Draw parameters Toolbar */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 border-r border-white/10 pr-3">
                    {['#818cf8', '#38bdf8', '#fb7185', '#34d399', '#fbbf24', '#ffffff'].map((c) => (
                      <button 
                        key={c}
                        onClick={() => setDrawColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-4 h-4 rounded-full border ${drawColor === c ? 'scale-125 border-white ring-2 ring-indigo-500/40' : 'border-transparent'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center bg-[#E0DFFD] p-1 rounded-lg border border-white/5 gap-1">
                    {['draw', 'line', 'rect', 'eraser'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setDrawTool(t)}
                        className={`px-2 py-1 text-[10px] font-bold rounded capitalize ${drawTool === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={clearWhiteboardCanvas}
                    className="p-1 px-2.5 rounded bg-rose-500/15 border border-rose-500/35 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold transition-all"
                  >
                    Clear Slate
                  </button>
                </div>
              </header>

              <div className="flex-1 bg-[#E0DFFD]/70 rounded-xl relative cursor-crosshair overflow-hidden border border-white/5">
                <canvas 
                  ref={canvasRef}
                  onMouseDown={startDrawingOnCanvas}
                  onMouseMove={drawOnCanvas}
                  onMouseUp={stopDrawingOnCanvas}
                  onMouseLeave={stopDrawingOnCanvas}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ) : (
            /* VIDEO CALL REAL GRIDS SYSTEM */
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-center">
              
              {/* Local Participant Frame */}
              <VideoFeed 
                stream={localStream}
                isMuted={isMuted}
                userName={user.name}
                isLocal={true}
                connectionState="connected"
              />

              {/* Connected webRTC endpoints */}
              {remoteStreams.map((peer) => (
                <VideoFeed 
                  key={peer.socketId}
                  stream={peer.stream}
                  isMuted={false}
                  userName={peer.userName}
                  isLocal={false}
                  connectionState={peer.connectionState}
                />
              ))}

              {/* Optional fallback placeholder if alone */}
              {remoteStreams.length === 0 && (
                <div className="p-1 bg-slate-900 border border-white/5 border-dashed overflow-hidden rounded-2xl aspect-[16/10] relative shadow-xl text-center flex flex-col items-center justify-center p-6">
                  <Laptop className="w-10 h-10 text-indigo-400/30 mb-3 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Awaiting conference participants</span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Send the room ID and passcode above to link remote connections over real WebRTC!</p>
                </div>
              )}

            </div>
          )}

          {/* Quick interactive media panel bar bottom */}
          <footer className="shrink-0 flex items-center justify-center py-3 bg-slate-900/40 rounded-xl border border-white/5 gap-4 relative z-10">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full flex items-center justify-center transition-all ${
                isCamOff ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isCamOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreen}
              className={`p-3 rounded-full flex items-center justify-center transition-all ${
                isSharingScreen ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isSharingScreen ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
            </button>

            <div className="w-px h-6 bg-white/10" />

            <button
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className={`p-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                showWhiteboard ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Canvas Board</span>
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                showSidebar ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Sidebar</span>
            </button>
          </footer>

        </div>

        {/* Sidebar module tabs drawer on right */}
        {showSidebar && (
          <aside id="room-sidebar" className="w-[360px] bg-slate-900 border-l border-white/5 flex flex-col justify-between overflow-hidden shrink-0 z-10">
            
            <div className="flex border-b border-white/5 bg-[#E0DFFD] shrink-0">
              {['chat', 'ai', 'polls', 'participants'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveSidebarTab(tab)}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                    activeSidebarTab === tab ? 'border-indigo-500 text-indigo-400 bg-slate-900' : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-slate-900">
              
              {/* Public Chats Panels */}
              {activeSidebarTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between gap-4 h-full">
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[60vh]">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 font-medium text-xs">
                        No messages inside public chats yet.
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={`p-3 rounded-xl max-w-[95%] text-left ${
                          msg.senderId === user.id ? 'bg-indigo-600/10 border border-indigo-500/20 ml-auto' : 'bg-[#E0DFFD] border border-white/5'
                        }`}>
                          <div className="flex justify-between items-center gap-4 mb-1">
                            <span className="font-extrabold text-[10px] text-indigo-400">{msg.senderName}</span>
                            <span className="text-[9px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-200 mt-1 leading-normal select-text">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 pt-3 mt-auto">
                    <input 
                      type="text" 
                      placeholder="Type a message to peers..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-[#E0DFFD] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                      type="submit"
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition-all transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Gemini assistant summaries tabs */}
              {activeSidebarTab === 'ai' && (
                <div id="ai-tab-view" className="flex-1 flex flex-col justify-between gap-4 h-full">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold mb-4 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
                      <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                      <span>Gemini model summary pipelines active!</span>
                    </div>

                    {aiResponse && (
                      <div className="p-4 rounded-xl bg-[#E0DFFD] border border-indigo-500/30 text-left mb-4 max-h-[45vh] overflow-y-auto">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Google Gemini answers:</span>
                        <div className="text-xs text-slate-200 leading-relaxed select-text space-y-2 whitespace-pre-line">
                          {aiResponse}
                        </div>
                      </div>
                    )}

                    {aiLoading && (
                      <div className="p-4 rounded-xl bg-[#E0DFFD] border border-indigo-500/20 text-center text-xs text-slate-400 flex items-center justify-center gap-2 animate-pulse mb-4">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span>Prompt compiling, scanning data pools...</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAskAssistant} className="flex flex-col gap-2 border-t border-white/5 pt-3 mt-auto">
                    <span className="text-[9px] text-slate-500">Ask: "Summarize chats", ou "Write action checklists"</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ask copilot..." 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1 bg-[#E0DFFD] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        type="submit"
                        className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 px-3 flex items-center gap-1.5 animate-pulse"
                      >
                        <span>Query</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Vote polls panels */}
              {activeSidebarTab === 'polls' && (
                <div className="flex-1 flex flex-col gap-6">
                  {polls.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {polls.map((p) => {
                        const totalVotes = Object.values(p.votes).reduce((sum, v) => sum + v, 0);
                        return (
                          <div key={p.id} className="p-4 rounded-xl bg-[#E0DFFD] border border-white/5 text-left">
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <span className="font-extrabold text-xs text-slate-200 leading-normal">{p.question}</span>
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                p.isActive ? 'bg-emerald-500/25 text-emerald-400' : 'bg-slate-800 text-slate-500'
                              }`}>
                                {p.isActive ? 'Active' : 'Closed'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              {p.options.map((opt, oIdx) => {
                                const votesCount = p.votes[oIdx] || 0;
                                const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                                return (
                                  <button 
                                    key={oIdx}
                                    disabled={!p.isActive}
                                    onClick={() => submitVote(p.id, oIdx)}
                                    className="w-full p-2.5 rounded-lg border text-xs text-left relative overflow-hidden flex justify-between items-center transition-all bg-slate-900 border-white/5 hover:border-slate-800"
                                  >
                                    <span style={{ width: `${percentage}%` }} className="absolute inset-y-0 left-0 bg-indigo-500/10 transition-all duration-500" />
                                    <span className="relative z-10 font-bold text-slate-300">{opt}</span>
                                    <span className="relative z-10 font-mono text-[10px] text-indigo-400">{percentage}% ({votesCount})</span>
                                  </button>
                                );
                              })}
                            </div>

                            {meeting?.hostId === user.id && p.isActive && (
                              <button 
                                onClick={() => handleClosePoll(p.id)}
                                className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-rose-400 mt-4 text-[9px] uppercase font-bold text-slate-400 border border-white/5 text-center block transition-all"
                              >
                                Close Poll Votes
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {meeting?.hostId === user.id ? (
                    <form onSubmit={handleCreatePollSubmit} className="p-4 rounded-xl bg-[#E0DFFD] border border-white/5 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-3">Launch feedback ballot</span>
                      
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-1">Question</label>
                          <input 
                            type="text" 
                            placeholder="Do we ship tomorrow?" 
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
                            required
                          />
                        </div>

                        {pollOptions.map((opt, idx) => (
                          <div key={idx}>
                            <label className="text-[9px] font-bold text-slate-400 block mb-1">Option {idx + 1}</label>
                            <input 
                              type="text" 
                              placeholder={`Option ${idx + 1}`} 
                              value={opt}
                              onChange={(e) => {
                                const list = [...pollOptions];
                                list[idx] = e.target.value;
                                setPollOptions(list);
                              }}
                              className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                              required={idx < 2}
                            />
                          </div>
                        ))}

                        <button 
                          type="button"
                          onClick={() => setPollOptions([...pollOptions, ''])}
                          className="text-[10px] font-bold text-indigo-400 hover:text-white flex items-center gap-1 self-start mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>

                        <button 
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white shadow-md shadow-indigo-600/20 mt-4"
                        >
                          Launch Poll
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic text-center py-6">Only meeting hosts can create voting polls.</p>
                  )}
                </div>
              )}

              {/* Participants listings */}
              {activeSidebarTab === 'participants' && (
                <div className="flex-1 flex flex-col gap-4 text-left">
                  <div className="bg-[#E0DFFD]/45 p-2 rounded-lg border border-white/5 mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Active Sockets Count</span>
                    <span className="text-xs font-black text-white">{1 + remoteStreams.length} Connected Peer sessions</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Local User */}
                    <div className="p-3 bg-[#E0DFFD] border border-indigo-500/10 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        <div>
                          <span className="font-bold text-xs text-white">{user.name} (You)</span>
                          <span className="text-[9px] text-indigo-400 block font-semibold uppercase">Meeting Host</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 lowercase">active streaming</span>
                    </div>

                    {/* Remote Sockets streams list */}
                    {remoteStreams.map((peer) => (
                      <div key={peer.socketId} className="p-3 bg-[#E0DFFD] border border-white/5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${peer.connectionState === 'connected' ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
                          <div>
                            <span className="font-bold text-xs text-slate-200">{peer.userName}</span>
                            <span className="text-[8px] text-slate-500 block font-mono">socket: {peer.socketId.slice(0, 8)}</span>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                          peer.connectionState === 'connected' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {peer.connectionState || 'connecting'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

      </section>

    </div>
  );
}