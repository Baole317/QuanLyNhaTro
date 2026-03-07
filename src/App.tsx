import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { TenantDashboard } from './components/TenantDashboard';
import { LandlordDashboard } from './components/LandlordDashboard';
import { User, Shield, Home, Settings } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const DashboardSwitcher: React.FC = () => {
  const { profile } = useAuth();
  if (profile?.role === 'landlord') return <LandlordDashboard />;
  return <TenantDashboard />;
};

const Profile: React.FC = () => {
  const { profile } = useAuth();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cá nhân</h2>
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <User size={32} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{profile?.displayName}</h3>
          <p className="text-slate-500">{profile?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {profile?.role === 'landlord' ? (
              <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Shield size={12} /> Chủ nhà
              </span>
            ) : (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Home size={12} /> Người thuê - Phòng {profile?.roomNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full card flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-slate-400" />
            <span className="font-medium">Cài đặt tài khoản</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardSwitcher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <DashboardSwitcher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
