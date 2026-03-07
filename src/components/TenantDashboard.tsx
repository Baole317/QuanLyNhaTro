import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Bill, Issue } from '../types';
import { Zap, Droplets, Home, CreditCard, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const TenantDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [latestBill, setLatestBill] = useState<Bill | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.roomNumber) return;

    const fetchData = async () => {
      try {
        // Fetch latest bill
        const billsQuery = query(
          collection(db, 'bills'),
          where('roomNumber', '==', profile.roomNumber),
          orderBy('month', 'desc'),
          limit(1)
        );
        const billSnap = await getDocs(billsQuery);
        if (!billSnap.empty) {
          setLatestBill({ id: billSnap.docs[0].id, ...billSnap.docs[0].data() } as Bill);
        }

        // Fetch recent issues
        const issuesQuery = query(
          collection(db, 'issues'),
          where('roomNumber', '==', profile.roomNumber),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const issueSnap = await getDocs(issuesQuery);
        setRecentIssues(issueSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issue)));
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (loading) return <div className="flex justify-center p-12">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Xin chào, {profile?.displayName}</h2>
          <p className="text-slate-500">Phòng {profile?.roomNumber}</p>
        </div>
      </div>

      {/* Latest Bill Card */}
      <div className="card bg-primary text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Hóa đơn tháng {latestBill?.month || '--'}</p>
              <h3 className="text-3xl font-bold mt-1">
                {latestBill?.totalAmount.toLocaleString('vi-VN')}đ
              </h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              latestBill?.status === 'paid' ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'
            }`}>
              {latestBill?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-yellow-300" />
                <span className="text-xs opacity-80">Điện</span>
              </div>
              <p className="font-semibold">{latestBill?.electricity.total.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={14} className="text-blue-300" />
                <span className="text-xs opacity-80">Nước</span>
              </div>
              <p className="font-semibold">{latestBill?.water.total.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>

          {latestBill?.status === 'unpaid' && (
            <button className="w-full mt-6 bg-white text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              <CreditCard size={20} />
              <span>Thanh toán ngay</span>
            </button>
          )}
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-primary" />
            Phản ánh hư hỏng
          </h3>
          <IssueForm roomNumber={profile?.roomNumber || ''} onIssueCreated={() => {}} />
        </div>
      </div>

      {/* Recent Issues */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700">Yêu cầu gần đây</h3>
        {recentIssues.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Chưa có yêu cầu nào.</p>
        ) : (
          recentIssues.map((issue) => (
            <div key={issue.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{issue.title}</p>
                <p className="text-xs text-slate-400">
                  {format(issue.createdAt?.toDate() || new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {issue.status === 'completed' ? (
                  <span className="text-green-500 flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 size={14} /> Hoàn thành
                  </span>
                ) : issue.status === 'processing' ? (
                  <span className="text-blue-500 flex items-center gap-1 text-xs font-medium">
                    <Clock size={14} /> Đang xử lý
                  </span>
                ) : (
                  <span className="text-yellow-500 flex items-center gap-1 text-xs font-medium">
                    <Clock size={14} /> Đang chờ
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const IssueForm: React.FC<{ roomNumber: string, onIssueCreated: () => void }> = ({ roomNumber, onIssueCreated }) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'issues'), {
        roomId: profile.uid, // Using uid as room identifier for simplicity in MVP
        roomNumber,
        tenantId: profile.uid,
        title,
        description,
        urgency,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setDescription('');
      onIssueCreated();
      alert('Đã gửi yêu cầu thành công!');
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        required
        placeholder="Tiêu đề (VD: Hỏng vòi nước)"
        className="input-field text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        required
        placeholder="Mô tả chi tiết..."
        className="input-field text-sm min-h-[80px]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        {(['low', 'medium', 'high'] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setUrgency(level)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
              urgency === level 
                ? level === 'high' ? 'bg-red-50 border-red-500 text-red-600' : 
                  level === 'medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-600' :
                  'bg-green-50 border-green-500 text-green-600'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            {level === 'low' ? 'Bình thường' : level === 'medium' ? 'Cần thiết' : 'Khẩn cấp'}
          </button>
        ))}
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm">
        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </button>
    </form>
  );
};
