
import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap, Search, LayoutGrid, Coffee, Utensils,
  Sandwich, CupSoda, Cake, ShoppingCart, Clock, Plus,
  Minus, Truck, ShoppingBag, LogOut, LayoutDashboard
} from "lucide-react";

import OrderTracking from "./OrderTracking";
import CanteenOwner from "./CanteenOwner";
import { menuApi, orderApi } from "./api";

const API = "http://localhost:8080/api/canteen/menu/available";

const CATEGORY_NAMES = {
  "94635b48-b944-4e11-91aa-03d1dfe98349": "Beverages",
  "7814db77-a0e6-425c-962c-d70c107fa50a": "Breakfast",
  "8abd873a-dc22-4aaf-99d1-519daf22fbc0": "Desserts",
  "013c1132-a81d-4d7e-bc65-df52790788ad": "Main Course",
  "9d5aad8a-2d9f-4edb-a4d9-f374e289a780": "Snacks"
};

const categories = [
  { name: "All", icon: LayoutGrid },
  { name: "Breakfast", icon: Coffee },
  { name: "Main Course", icon: Utensils },
  { name: "Snacks", icon: Sandwich },
  { name: "Beverages", icon: CupSoda },
  { name: "Desserts", icon: Cake }
];

const getInitials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map(part => part[0].toUpperCase()).join("") || "U";

const formatRole = role => ({
  user: "Student",
  student: "Student",
  faculty: "Faculty",
  teacher: "Teacher",
  admin: "Admin",
  owner: "Canteen Owner",
  canteen: "Canteen Owner"
}[(role || "").toLowerCase()] || "Member");

