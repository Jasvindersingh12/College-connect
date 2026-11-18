import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  GraduationCap,
  LayoutDashboard,
  QrCode,
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Search,
  LogOut,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Building,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { attendanceApi, hubApi } from "./api";

const SUBJECTS = [
  { id: "MCA-MKT-101", name: "MCA 1st Year - OS", room: "Lecture Hall 204", studentsCount: 48 },
  { id: "MCA-FIN-201", name: "MCA 2nd Year - JAVA", room: "Hall B", studentsCount: 42 },
  { id: "MCA-HRM-301", name: "MCA 3rd Year - linux", room: "Seminar Hall 1", studentsCount: 36 },
  { id: "MCA-BA-102", name: "MCA 1st Year -DBMS", room: "Computer Lab 3", studentsCount: 45 },
];

export default function FacultyDashboard({
  user,
  onLogout = () => {},
  onNavigate = () => {},
}) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sessions, setSessions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");

  // QR Attendance Generator State
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  const [room, setRoom] = useState(SUBJECTS[0].room);
  const [durationMins, setDurationMins] = useState("15");
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Mid-Term Project Guidelines Released",
      content: "All BBA 1st Year students must submit their marketing campaign synopses by Friday 5 PM.",
      date: "Nov 17, 2026",
      subject: "Marketing",
    },
    {
      id: 2,
      title: "Guest Lecture: FinTech Disruptions",
      content: "Industry speaker session scheduled for Wednesday 11:30 AM in Auditorium 2.",
      date: "Nov 15, 2026",
      subject: "Finance",
    },
  ]);

  const facultyName = user?.name || "Prof. Sharma";

  // Load real attendance data from PostgreSQL
  const loadData = async () => {
    try {
      setLoading(true);
      const [sessData, recData] = await Promise.all([
        attendanceApi.getSessions(),
        attendanceApi.getRecords(),
      ]);
      if (Array.isArray(sessData)) {
        setSessions(sessData);
        // Find if any active session exists
        const currentActive = sessData.find((s) => s.active);
        if (currentActive && !activeSession) {
          setActiveSession(currentActive);
        }
      }
      if (Array.isArray(recData)) {
        setRecords(recData);
      }
    } catch (err) {
      console.warn("Could not fetch faculty attendance data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown for active QR session
  useEffect(() => {
    if (!activeSession) {
      setTimeLeft(0);
      return;
    }

    const expiresAt = activeSession.expiresAt
      ? new Date(activeSession.expiresAt).getTime()
      : Date.now() + 15 * 60 * 1000;

    const timer = setInterval(() => {
      const remainingSec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  // Generate Live QR Attendance Session
  const handleGenerateQR = async () => {
    const subjObj = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];
    const numericCode = String(Math.floor(100000 + Math.random() * 900000));
    const durationNum = parseInt(durationMins, 10) || 15;
    const expiresAt = new Date(Date.now() + durationNum * 60 * 1000).toISOString();

    const payload = {
      subject: subjObj.name,
      room: room.trim() || subjObj.room,
      code: numericCode,
      teacherId: user?.id && String(user.id).length === 36 ? user.id : null,
      teacherName: facultyName,
      expiresAt,
    };

    try {
      const created = await attendanceApi.createSession(payload);
      setActiveSession(created);
      setTimeLeft(durationNum * 60);
      setSessions((prev) => [created, ...prev]);
      notify(`Live QR Session launched for ${subjObj.name}! Code: ${numericCode}`);
    } catch (err) {
      alert("Failed to start session: " + err.message);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      await attendanceApi.closeSession(activeSession.id);
      setActiveSession(null);
      setTimeLeft(0);
      notify("QR Attendance session closed successfully.");
      loadData();
    } catch (err) {
      alert("Failed to close session: " + err.message);
    }
  };

  // Submit announcement
  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    const newPost = {
      id: Date.now(),
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      subject: "BBA Department",
    };

    setAnnouncements((prev) => [newPost, ...prev]);
    setAnnouncementTitle("");
    setAnnouncementContent("");
    notify("Announcement published to student notice board!");
  };

  // Filter students who checked into current active session
  const activeSessionCheckIns = useMemo(() => {
    if (!activeSession) return [];
    return records.filter((r) => r.sessionId === activeSession.id);
  }, [records, activeSession]);

  // Overall attendance rate
  const overallRate = useMemo(() => {
    if (!records.length) return 88;
    const present = records.filter((r) => r.status === "Present").length;
    return Math.round((present / records.length) * 100);
  }, [records]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <GraduationCap size={26} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                  CampusConnect
                </span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                  Faculty Portal
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                COLLEDGE 
              </p>
            </div>
          </div>

          {/* MAIN TOP NAV LINKS */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "QR Attendance", label: "QR Attendance", icon: QrCode },
              { id: "My Classes", label: "My Classes", icon: BookOpen },
              { id: "Campus Hub", label: "Campus Hub", icon: Bell },
              { id: "Canteen", label: "Canteen", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeNav === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(tab.id);
                    if (tab.id === "Campus Hub") onNavigate("campusHub");
                    if (tab.id === "Canteen") onNavigate("canteen");
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: USER PROFILE CHIP + LOGOUT BUTTON */}
          <div className="flex items-center gap-3">
            {/* User Profile Chip */}
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-slate-50/80 py-1 pl-1.5 pr-3 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-sm">
                {facultyName.split(" ").map((n) => n[0]).slice(0, 2).join("") || "FC"}
              </div>
              <div className="text-left">
                <p className="max-w-[130px] truncate text-xs font-extrabold text-slate-900 leading-tight">
                  {facultyName}
                </p>
                <span className="inline-block rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-purple-700">
                  Faculty
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-95 shadow-sm"
              title="Logout from Faculty account"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-blue-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl">
          <Sparkles size={18} className="text-blue-300" />
          {notification}
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* GREETING BANNER */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/15 sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
              <CalendarDays size={13} /> {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Good Morning, {facultyName}!
            </h1>
            <p className="mt-1 text-sm text-blue-100/90">
              Manage your class lectures, host real-time QR attendance, and track student check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveNav("QR Attendance");
                const element = document.getElementById("qr-section");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95"
            >
              <QrCode size={18} />
              <span>Launch Live QR</span>
            </button>
          </div>
        </div>

        {/* 4 TOP KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Today's Classes */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Lectures
              </span>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <BookOpen size={20} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">3 Sessions</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Next: Marketing @ 11:30 AM</p>
          </div>

          {/* Card 2: Attendance Rate */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Avg Class Attendance
              </span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{overallRate}%</p>
            <p className="mt-1 text-xs font-medium text-emerald-600">+4% higher than last semester</p>
          </div>

          {/* Card 3: Active QR Sessions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active QR Sessions
              </span>
              <div className={`rounded-xl p-2.5 ${activeSession ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
                <QrCode size={20} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {activeSession ? "1 Live" : "None"}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {activeSession ? `${activeSession.subject.slice(0, 22)}...` : "Ready to broadcast"}
            </p>
          </div>

          {/* Card 4: Campus Notices */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Campus Notices
              </span>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Bell size={20} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">4 Active</p>
            <p className="mt-1 text-xs font-medium text-slate-500">1 urgent administrative alert</p>
          </div>
        </div>

        {/* ================= QR ATTENDANCE GENERATOR & MONITOR (PANEL 9) ================= */}
        <section id="qr-section" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Panel 9 • Real-Time Attendance
              </span>
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                Live QR Code Attendance Generator & Monitor
              </h2>
              <p className="text-xs text-slate-500">
                Select your batch, generate a dynamic 6-digit code, and monitor real-time student check-ins.
              </p>
            </div>

            {activeSession && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-amber-700 border border-amber-200">
                  <Clock size={16} className="animate-spin" />
                  <span className="text-xs font-bold">Session Timer:</span>
                  <span className="text-base font-black font-mono">{formatTimer(timeLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseSession}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-red-700"
                >
                  Close Session
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT CONFIGURATION PANEL (4 Cols) */}
            <div className="space-y-4 lg:col-span-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                Session Setup
              </h3>

              {/* Subject selector */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Select Class / Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    const s = SUBJECTS.find((sub) => sub.id === e.target.value);
                    if (s) setRoom(s.room);
                  }}
                  disabled={!!activeSession}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white disabled:opacity-60"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentsCount} Students)
                    </option>
                  ))}
                </select>
              </div>

              {/* Room & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Lecture Room
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    disabled={!!activeSession}
                    placeholder="e.g. Hall 204"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Session Duration
                  </label>
                  <select
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    disabled={!!activeSession}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:bg-white disabled:opacity-60"
                  >
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              {!activeSession ? (
                <button
                  type="button"
                  onClick={handleGenerateQR}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <Play size={18} />
                  <span>Generate Live QR Code</span>
                </button>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Active Session Code
                  </span>
                  <p className="mt-1 text-3xl font-black font-mono tracking-widest text-blue-900">
                    {activeSession.code || activeSession.sessionCode}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Students can scan the QR code or manually enter this 6-digit code.
                  </p>
                </div>
              )}

              {/* Quick Instructions */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">Faculty Instructions:</p>
                <p>1. Display the QR code on the lecture hall projector screen.</p>
                <p>2. Students scan via the CampusConnect Student Portal scanner.</p>
                <p>3. Check-ins are validated and recorded live in the PostgreSQL database.</p>
              </div>
            </div>

            {/* RIGHT QR & LIVE MONITOR DISPLAY (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
              {activeSession ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* QR Display */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white bg-white p-5 shadow-sm">
                    <QRCodeSVG
                      value={JSON.stringify({
                        type: "campusconnect-attendance",
                        sessionId: activeSession.id,
                        code: activeSession.code || activeSession.sessionCode,
                        subject: activeSession.subject,
                      })}
                      size={180}
                      level="H"
                      className="rounded-lg shadow-sm"
                    />

                    <div className="mt-4 text-center">
                      <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        ● Broadcasting Live
                      </span>
                      <p className="mt-2 text-xs font-bold text-slate-700">
                        {activeSession.subject}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {activeSession.room || "Room 204"} • {formatTimer(timeLeft)} left
                      </p>
                    </div>
                  </div>

                  {/* Real-Time Check-In Roster */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Live Check-Ins ({activeSessionCheckIns.length})
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-600 animate-pulse">
                        Auto-syncing
                      </span>
                    </div>

                    <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                      {activeSessionCheckIns.length === 0 ? (
                        <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center">
                          <Users size={24} className="text-slate-300 mb-1" />
                          <p className="text-xs font-semibold text-slate-500">
                            Waiting for students to scan...
                          </p>
                        </div>
                      ) : (
                        activeSessionCheckIns.map((st, idx) => (
                          <div
                            key={st.id || idx}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                                {idx + 1}
                              </div>
                              <span className="font-bold text-slate-800">
                                {st.studentName}
                              </span>
                            </div>
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Verified ✓
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 mb-4">
                    <QrCode size={32} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    No Active QR Session
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Click <strong>"Generate Live QR Code"</strong> on the left to start streaming a dynamic session QR to your class.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= RECENT ATTENDANCE STATS & ANNOUNCEMENTS ================= */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* PAST ATTENDANCE LOG (7 COLS) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7 lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Recent Lecture Attendance Logs
                </h3>
                <p className="text-xs text-slate-500">Past lectures and verified student turnout</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <RotateCcw size={13} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Subject / Batch</th>
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Turnout</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.slice(0, 5).map((s) => {
                    const count = records.filter((r) => r.sessionId === s.id).length;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 font-bold text-slate-800">{s.subject}</td>
                        <td className="py-3 text-slate-500">{s.room || "Room 204"}</td>
                        <td className="py-3 font-mono font-bold text-blue-600">{s.code || s.sessionCode}</td>
                        <td className="py-3 font-semibold text-slate-700">{count || "—"} students</td>
                        <td className="py-3">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              s.active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {s.active ? "Active" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No previous sessions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUICK ANNOUNCEMENT BROADCAST (5 COLS) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7 lg:col-span-5">
            <div className="mb-4">
              <h3 className="text-lg font-black text-slate-900">
                Post Class Announcement
              </h3>
              <p className="text-xs text-slate-500">
                Broadcast instant notices to students in your department
              </p>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Notice Title (e.g. Assignment Due Date)"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Type full instructions or announcement details..."
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
              >
                <Send size={14} />
                Publish Announcement
              </button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Recent Department Notices
              </p>
              {announcements.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
