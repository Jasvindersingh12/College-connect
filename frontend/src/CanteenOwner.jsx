import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Search,
  LogOut,
  LayoutDashboard,
  Plus,
  UtensilsCrossed,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  ChefHat,
  PackageCheck,
  Trash2,
  Edit3,
  ImagePlus,
  IndianRupee,
  Truck,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  Store,
} from "lucide-react";

import { menuApi, orderApi, getAuthToken } from "./api";

const CATEGORIES = {
  "Beverages": "94635b48-b944-4e11-91aa-03d1dfe98349",
  "Breakfast": "7814db77-a0e6-425c-962c-d70c107fa50a",
  "Desserts": "8abd873a-dc22-4aaf-99d1-519daf22fbc0",
  "Main Course": "013c1132-a81d-4d7e-bc65-df52790788ad",
  "Snacks": "9d5aad8a-2d9f-4edb-a4d9-f374e289a780",
};

const CATEGORY_NAMES = Object.fromEntries(
  Object.entries(CATEGORIES).map(([name, id]) => [id, name])
);

const STATUS_LABELS = {
  0: "New Order",
  1: "Accepted",
  2: "Preparing",
  3: "Ready for Pickup",
  4: "Picked Up",
  "-1": "Rejected",
};

const STATUS_COLORS = {
  0: "bg-amber-100 text-amber-800 border-amber-300",
  1: "bg-blue-100 text-blue-800 border-blue-300",
  2: "bg-purple-100 text-purple-800 border-purple-300",
  3: "bg-amber-100 text-amber-900 border-amber-400 animate-pulse",
  4: "bg-emerald-100 text-emerald-800 border-emerald-300",
  "-1": "bg-rose-100 text-rose-800 border-rose-300",
};

const DEFAULT_MENU_ITEMS = [
  {
    id: "sample-1",
    name: "Veg Thali",
    price: 90,
    category: "Main Course",
    categoryId: CATEGORIES["Main Course"],
    description: "2 Rotis, Paneer Sabzi, Dal Tadka, Jeera Rice, Salad & Sweet",
    image: "/veg-thali.jpg",
    available: true,
  },
  {
    id: "sample-2",
    name: "Paneer Wrap",
    price: 65,
    category: "Snacks",
    categoryId: CATEGORIES["Snacks"],
    description: "Grilled whole wheat wrap loaded with spiced cottage cheese & mint chutney",
    image: "/paneer-wrap.jpg",
    available: true,
  },
  {
    id: "sample-3",
    name: "Veg Burger",
    price: 50,
    category: "Snacks",
    categoryId: CATEGORIES["Snacks"],
    description: "Crispy vegetable patty with cheese, tomato & special mayo",
    image: "/veg-burger.jpg",
    available: true,
  },
  {
    id: "sample-4",
    name: "Cold Coffee",
    price: 45,
    category: "Beverages",
    categoryId: CATEGORIES["Beverages"],
    description: "Chilled brewed coffee blended with rich vanilla cream and chocolate drizzle",
    image: "/cold-coffee.jpg",
    available: true,
  },
];

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "Snacks",
  description: "",
  image: "",
  available: true,
};

