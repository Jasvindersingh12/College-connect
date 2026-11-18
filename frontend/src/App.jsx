import { useState, useEffect } from "react";
import {
  GraduationCap,
  House,
  ShoppingCart,
  Utensils,
  QrCode,
  Users,
  Store,
  CalendarDays,
  Building2,
  UserCircle,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import Auth from "./Auth";
import Canteen from "./Canteen";
import About from "./About";
import Marketplace from "./Marketplace";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";
import CanteenOwner from "./CanteenOwner";
import FacultyDashboard from "./FacultyDashboard";
import CampusHub from "./CampusHub";
import ProfileSettings from "./ProfileSettings";
import Attendance from "./Attendance";
import { clearAuthSession } from "./api";

// Helper to determine role-based landing dashboard
export const getDashboardForRole = (role) => {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "canteen" || r === "owner" || r.includes("canteen")) return "canteenOwner";
  if (r === "faculty" || r === "teacher") return "faculty";
  return "dashboard"; // Student Dashboard
};

// ======================================================
// HERO SECTION
// ======================================================

function Hero({ onGetStarted, loggedInUser }) {
  return (
    <section
      id="home"
      className="relative flex min-h-[540px] items-center justify-center overflow-hidden bg-cover bg-center px-6 py-20 text-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.80)), url('/campus.png')",
      }}
    >
      <div className="max-w-3xl text-white">
        <p className="mb-4 text-xs font-bold uppercase tracking-[4px] text-blue-300">
          Your Campus, Your Community
        </p>

        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Welcome to{" "}
          <span className="text-blue-400">
            CampusConnect
          </span>
        </h1>

        <p className="mb-8 text-base leading-relaxed text-slate-200 sm:text-lg md:text-xl">
          Announcements · Marketplace · Canteen · QR Attendance · Campus Hub
        </p>

        <button
          type="button"
          onClick={onGetStarted}
          className="inline-flex h-14 min-w-[170px] items-center justify-center gap-3 whitespace-nowrap rounded-full bg-blue-600 px-8 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
        >
          <span>
            {loggedInUser ? "Go to Dashboard" : "Get Started"}
          </span>
          <span className="text-xl">→</span>
        </button>
      </div>
    </section>
  );
}

// ======================================================
// FEATURES COMPONENT
// ======================================================