function Canteen({ user, onDashboardClick, onLogout }) {
  const isOwner = ["admin", "owner", "canteen"].includes(
    user?.role?.toLowerCase()
  );

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [pickupTime, setPickupTime] = useState("12:30 PM");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [classroom, setClassroom] = useState("");
  const [showTracking, setShowTracking] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [liveMenuItems, setLiveMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const data = await orderApi.getMyOrders();
      if (Array.isArray(data)) {
        setOrders(data.map(o => ({
          ...o,
          id: o.orderCode || o.id,
          rawId: o.id,
          method: o.deliveryMethod || "pickup",
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          items: o.items || []
        })));
      }
    } catch (err) {
      console.warn("Could not load orders:", err.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (isOwner) return;

    const loadMenu = async () => {
      try {
        setMenuLoading(true);
        setMenuError("");

        const data = await menuApi.getAvailableMenu();

        setLiveMenuItems(data.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          category: CATEGORY_NAMES[item.categoryId] || "Snacks",
          image: item.imageUrl || "/veg-thali.jpg",
          available: item.isAvailable !== false,
          description: item.description || ""
        })));
      } catch (error) {
        console.error(error);
        setMenuError(error.message);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, [isOwner]);

  const displayName = user?.name?.trim() || "User";
  const displayRole = formatRole(user?.role);
  const profileImage = user?.profileImage || "";
  const initials = getInitials(displayName);

  const currentOrder = orders[0] || null;

  const filteredItems = useMemo(() => {
    return liveMenuItems.filter(item => {
      const available = item.available !== false;
      const categoryMatch =
        activeCategory === "All" || item.category === activeCategory;
      const searchMatch = (item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      return available && categoryMatch && searchMatch;
    });
  }, [liveMenuItems, activeCategory, search]);

  const addToCart = item => {
    setCart(previous => {
      const existing = previous.find(food => food.id === item.id);

      if (existing) {
        return previous.map(food =>
          food.id === item.id
            ? { ...food, quantity: food.quantity + 1 }
            : food
        );
      }

      return [...previous, { ...item, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart(previous =>
      previous
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const deliveryFee = deliveryMethod === "delivery" ? 20 : 0;
  const total = subtotal + deliveryFee;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      alert("Please add items to your cart.");
      return;
    }

    if (deliveryMethod === "delivery" && !classroom.trim()) {
      alert("Please enter your classroom number.");
      return;
    }

    const orderPayload = {
      studentId: user?.id || null,
      customerName: displayName,
      customerRole: displayRole,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      classroom: deliveryMethod === "delivery" ? classroom.trim() : "",
      pickupTime,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        menuItemId: item.id
      }))
    };

    try {
      const savedOrder = await orderApi.createOrder(orderPayload);
      const formatted = {
        ...savedOrder,
        id: savedOrder.orderCode || savedOrder.id,
        rawId: savedOrder.id,
        method: savedOrder.deliveryMethod || deliveryMethod,
        date: savedOrder.createdAt ? new Date(savedOrder.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        items: savedOrder.items || []
      };

      setOrders(prev => [formatted, ...prev]);
      setCart([]);
      setDeliveryMethod("pickup");
      setClassroom("");
      setShowTracking(true);
    } catch (err) {
      alert("Failed to place order in database: " + err.message);
    }
  };

  if (isOwner) {
    return (
      <CanteenOwner
        user={user}
        onDashboardClick={onDashboardClick}
        onLogout={onLogout}
      />
    );
  }

  if (showTracking) {
    return (
      <OrderTracking
        order={currentOrder}
        orders={orders}
        onOrdersChange={updated => {
          setOrders(updated);
        }}
        onBack={() => setShowTracking(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-5">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">CampusConnect</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Canteen Dining</p>
            </div>
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food items..."
            className="min-w-[150px] flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <button
            onClick={() => setShowTracking(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
          >
            Track Orders
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(previous => !previous)}
                className="flex items-center gap-2 rounded-full border border-slate-200 p-1.5 hover:bg-slate-50"
              >
                {profileImage ? (
                  <img src={profileImage} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xs">
                    {initials}
                  </span>
                )}
                <span className="hidden text-xs font-bold sm:block">{displayName}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <p className="px-2 py-1 text-sm font-bold text-slate-900">{displayName}</p>
                  <p className="px-2 pb-2 text-xs text-slate-500">{displayRole}</p>
                  <button onClick={onDashboardClick} className="flex w-full items-center gap-2 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <LayoutDashboard size={15} /> Dashboard
                  </button>
                  <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg p-2 text-xs font-bold text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[190px_minmax(0,1fr)_340px]">
          <aside className="border-b p-4 lg:border-b-0 lg:border-r border-slate-200">
            <h2 className="mb-4 font-bold text-slate-900 text-sm">Canteen Menu</h2>
            <div className="flex gap-2 overflow-x-auto lg:flex-col">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`flex min-w-fit items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      activeCategory === category.name
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} /> {category.name}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 bg-[#F8FAFC] p-5">
            <h2 className="mb-1 text-xl font-extrabold text-slate-900">Explore Our Menu</h2>
            <p className="mb-5 text-xs text-slate-500">Fresh dishes prepared daily by our campus chefs.</p>

            {menuLoading && <p className="p-6 text-center text-xs text-slate-500">Loading menu...</p>}
            {menuError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">Could not load menu: {menuError}</p>}

            {!menuLoading && !menuError && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                    <h3 className="mt-3 font-bold text-slate-900 text-sm">{item.name}</h3>
                    {item.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.description}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-extrabold text-blue-600">₹{item.price}</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">{item.category}</span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Plus size={15} className="mr-1 inline" /> Add to Cart
                    </button>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <p className="col-span-full rounded-xl bg-white p-8 text-center text-slate-500 text-xs">
                    No available food items found.
                  </p>
                )}
              </div>
            )}
          </main>

          <aside className="border-t bg-white p-5 lg:border-l lg:border-t-0 border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900">Your Cart</h2>
            <p className="mb-4 text-xs text-slate-500">{cartCount} items selected</p>

            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300" />
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs font-bold text-blue-600">₹{item.price * item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => changeQuantity(item.id, -1)} className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100"><Minus size={13} /></button>
                      <span className="text-xs font-bold px-1">{item.quantity}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} className="rounded-lg bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100"><Plus size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-5 block text-xs font-bold text-slate-700">
              <span className="mb-1.5 flex items-center gap-1.5"><Clock size={15} /> Pickup Time</span>
              <select value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-medium">
                {["12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM", "01:00 PM", "01:15 PM"].map(time => <option key={time}>{time}</option>)}
              </select>
            </label>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-slate-700">Delivery Method</p>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-xs">
                <input type="radio" checked={deliveryMethod === "pickup"} onChange={() => setDeliveryMethod("pickup")} />
                <ShoppingBag size={15} className="text-blue-600" /> Self Pickup — Free
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-xs">
                <input type="radio" checked={deliveryMethod === "delivery"} onChange={() => setDeliveryMethod("delivery")} />
                <Truck size={15} className="text-amber-600" /> Classroom Delivery — ₹20
              </label>
              {deliveryMethod === "delivery" && (
                <input
                  value={classroom}
                  onChange={e => setClassroom(e.target.value)}
                  placeholder="Classroom / Room number (e.g. Room 204)"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              )}
            </div>

            <div className="my-5 space-y-2 border-y border-slate-100 py-3 text-xs">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><b>₹{subtotal}</b></div>
              <div className="flex justify-between text-slate-500"><span>Delivery</span><b>₹{deliveryFee}</b></div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1"><span>Total</span><span className="text-blue-600">₹{total}</span></div>
            </div>

            <button
              disabled={!cart.length}
              onClick={handlePlaceOrder}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Place Order (₹{total})
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Canteen;
