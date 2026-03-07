import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, PenTool, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const navItems = profile?.role === 'landlord' 
    ? [
        { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
        { icon: ClipboardList, label: 'Hóa đơn', path: '/bills' },
        { icon: PenTool, label: 'Sửa chữa', path: '/issues' },
        { icon: User, label: 'Cá nhân', path: '/profile' },
      ]
    : [
        { icon: Home, label: 'Trang chủ', path: '/' },
        { icon: PenTool, label: 'Sửa chữa', path: '/issues' },
        { icon: User, label: 'Cá nhân', path: '/profile' },
      ];

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">MiniHouse</h1>
          <p className="text-xs text-slate-400">Quản lý nhà cho thuê</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors",
                location.pathname === item.path 
                  ? "bg-primary text-white" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-16 flex items-center justify-around px-2 z-50">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "bottom-nav-item",
              location.pathname === item.path && "active"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <header className="md:hidden flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-primary">MiniHouse</h1>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400">
            <LogOut size={20} />
          </button>
        </header>
        {children}
      </main>
    </div>
  );
};
