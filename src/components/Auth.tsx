import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Shield, User as UserIcon } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'landlord' | 'tenant'>('tenant');
  const [roomNumber, setRoomNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          role,
          displayName,
          roomNumber: role === 'tenant' ? roomNumber : null,
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">MiniHouse</h1>
          <p className="text-slate-500">{isLogin ? 'Chào mừng bạn quay trở lại' : 'Tạo tài khoản mới'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    role === 'tenant' ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <UserIcon size={18} />
                  <span className="font-medium">Người thuê</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    role === 'landlord' ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Shield size={18} />
                  <span className="font-medium">Chủ nhà</span>
                </button>
              </div>
              {role === 'tenant' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã phòng</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Ví dụ: P101"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4"
          >
            {loading ? 'Đang xử lý...' : isLogin ? (
              <>
                <LogIn size={20} />
                <span>Đăng nhập</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Đăng ký</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-primary transition-colors"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
          
          <div className="p-4 bg-blue-50 rounded-2xl text-xs text-blue-600 text-left">
            <p className="font-bold mb-1">💡 Hướng dẫn thử nghiệm:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Đăng ký tài khoản <b>Chủ nhà</b> để quản lý phòng.</li>
              <li>Sử dụng nút "Khởi tạo dữ liệu mẫu" trong Dashboard chủ nhà.</li>
              <li>Đăng ký tài khoản <b>Người thuê</b> với mã phòng (VD: P101) để xem hóa đơn.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
