import { useState } from "react";
import {
  GraduationCap,
  Eye,
  EyeOff,
  User,
  BookOpen,
  Utensils,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { authApi, setAuthSession } from "./api";

const ROLES = [
  {
    id: "student",
    backendRole: "USER",
    label: "Student",
    description: "Access courses, canteen & attendance",
    icon: GraduationCap,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "faculty",
    backendRole: "FACULTY",
    label: "Faculty",
    description: "Host live QR attendance & manage classes",
    icon: BookOpen,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "canteen",
    backendRole: "CANTEEN",
    label: "Canteen Owner",
    description: "Manage live orders & food menu stock",
    icon: Utensils,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "admin",
    backendRole: "ADMIN",
    label: "Admin",
    description: "Campus-wide analytics & administrative control",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

const DEMO_ACCOUNTS = [
  {
    role: "student",
    label: "Student",
    email: "student@campus.edu",
    password: "Password@123",
    icon: GraduationCap,
    color: "border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100",
  },
  {
    role: "faculty",
    label: "Faculty",
    email: "prof.sharma@campus.edu",
    password: "Password@123",
    icon: BookOpen,
    color: "border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100",
  },
  {
    role: "canteen",
    label: "Canteen Owner",
    email: "canteen@campus.edu",
    password: "Password@123",
    icon: Utensils,
    color: "border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100",
  },
  {
    role: "admin",
    label: "Admin",
    email: "admin@campus.edu",
    password: "Password@123",
    icon: ShieldCheck,
    color: "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100",
  },
];

function Auth({ initialMode = "login", onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const inputStyle =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition";

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    setShowPassword(false);
  };

  // Quick-fill demo credentials
  const fillDemoAccount = (demo) => {
    setForm((prev) => ({
      ...prev,
      email: demo.email,
      password: demo.password,
      confirmPassword: demo.password,
    }));
    setSelectedRole(demo.role);
    setError("");
    setSuccessMsg(`Pre-filled ${demo.label} demo account! Click "Login" to enter.`);
  };

  // One-click instant login for demos
  const quickLoginAs = async (demo) => {
    setForm({
      name: demo.label,
      email: demo.email,
      password: demo.password,
      confirmPassword: demo.password,
    });
    setSelectedRole(demo.role);
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(demo.email, demo.password);
      completeAuth(data, demo.role);
    } catch (err) {
      setError(err.message || "Failed to login with demo credentials.");
    } finally {
      setLoading(false);
    }
  };

  const completeAuth = (data, forcedRole) => {
    const roleMapping = {
      USER: "student",
      STUDENT: "student",
      TEACHER: "faculty",
      FACULTY: "faculty",
      ADMIN: "admin",
      CANTEEN: "canteen",
    };

    const assignedRole = forcedRole || selectedRole || roleMapping[data.user?.role] || "student";

    const loggedInUser = {
      ...data.user,
      role: assignedRole,
      roleLabel: {
        student: "Student",
        faculty: "Faculty",
        canteen: "Canteen Owner",
        admin: "Admin",
      }[assignedRole] || "Student",
      profileImage: "",
    };

    // Store in-memory session in api.js
    setAuthSession(data.token, loggedInUser);

    // Save in localStorage for persistent session handling
    try {
      localStorage.setItem("campusCurrentUser", JSON.stringify(loggedInUser));
      localStorage.setItem("campusToken", data.token);
      localStorage.setItem("campusCurrentRole", assignedRole);
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }

    onAuthSuccess?.(loggedInUser);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const currentRoleObj = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

      // REGISTER
      if (mode === "register") {
        await authApi.register({
          name: form.name.trim(),
          email,
          password,
          phone: "",
          role: currentRoleObj.backendRole,
        });
      }

      // LOGIN
      const data = await authApi.login(email, password);

      if (!data.token || !data.user) {
        throw new Error("Invalid response received from authentication server.");
      }

      completeAuth(data, selectedRole);
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F1F5F9] px-4 py-8 sm:px-8">
      {/* MAIN AUTH CARD */}
      <div
        className="w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-10"
        style={{
          maxWidth: "760px",
        }}
      >
        {/* LOGO AND HEADING */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-[#4F46E5] shadow-sm">
            <GraduationCap size={40} />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Campus Platform
          </h1>

          <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-[#4F46E5]">
            CampusConnect Digital Ecosystem
          </p>

          <h2 className="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">
            {mode === "login" ? "Welcome Back!" : "Create Your Account"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Select your campus role and sign in to access your dashboard"
              : "Register your profile and choose your campus role to get started"}
          </p>
        </div>

        {/* QUICK DEMO LOGIN BUTTONS (ON LOGIN MODE) */}
        {mode === "login" && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                <Sparkles size={14} /> Quick Demo Switcher (Instant 1-Click Login)
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Pre-seeded roles</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => quickLoginAs(demo)}
                    title={`Instant login as ${demo.label}`}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition active:scale-95 ${demo.color}`}
                  >
                    <Icon size={18} className="mb-1" />
                    <span className="text-xs font-extrabold">{demo.label}</span>
                    <span className="text-[10px] opacity-70">Demo</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {error}
          </div>
        )}

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SELECT ROLE DROPDOWN */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Select Your Role <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-base font-semibold text-slate-800 outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition"
              >
                <option value="student">🎓 Student — View Schedule, Attendance & Canteen</option>
                <option value="faculty">📚 Faculty — Launch QR Attendance & Course Rosters</option>
                <option value="canteen">🍳 Canteen Owner — Manage Live Orders & Stock</option>
                <option value="admin">🛡️ Admin — Full Platform Administration & Metrics</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Selected:{" "}
              <span className="font-bold text-[#4F46E5]">
                {ROLES.find((r) => r.id === selectedRole)?.label}
              </span>{" "}
              — {ROLES.find((r) => r.id === selectedRole)?.description}
            </p>
          </div>

          {/* FULL NAME (REGISTRATION ONLY) */}
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                className={inputStyle}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              placeholder="name@campus.edu"
              className={inputStyle}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center rounded-xl border border-slate-300 bg-white pr-3 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/20 transition">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full rounded-xl px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD (REGISTRATION ONLY) */}
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Re-enter your password"
                className={inputStyle}
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] py-4 text-lg font-bold text-white shadow-lg shadow-indigo-600/25 transition duration-200 hover:bg-[#4338CA] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === "login" ? (
              <span>Sign In as {ROLES.find((r) => r.id === selectedRole)?.label}</span>
            ) : (
              <span>Register as {ROLES.find((r) => r.id === selectedRole)?.label}</span>
            )}
          </button>
        </form>

        {/* SWITCH LOGIN / REGISTER */}
        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          {mode === "login" ? "Need a new account? " : "Already registered? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-bold text-[#4F46E5] hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in here"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