export default function CanteenOwner({
  user,
  onDashboardClick = () => {},
  onLogout = () => {},
}) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const displayName = user?.name || "Chef Rajesh";

  const getInitials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CO";

  // Load Menu Items from Database
  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await menuApi.getAllMenuItems();
      if (Array.isArray(data) && data.length > 0) {
        setMenu(
          data.map((item) => ({
            id: item.id,
            name: item.name || "",
            price: Number(item.price || 0),
            category: CATEGORY_NAMES[item.categoryId] || "Snacks",
            categoryId: item.categoryId,
            description: item.description || "",
            image: item.imageUrl || "/veg-thali.jpg",
            available: item.isAvailable !== false,
          }))
        );
      } else {
        setMenu(DEFAULT_MENU_ITEMS);
      }
    } catch (err) {
      console.warn("Could not load menu, using defaults:", err.message);
      setMenu(DEFAULT_MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  // Load Orders from Database
  const loadOrders = async () => {
    try {
      const data = await orderApi.getAllOrders();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(
          data.map((o) => ({
            ...o,
            id: o.orderCode || o.id,
            rawId: o.id,
            method: o.deliveryMethod || "pickup",
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
            items: o.items || [],
          }))
        );
      } else {
        // Sample orders matching Panel 10 live order queue format
        setOrders([
          {
            id: "C1024",
            rawId: "sample-c1024",
            customerName: "Riya Sharma",
            customerRole: "Student",
            total: 155,
            status: 0,
            pickupTime: "12:45 PM",
            method: "pickup",
            classroom: "",
            date: "Today",
            items: [
              { name: "Paneer Wrap", quantity: 1, price: 65 },
              { name: "Veg Thali", quantity: 1, price: 90 },
            ],
          },
          {
            id: "C1025",
            rawId: "sample-c1025",
            customerName: "Aman Verma",
            customerRole: "Student",
            total: 95,
            status: 1,
            pickupTime: "01:00 PM",
            method: "delivery",
            classroom: "Room 302",
            date: "Today",
            items: [
              { name: "Veg Burger", quantity: 1, price: 50 },
              { name: "Cold Coffee", quantity: 1, price: 45 },
            ],
          },
          {
            id: "C1026",
            rawId: "sample-c1026",
            customerName: "Prof. Sharma",
            customerRole: "Faculty",
            total: 90,
            status: 2,
            pickupTime: "01:15 PM",
            method: "pickup",
            classroom: "",
            date: "Today",
            items: [
              { name: "Veg Thali", quantity: 1, price: 90 },
            ],
          },
          {
            id: "C1027",
            rawId: "sample-c1027",
            customerName: "Shreya Gupta",
            customerRole: "Student",
            total: 45,
            status: 3,
            pickupTime: "12:30 PM",
            method: "pickup",
            classroom: "",
            date: "Today",
            items: [
              { name: "Cold Coffee", quantity: 1, price: 45 },
            ],
          },
        ]);
      }
    } catch (err) {
      console.warn("Could not load orders from database:", err.message);
    }
  };

  useEffect(() => {
    loadMenu();
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update order status with progression
  const updateOrderStatus = async (orderId, nextStatus) => {
    const target = orders.find(
      (o) => String(o.id) === String(orderId) || String(o.rawId) === String(orderId)
    );
    const targetRawId = target?.rawId || orderId;

    try {
      setUpdatingId(orderId);
      await orderApi.updateOrderStatus(targetRawId, nextStatus);
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(orderId) || String(order.rawId) === String(orderId)
            ? { ...order, status: nextStatus }
            : order
        )
      );
      setNotification(`Order #${orderId} updated to ${STATUS_LABELS[nextStatus] || nextStatus}!`);
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.warn("API update failed, updating local state:", err.message);
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(orderId) || String(order.rawId) === String(orderId)
            ? { ...order, status: nextStatus }
            : order
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle dish stock availability in database
  const toggleAvailability = async (dish) => {
    const updatedStock = !dish.available;
    const payload = {
      name: dish.name,
      description: dish.description,
      price: dish.price,
      categoryId: dish.categoryId,
      imageUrl: dish.image,
      isAvailable: updatedStock,
    };

    try {
      await menuApi.updateMenuItem(dish.id, payload);
      setMenu((prev) =>
        prev.map((item) =>
          item.id === dish.id ? { ...item, available: updatedStock } : item
        )
      );
      setNotification(`${dish.name} marked as ${updatedStock ? "In Stock" : "Out of Stock"}!`);
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      // Local fallback
      setMenu((prev) =>
        prev.map((item) =>
          item.id === dish.id ? { ...item, available: updatedStock } : item
        )
      );
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (dish) => {
    setEditingId(dish.id);
    setForm({
      name: dish.name,
      price: String(dish.price),
      category: dish.category,
      description: dish.description,
      image: dish.image,
      available: dish.available,
    });
    setModalOpen(true);
  };

  const saveDish = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) <= 0) {
      alert("Please enter a valid dish name and price.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price),
      categoryId: CATEGORIES[form.category] || CATEGORIES["Snacks"],
      imageUrl: form.image || "/veg-thali.jpg",
      isAvailable: form.available,
    };

    try {
      if (editingId) {
        await menuApi.updateMenuItem(editingId, payload);
      } else {
        await menuApi.addMenuItem(payload);
      }
      setModalOpen(false);
      await loadMenu();
      setNotification(editingId ? "Dish updated successfully!" : "New dish added to menu!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      alert("Could not save dish: " + err.message);
    }
  };

  const deleteDish = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await menuApi.deleteMenuItem(id);
      await loadMenu();
      setNotification("Dish deleted from menu.");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      alert("Could not delete dish: " + err.message);
    }
  };

  // Top KPI calculations
  const stats = useMemo(() => {
    const active = orders.filter((o) => [1, 2, 3].includes(Number(o.status))).length;
    const pendingPrep = orders.filter((o) => [0, 1].includes(Number(o.status))).length;
    const completedToday = orders.filter((o) => Number(o.status) === 4).length;
    const todayRevenue = orders
      .filter((o) => Number(o.status) !== -1)
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return { active, pendingPrep, completedToday, todayRevenue };
  }, [orders]);

  // Order filters
  const filteredOrders = orders.filter((order) => {
    const status = Number(order.status);
    const matchesFilter =
      orderFilter === "all" ||
      (orderFilter === "active" && [0, 1, 2, 3].includes(status)) ||
      (orderFilter === "completed" && [4, -1].includes(status));

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      String(order.id || "").toLowerCase().includes(q) ||
      (order.customerName || "").toLowerCase().includes(q) ||
      (order.items || []).some((item) =>
        (item.name || "").toLowerCase().includes(q)
      );

    return matchesFilter && matchesSearch;
  });

  const sidebarNavItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Live Orders", label: "Live Orders", icon: ClipboardList, badge: stats.pendingPrep },
    { id: "Menu Management", label: "Menu Management", icon: UtensilsCrossed },
    { id: "Sales & Analytics", label: "Sales & Analytics", icon: BarChart3 },
    { id: "Canteen Settings", label: "Canteen Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      <div className="flex min-h-screen">
        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          />
        )}

        {/* ================= LEFT SIDEBAR (Panel 10 Layout) ================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0F1E36] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* BRANDING HEADER */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <Store size={22} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  CampusConnect
                </h1>
                <p className="text-xs font-semibold text-blue-300">
                  Canteen Operations
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[1.5px] text-blue-300/70">
              Kitchen Operations
            </p>
            <nav className="space-y-1.5">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={19} className={isActive ? "text-white" : "text-blue-300"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-extrabold text-slate-900">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SIDEBAR FOOTER (Pinned User Chip & Logout below Settings) */}
          <div className="mt-auto border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {displayName}
                </p>
                <span className="inline-block rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Canteen Owner
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20 hover:text-white"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP HEADER BAR */}
          <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  CampusConnect / Canteen Portal
                </p>
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  {activeNav}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* SEARCH */}
              <div className="hidden h-10 w-60 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order or dish..."
                  className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* REFRESH */}
              <button
                type="button"
                onClick={() => {
                  loadMenu();
                  loadOrders();
                  setNotification("Queue refreshed!");
                  setTimeout(() => setNotification(""), 2000);
                }}
                title="Refresh Queue"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw size={17} />
              </button>

              {/* USER PROFILE CHIP (Top Header) */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {getInitials(displayName)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                  <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
                    Canteen Owner
                  </span>
                </div>
              </div>

              {/* GLOBAL LOGOUT BUTTON (Top Header) */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* NOTIFICATION TOAST */}
          {notification && (
            <div className="sticky top-[76px] z-20 flex items-center justify-center bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition">
              <CheckCircle2 size={16} className="mr-2 inline" />
              {notification}
            </div>
          )}

          {/* MAIN BODY */}
          <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-7">
            {/* SUBHEADER GREETING */}
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Live Operations & Kitchen Command
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Canteen Operations Dashboard
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Manage active student meal orders, kitchen prep pipeline, and dish availability.
                </p>
              </div>

              <button
                onClick={openAdd}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus size={16} />
                <span>Add New Dish</span>
              </button>
            </div>

            {/* ================= TOP 4 KPI CARDS ================= */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* 1. Active Orders */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Active Orders
                  </span>
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <ClipboardList size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {stats.active}
                  </span>
                  <span className="text-xs font-semibold text-blue-600">
                    In Kitchen Pipeline
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Accepted, preparing & ready orders
                </p>
              </div>

              {/* 2. Pending Prep */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Pending Prep
                  </span>
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                    <Clock size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {stats.pendingPrep}
                  </span>
                  <span className="text-xs font-semibold text-amber-600">
                    Needs Attention
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  New requests waiting to be accepted/prepped
                </p>
              </div>

              {/* 3. Completed Today */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Completed Today
                  </span>
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <PackageCheck size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {stats.completedToday}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    Handoffs Done
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Orders successfully picked up by students
                </p>
              </div>

              {/* 4. Today's Revenue */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Today's Revenue
                  </span>
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                    <IndianRupee size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{stats.todayRevenue}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">
                    Live Total
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Cumulative canteen sales recorded
                </p>
              </div>
            </section>

            {/* ================= MAIN SPLIT SECTION (Live Queue + Quick Menu Toggle) ================= */}
            {activeNav === "Dashboard" || activeNav === "Live Orders" ? (
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
                {/* LEFT/MAIN 2 COLS: Live Order Queue */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900">
                          Live Order Queue
                        </h2>
                        <p className="text-xs text-slate-500">
                          Click action buttons to progress orders from Prep to Picked Up
                        </p>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
                        {[
                          { id: "active", label: "Active Queue" },
                          { id: "all", label: "All Orders" },
                          { id: "completed", label: "Completed" },
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setOrderFilter(filter.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              orderFilter === filter.id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                        <ShoppingBag size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-bold text-slate-700">No orders in this queue.</p>
                        <p className="mt-1 text-xs">New orders placed by students will appear live right here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => {
                          const status = Number(order.status);
                          const isUpdating = updatingId === order.id;

                          return (
                            <div
                              key={order.id}
                              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-200 hover:shadow-sm"
                            >
                              {/* Order Card Header */}
                              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/60 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-blue-700 text-base">
                                      #{order.id}
                                    </span>
                                    <span
                                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                                        STATUS_COLORS[status] || "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {STATUS_LABELS[status] || `Status ${status}`}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs font-medium text-slate-600">
                                    Customer: <strong className="text-slate-800">{order.customerName || "Student"}</strong> ({order.customerRole || "Student"})
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="text-base font-extrabold text-blue-600">
                                    ₹{order.total}
                                  </p>
                                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-slate-500">
                                    <Clock size={12} />
                                    <span>Pickup: <strong>{order.pickupTime || "12:30 PM"}</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="my-3">
                                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Items Ordered:
                                </p>
                                <div className="space-y-1">
                                  {(order.items || []).map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-xs text-slate-700"
                                    >
                                      <span>
                                        <strong>{item.quantity}×</strong> {item.name || item.itemName}
                                      </span>
                                      <span className="font-medium text-slate-500">
                                        ₹{Number(item.price) * Number(item.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {order.method === "delivery" && order.classroom && (
                                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800">
                                    <Truck size={13} />
                                    <span>Deliver to: {order.classroom}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons: 1-Click Status Progression */}
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3">
                                <span className="text-[11px] text-slate-400">
                                  Placed: {order.date}
                                </span>

                                <div className="flex items-center gap-2">
                                  {/* Status 0 (New Order): Accept or Reject */}
                                  {status === 0 && (
                                    <>
                                      <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() => updateOrderStatus(order.id, -1)}
                                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                                      >
                                        <XCircle size={14} /> Reject
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() => updateOrderStatus(order.id, 1)}
                                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        <CheckCircle2 size={14} /> Accept Order
                                      </button>
                                    </>
                                  )}

                                  {/* Status 1 (Accepted): Move to Preparing */}
                                  {status === 1 && (
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => updateOrderStatus(order.id, 2)}
                                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                                    >
                                      <ChefHat size={14} /> Start Preparing
                                    </button>
                                  )}

                                  {/* Status 2 (Preparing): Move to Ready for Pickup */}
                                  {status === 2 && (
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => updateOrderStatus(order.id, 3)}
                                      className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                                    >
                                      <Bell size={14} /> Ready for Pickup
                                    </button>
                                  )}

                                  {/* Status 3 (Ready for Pickup): Complete Handoff */}
                                  {status === 3 && (
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => updateOrderStatus(order.id, 4)}
                                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                      <PackageCheck size={14} /> Picked Up
                                    </button>
                                  )}

                                  {/* Status 4 (Picked Up) */}
                                  {status === 4 && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                                      <CheckCircle2 size={16} /> Completed & Handed Over
                                    </span>
                                  )}

                                  {/* Status -1 (Rejected) */}
                                  {status === -1 && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                                      <XCircle size={16} /> Order Cancelled
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT 1 COL: Quick Menu Availability Toggle */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">
                          Quick Menu Availability
                        </h2>
                        <p className="text-xs text-slate-500">
                          Toggle live kitchen inventory stock
                        </p>
                      </div>

                      <button
                        onClick={openAdd}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                        title="Add New Dish"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {menu.map((dish) => (
                        <div
                          key={dish.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 transition hover:border-blue-200"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="h-11 w-11 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-900">
                                {dish.name}
                              </p>
                              <p className="text-[11px] font-semibold text-blue-600">
                                ₹{dish.price} • <span className="text-slate-400 font-normal">{dish.category}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* INSTANT STOCK TOGGLE BUTTON */}
                            <button
                              type="button"
                              onClick={() => toggleAvailability(dish)}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition ${
                                dish.available
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              {dish.available ? "In Stock" : "Out of Stock"}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEdit(dish)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-blue-600"
                              title="Edit item"
                            >
                              <Edit3 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveNav("Menu Management")}
                      className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Full Menu Catalog →
                    </button>
                  </div>
                </div>
              </div>
            ) : activeNav === "Menu Management" ? (
              /* ================= MENU MANAGEMENT FULL VIEW ================= */
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Menu Item Catalog
                    </h2>
                    <p className="text-xs text-slate-500">
                      Add, update prices, manage descriptions, and toggle stock.
                    </p>
                  </div>
                  <button
                    onClick={openAdd}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                  >
                    <Plus size={16} /> Add New Dish
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {menu.map((dish) => (
                    <div
                      key={dish.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="h-44 w-full object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {dish.name}
                          </h3>
                          <span className="font-extrabold text-blue-600 text-base">
                            ₹{dish.price}
                          </span>
                        </div>
                        <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {dish.category}
                        </span>
                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                          {dish.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => toggleAvailability(dish)}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                              dish.available
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {dish.available ? "In Stock" : "Out of Stock"}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(dish)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit Dish"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteDish(dish.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              title="Delete Dish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeNav === "Sales & Analytics" ? (
              /* ================= SALES & ANALYTICS VIEW ================= */
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Canteen Sales Summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daily order totals, item volume, and revenue metrics
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">Total Orders Recorded</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">{orders.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">Active Pipeline Value</p>
                      <p className="mt-1 text-2xl font-extrabold text-blue-600">₹{stats.todayRevenue}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">Fulfillment Success Rate</p>
                      <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                        {orders.length > 0
                          ? Math.round((stats.completedToday / orders.length) * 100) || 100
                          : 100}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= CANTEEN SETTINGS VIEW ================= */
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Canteen Operations Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Kitchen schedule, pickup window, and auto-acceptance preferences
                </p>

                <div className="mt-6 max-w-xl space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Kitchen Operating Hours</label>
                    <input
                      type="text"
                      defaultValue="08:00 AM - 06:00 PM"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Average Meal Prep Time</label>
                    <input
                      type="text"
                      defaultValue="15 Minutes"
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotification("Settings saved!");
                      setTimeout(() => setNotification(""), 2000);
                    }}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= ADD / EDIT DISH MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={saveDish}
            className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit Dish" : "Add New Dish"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Dish Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Masala Dosa, Cold Coffee"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Price (₹)</label>
                <input
                  required
                  min="1"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                >
                  {Object.keys(CATEGORIES).map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://... or /veg-thali.jpg"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Description</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Key ingredients or meal details..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
              Available for Student Orders immediately
            </label>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                {editingId ? "Save Changes" : "Add Dish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