function Features({
  onCampusHubClick,
  onCanteenClick,
  onMarketplaceClick,
  onAttendanceClick,
}) {
  const features = [
    {
      title: "Campus Hub",
      description: "Stay updated with the latest campus announcements, notices, and events.",
      icon: House,
      action: onCampusHubClick,
    },
    {
      title: "Marketplace",
      description: "Buy and sell books, calculators, project components, and accessories.",
      icon: ShoppingCart,
      action: onMarketplaceClick,
    },
    {
      title: "Canteen",
      description: "Pre-order meals, track live food preparation, and skip long cafeteria queues.",
      icon: Utensils,
      action: onCanteenClick,
    },
    {
      title: "QR Attendance",
      description: "Mark lecture attendance instantly with dynamic numeric QR check-ins.",
      icon: QrCode,
      action: onAttendanceClick,
    },
  ];

  return (
    <section id="features" className="bg-[#F8FAFC] px-6 py-16 sm:py-24">
      <div className="mb-14 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
          Explore CampusConnect
        </p>

        <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
          Everything Your Campus Needs
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          One unified platform built specifically for students, faculty, and campus staff.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-[1170px] grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <button
              key={feature.title}
              type="button"
              onClick={feature.action}
              className="group flex aspect-square w-full max-w-[270px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white shadow-sm">
                <Icon size={32} />
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                {feature.title}
              </h3>

              <p className="text-xs leading-relaxed text-slate-500">
                {feature.description}
              </p>

              <span className="mt-4 translate-y-1 text-xs font-bold text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                Explore Now →
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ======================================================
// STATISTICS COMPONENT
// ======================================================

function Stats() {
  const stats = [
    { number: "500+", label: "Active Students", icon: Users },
    { number: "100+", label: "Marketplace Listings", icon: Store },
    { number: "50+", label: "Events This Month", icon: CalendarDays },
    { number: "10+", label: "Campus Departments", icon: Building2 },
  ];

  return (
    <section className="bg-white px-6 py-16 border-t border-slate-100">
      <div className="mx-auto grid w-full max-w-[1170px] grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="flex w-full max-w-[260px] flex-col items-center rounded-2xl border border-slate-200/70 bg-[#F8FAFC] p-6 text-center shadow-sm"
            >
              <div className="mb-3 rounded-2xl bg-blue-50 p-3.5 text-blue-600">
                <Icon size={28} />
              </div>

              <h3 className="text-3xl font-extrabold text-slate-900">
                {stat.number}
              </h3>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ======================================================
// NAVBAR COMPONENT
// ======================================================

function Navbar({
  onAuthClick,
  onAboutClick,
  onContactClick,
  loggedInUser,
  onDashboardClick,
  onLogout,
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <GraduationCap size={32} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              CampusConnect
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Unified Campus Platform
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-10 text-sm font-semibold text-slate-600 md:flex">
          <a href="#home" className="text-blue-600">
            Home
          </a>
          <a href="#features" className="transition hover:text-blue-600">
            Features
          </a>
          <button
            type="button"
            onClick={onAboutClick}
            className="transition hover:text-blue-600"
          >
            About
          </button>
          <button
            type="button"
            onClick={onContactClick}
            className="transition hover:text-blue-600"
          >
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          {loggedInUser ? (
            <>
              {/* User Chip */}
              <button
                type="button"
                onClick={onDashboardClick}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                {loggedInUser.profileImage ? (
                  <img
                    src={loggedInUser.profileImage}
                    alt="Profile"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle size={22} className="text-blue-600" />
                )}

                <div className="text-left text-xs">
                  <span className="block max-w-[110px] truncate font-bold">
                    {loggedInUser.name || "User"}
                  </span>
                  <span className="block text-[10px] font-bold text-blue-600 uppercase">
                    {loggedInUser.role || "Member"}
                  </span>
                </div>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                title="Logout"
                className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onAuthClick("login")}
                className="inline-flex min-w-[100px] items-center justify-center whitespace-nowrap rounded-full border-2 border-blue-600 px-5 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => onAuthClick("register")}
                className="inline-flex min-w-[110px] items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ======================================================
// CONTACT PAGE
// ======================================================

function ContactPage({ onBack }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Thank you for contacting CampusConnect! Your message has been received.");
    event.target.reset();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            CampusConnect
          </h1>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          Back to Home
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[3px] text-blue-600">
            We'd Love to Hear From You
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-slate-500">
            Have questions about student portals, attendance, or canteen services? Contact us.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200 md:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-[#0F1E36] p-8 text-white sm:p-10">
            <h2 className="text-2xl font-extrabold">Contact Info</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              CampusConnect Digital Administration & Technical Helpdesk
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2.5 text-blue-300">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Email</p>
                  <p className="text-sm font-bold text-white">support@campusconnect.edu</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2.5 text-blue-300">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Helpline</p>
                  <p className="text-sm font-bold text-white">+91 (011) 2345-6789</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2.5 text-blue-300">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Campus Center</p>
                  <p className="text-sm font-bold text-white"> Campus, Academic Block 2</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <h2 className="text-xl font-extrabold text-slate-900">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Your Name</label>
                <input required className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <input required type="email" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800" placeholder="you@campus.edu" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Message</label>
                <textarea required rows="4" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800" placeholder="How can we assist you?" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700">
                Send Message
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

// ======================================================
// MAIN APP COMPONENT
// ======================================================

function App() {
  const [authMode, setAuthMode] = useState(null);

  // Restore session from localStorage if present
  const getInitialUser = () => {
    try {
      const stored = localStorage.getItem("campusCurrentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return {
            ...parsed,
            role: (parsed.role || "student").toLowerCase(),
          };
        }
      }
    } catch (e) {
      console.warn("Could not read stored user:", e);
    }
    return null;
  };

  const [loggedInUser, setLoggedInUser] = useState(getInitialUser);
  const [currentPage, setCurrentPage] = useState(() => {
    const user = getInitialUser();
    if (user) {
      return getDashboardForRole(user.role);
    }
    return "home";
  });

  const [previousPage, setPreviousPage] = useState("home");

  const getRoleLabel = (role) => {
    const roles = {
      student: "Student",
      teacher: "Teacher",
      faculty: "Teacher",
      admin: "Admin",
      canteen: "Canteen Owner",
      owner: "Canteen Owner",
    };
    return roles[(role || "").toLowerCase()] || "User";
  };

  // ====================================================
  // NAVIGATION HELPERS
  // ====================================================

  const openMarketplace = () => {
    setPreviousPage(currentPage);
    setCurrentPage("marketplace");
  };

  const openCampusHub = () => {
    setPreviousPage(currentPage);
    setCurrentPage("campusHub");
  };

  const openCanteen = () => {
    setPreviousPage(currentPage);
    if (
      loggedInUser &&
      ["canteen", "owner", "canteen owner"].includes(loggedInUser.role?.toLowerCase())
    ) {
      setCurrentPage("canteenOwner");
    } else {
      setCurrentPage("canteen");
    }
  };

  const openAttendance = () => {
    setPreviousPage(currentPage);
    if (
      loggedInUser &&
      ["faculty", "teacher"].includes(loggedInUser.role?.toLowerCase())
    ) {
      setCurrentPage("faculty");
    } else {
      setCurrentPage("attendance");
    }
  };

  const openProfileSettings = () => {
    setPreviousPage(currentPage);
    setCurrentPage("profileSettings");
  };

  const openContact = () => {
    setPreviousPage(currentPage);
    setCurrentPage("contact");
  };

  const handleDashboardClick = () => {
    if (!loggedInUser) {
      setAuthMode("login");
      return;
    }
    const target = getDashboardForRole(loggedInUser.role);
    setCurrentPage(target);
  };

  // ====================================================
  // AUTH SUCCESS HANDLER
  // ====================================================

  const handleAuthSuccess = (user) => {
    const normalizedRole = (user.role || "student").toLowerCase();
    const updatedUser = {
      ...user,
      name: user.name?.trim() || "User",
      role: normalizedRole,
    };

    localStorage.setItem("campusCurrentUser", JSON.stringify(updatedUser));
    localStorage.setItem("campusCurrentRole", normalizedRole);

    setLoggedInUser(updatedUser);
    setAuthMode(null);

    // Redirect to respective dedicated role dashboard
    const targetDashboard = getDashboardForRole(normalizedRole);
    setCurrentPage(targetDashboard);
  };

  // ====================================================
  // UPDATE USER PROFILE
  // ====================================================

  const handleUserUpdate = (updatedUser) => {
    const mergedUser = {
      ...loggedInUser,
      ...updatedUser,
    };
    setLoggedInUser(mergedUser);
    localStorage.setItem("campusCurrentUser", JSON.stringify(mergedUser));
  };

  // ====================================================
  // GLOBAL LOGOUT HANDLER
  // ====================================================

  const handleLogout = () => {
    clearAuthSession();
    try {
      localStorage.removeItem("campusCurrentUser");
      localStorage.removeItem("campusToken");
      localStorage.removeItem("campusCurrentRole");
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    setLoggedInUser(null);
    setAuthMode(null);
    setCurrentPage("home");
    setPreviousPage("home");
  };

  // ====================================================
  // AUTH MODAL / PAGE
  // ====================================================

  if (authMode) {
    return (
      <Auth
        key={authMode}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // ====================================================
  // PROFILE SETTINGS PAGE
  // ====================================================

  if (currentPage === "profileSettings") {
    if (!loggedInUser) {
      return (
        <Auth
          initialMode="login"
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <ProfileSettings
        user={loggedInUser}
        onUserUpdate={handleUserUpdate}
        onBack={() => {
          setCurrentPage(previousPage || getDashboardForRole(loggedInUser.role));
        }}
      />
    );
  }

  // ====================================================
  // ATTENDANCE PAGE (STUDENT CHECK-IN)
  // ====================================================

  if (currentPage === "attendance") {
    if (!loggedInUser) {
      return (
        <Auth
          initialMode="login"
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return <Attendance user={loggedInUser} />;
  }

  // ====================================================
  // DEDICATED ROLE DASHBOARDS
  // ====================================================

  // 1. CANTEEN OWNER DASHBOARD (Panel 10 Layout)
  if (currentPage === "canteenOwner") {
    if (!loggedInUser) {
      return (
        <Auth
          initialMode="login"
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <CanteenOwner
        user={loggedInUser}
        onDashboardClick={() => setCurrentPage("canteenOwner")}
        onLogout={handleLogout}
      />
    );
  }

  // 2. FACULTY DASHBOARD (Panel 3 & 9 Layout)
  if (currentPage === "faculty") {
    if (!loggedInUser) {
      return (
        <Auth
          initialMode="login"
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <FacultyDashboard
        user={loggedInUser}
        onLogout={handleLogout}
        onNavigate={(page) => {
          if (page === "Campus Hub") openCampusHub();
          else if (page === "Canteen") openCanteen();
          else if (page === "Settings") openProfileSettings();
        }}
      />
    );
  }

  // 3. ADMIN DASHBOARD (Panel 10 Layout)
  if (currentPage === "admin") {
    if (!loggedInUser) {
      return (
        <Auth
          initialMode="login"
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <AdminDashboard
        user={loggedInUser}
        onLogout={handleLogout}
        onProfileClick={openProfileSettings}
        onNavigate={(page) => {
          if (page === "Marketplace") {
            setPreviousPage("admin");
            setCurrentPage("marketplace");
          } else if (page === "Canteen") {
            setPreviousPage("admin");
            setCurrentPage("canteenOwner");
          } else if (page === "Attendance") {
            openAttendance();
          }
        }}
      />
    );
  }

  // 4. STUDENT DASHBOARD (Panel 3 Layout)
  if (currentPage === "dashboard") {
    if (!loggedInUser) {
      return (
        <Auth
          initialMode="login"
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <StudentDashboard
        user={loggedInUser}
        studentName={loggedInUser.name}
        course={getRoleLabel(loggedInUser.role)}
        profileImage={loggedInUser.profileImage || ""}
        onUserUpdate={handleUserUpdate}
        onLogout={handleLogout}
        onNavigate={(page) => {
          if (page === "Dashboard") {
            setCurrentPage("dashboard");
          } else if (page === "Marketplace") {
            openMarketplace();
          } else if (page === "Canteen") {
            openCanteen();
          } else if (page === "Campus Hub") {
            openCampusHub();
          } else if (page === "Attendance") {
            openAttendance();
          } else if (page === "Settings") {
            openProfileSettings();
          } else {
            alert(`${page} module will be connected soon.`);
          }
        }}
      />
    );
  }

  // ====================================================
  // CAMPUS HUB
  // ====================================================

  if (currentPage === "campusHub") {
    return (
      <CampusHub
        user={loggedInUser}
        onBack={() => {
          setCurrentPage(previousPage || getDashboardForRole(loggedInUser?.role));
        }}
      />
    );
  }

  // ====================================================
  // MARKETPLACE
  // ====================================================

  if (currentPage === "marketplace") {
    return (
      <Marketplace
        user={loggedInUser}
        onBack={() => setCurrentPage(previousPage || getDashboardForRole(loggedInUser?.role))}
        onLogout={handleLogout}
      />
    );
  }

  // ====================================================
  // CANTEEN (Student Food Ordering & Tracking)
  // ====================================================

  if (currentPage === "canteen") {
    return (
      <Canteen
        user={loggedInUser}
        onLogout={handleLogout}
        onDashboardClick={handleDashboardClick}
      />
    );
  }

  // ====================================================
  // ABOUT PAGE
  // ====================================================

  if (currentPage === "about") {
    return (
      <About onBack={() => setCurrentPage("home")} />
    );
  }

  // ====================================================
  // CONTACT PAGE
  // ====================================================

  if (currentPage === "contact") {
    return (
      <ContactPage
        onBack={() => setCurrentPage(previousPage || "home")}
      />
    );
  }

  // ====================================================
  // HOME / LANDING PAGE
  // ====================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar
        onAuthClick={setAuthMode}
        onAboutClick={() => setCurrentPage("about")}
        onContactClick={openContact}
        loggedInUser={loggedInUser}
        onDashboardClick={handleDashboardClick}
        onLogout={handleLogout}
      />

      <Hero
        loggedInUser={loggedInUser}
        onGetStarted={() => {
          if (loggedInUser) {
            handleDashboardClick();
          } else {
            setAuthMode("login");
          }
        }}
      />

      <Features
        onCampusHubClick={openCampusHub}
        onMarketplaceClick={openMarketplace}
        onCanteenClick={openCanteen}
        onAttendanceClick={openAttendance}
      />

      <Stats />

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© 2026 CampusConnect · Digital Campus Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
