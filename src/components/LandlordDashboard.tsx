import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room, Issue, Bill } from '../types';
import { Users, ClipboardList, PenTool, Plus, Zap, Droplets, CheckCircle2, Clock, AlertCircle, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BillCalculator } from './BillCalculator';

export const LandlordDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'issues'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showBills, setShowBills] = useState(false);
  const [roomBills, setRoomBills] = useState<Bill[]>([]);

  const fetchData = async () => {
    try {
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      setRooms(roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));

      const issuesQuery = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const issuesSnap = await getDocs(issuesQuery);
      setIssues(issuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issue)));
    } catch (error) {
      console.error('Error fetching landlord data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowBills = async (room: Room) => {
    setSelectedRoom(room);
    const billsQuery = query(
      collection(db, 'bills'),
      where('roomId', '==', room.id),
      orderBy('month', 'desc')
    );
    const billsSnap = await getDocs(billsQuery);
    setRoomBills(billsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill)));
    setShowBills(true);
  };

  const initializeRooms = async () => {
    const demoRooms = [
      { roomNumber: 'P101', basePrice: 3500000, electricityPrice: 3500, waterPrice: 25000, servicePrice: 150000, lastElectricityReading: 100, lastWaterReading: 50, tenantName: 'Nguyễn Văn A' },
      { roomNumber: 'P102', basePrice: 3800000, electricityPrice: 3500, waterPrice: 25000, servicePrice: 150000, lastElectricityReading: 120, lastWaterReading: 60, tenantName: 'Trần Thị B' },
      { roomNumber: 'P201', basePrice: 3500000, electricityPrice: 3500, waterPrice: 25000, servicePrice: 150000, lastElectricityReading: 80, lastWaterReading: 40, tenantName: 'Lê Văn C' },
    ];

    for (const room of demoRooms) {
      await addDoc(collection(db, 'rooms'), room);
    }
    fetchData();
  };

  if (loading) return <div className="flex justify-center p-12">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý nhà</h2>
        <button onClick={initializeRooms} className="text-xs text-slate-400 hover:text-primary transition-colors">
          Khởi tạo dữ liệu mẫu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-xs text-slate-500 font-medium">Phòng thuê</span>
          </div>
          <p className="text-2xl font-bold">{rooms.length}</p>
        </div>
        <div className="card bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs text-slate-500 font-medium">Yêu cầu mới</span>
          </div>
          <p className="text-2xl font-bold">{issues.filter(i => i.status === 'pending').length}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'rooms' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
          }`}
        >
          Danh sách phòng
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'issues' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
          }`}
        >
          Sửa chữa
        </button>
      </div>

      {activeTab === 'rooms' ? (
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.id} className="card hover:border-primary/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary font-bold">
                    {room.roomNumber}
                  </div>
                  <div>
                    <h4 className="font-bold">{room.tenantName || 'Trống'}</h4>
                    <p className="text-xs text-slate-400">Giá thuê: {room.basePrice.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Điện: {room.lastElectricityReading}</p>
                    <p className="text-[10px] text-slate-400">Nước: {room.lastWaterReading}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { setSelectedRoom(room); setShowCalculator(true); }}
                  className="flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <Zap size={14} /> Ghi điện nước
                </button>
                <button 
                  onClick={() => handleShowBills(room)}
                  className="flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <ClipboardList size={14} /> Xem hóa đơn
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue.id} className="card space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                      P.{issue.roomNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      issue.urgency === 'high' ? 'bg-red-50 text-red-600' : 
                      issue.urgency === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {issue.urgency}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{issue.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400">
                  {format(issue.createdAt?.toDate() || new Date(), 'dd/MM HH:mm')}
                </p>
              </div>
              
              <p className="text-xs text-slate-600">{issue.description}</p>
              
              <div className="flex gap-2 pt-2">
                <select 
                  className="flex-1 bg-slate-50 border-none text-xs rounded-lg px-2 py-2 focus:ring-0"
                  value={issue.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as any;
                    await updateDoc(doc(db, 'issues', issue.id), { status: newStatus });
                    fetchData();
                  }}
                >
                  <option value="pending">Đang chờ</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                </select>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <PenTool size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCalculator && selectedRoom && (
        <BillCalculator 
          room={selectedRoom} 
          onClose={() => setShowCalculator(false)} 
          onSuccess={() => { setShowCalculator(false); fetchData(); }} 
        />
      )}

      {showBills && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Hóa đơn phòng {selectedRoom.roomNumber}</h3>
              <button onClick={() => setShowBills(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {roomBills.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Chưa có hóa đơn nào.</p>
              ) : (
                roomBills.map((bill) => (
                  <div key={bill.id} className="border border-slate-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Tháng {bill.month}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                        bill.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {bill.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tổng cộng:</span>
                      <span className="font-bold text-primary">{bill.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <button 
                      onClick={async () => {
                        await updateDoc(doc(db, 'bills', bill.id), { status: bill.status === 'paid' ? 'unpaid' : 'paid' });
                        handleShowBills(selectedRoom);
                      }}
                      className="w-full mt-2 py-2 bg-slate-50 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Đánh dấu là {bill.status === 'paid' ? 'chưa thanh toán' : 'đã thanh toán'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
