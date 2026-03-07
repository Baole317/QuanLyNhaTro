import React, { useState } from 'react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room } from '../types';
import { Zap, Droplets, Calculator, X } from 'lucide-react';

interface Props {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}

export const BillCalculator: React.FC<Props> = ({ room, onClose, onSuccess }) => {
  const [elecNew, setElecNew] = useState(room.lastElectricityReading);
  const [waterNew, setWaterNew] = useState(room.lastWaterReading);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  const elecUsage = elecNew - room.lastElectricityReading;
  const waterUsage = waterNew - room.lastWaterReading;
  
  const elecTotal = elecUsage * room.electricityPrice;
  const waterTotal = waterUsage * room.waterPrice;
  const totalAmount = room.basePrice + room.servicePrice + elecTotal + waterTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (elecUsage < 0 || waterUsage < 0) {
      alert('Chỉ số mới không được nhỏ hơn chỉ số cũ!');
      return;
    }
    setLoading(true);

    try {
      // 1. Create bill
      await addDoc(collection(db, 'bills'), {
        roomId: room.id,
        roomNumber: room.roomNumber,
        month,
        electricity: {
          oldReading: room.lastElectricityReading,
          newReading: elecNew,
          usage: elecUsage,
          price: room.electricityPrice,
          total: elecTotal,
        },
        water: {
          oldReading: room.lastWaterReading,
          newReading: waterNew,
          usage: waterUsage,
          price: room.waterPrice,
          total: waterTotal,
        },
        basePrice: room.basePrice,
        servicePrice: room.servicePrice,
        totalAmount,
        status: 'unpaid',
        createdAt: serverTimestamp(),
      });

      // 2. Update room readings
      await updateDoc(doc(db, 'rooms', room.id), {
        lastElectricityReading: elecNew,
        lastWaterReading: waterNew,
      });

      onSuccess();
    } catch (error) {
      console.error('Error calculating bill:', error);
      alert('Có lỗi xảy ra khi tính tiền!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Tính tiền phòng {room.roomNumber}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tháng hóa đơn</label>
            <input
              type="month"
              className="input-field"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Zap size={16} className="text-yellow-500" /> Chỉ số Điện
              </label>
              <p className="text-[10px] text-slate-400">Cũ: {room.lastElectricityReading}</p>
              <input
                type="number"
                className="input-field"
                value={elecNew}
                onChange={(e) => setElecNew(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Droplets size={16} className="text-blue-500" /> Chỉ số Nước
              </label>
              <p className="text-[10px] text-slate-400">Cũ: {room.lastWaterReading}</p>
              <input
                type="number"
                className="input-field"
                value={waterNew}
                onChange={(e) => setWaterNew(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền nhà:</span>
              <span className="font-medium">{room.basePrice.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền điện ({elecUsage} số):</span>
              <span className="font-medium">{elecTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền nước ({waterUsage} khối):</span>
              <span className="font-medium">{waterTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Dịch vụ:</span>
              <span className="font-medium">{room.servicePrice.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Tổng cộng:</span>
              <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            <Calculator size={20} />
            {loading ? 'Đang xử lý...' : 'Xuất hóa đơn'}
          </button>
        </form>
      </div>
    </div>
  );
};
