import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/business/dashboard", label: "Dashboard" },
  { to: "/business/generate-qr", label: "Generate Stamp QR" },
  { to: "/business/customers", label: "Customers" },
  { to: "/business/redeem", label: "Redeem Code" },
  { to: "/business/settings", label: "Loyalty Settings" },
];

export function BusinessLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-thappa-navy text-white">
        <div className="border-b border-white/10 p-5">
          <p className="text-lg font-bold">Thappa Business</p>
          <p className="text-xs text-white/60">{user?.name}</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-thappa-orange text-thappa-navy font-semibold" : "text-white/80 hover:bg-white/10"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
