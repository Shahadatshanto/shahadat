
import React from 'react';
import { CalculatedShift } from '../types.ts';
import { formatAED } from '../utils/calculations.ts';

interface HistoryProps {
  shifts: CalculatedShift[];
}

const History: React.FC<HistoryProps> = ({ shifts }) => {
  const sortedShifts = [...shifts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">শিফট হিস্ট্রি</h2>
      {sortedShifts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500">এখনো কোনো শিফট রেকর্ড করা হয়নি।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedShifts.map(shift => (
            <div key={shift.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">{new Date(shift.timestamp).toLocaleDateString()}</h4>
                <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {shift.dailyPercentage}% Rate
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">মোট আয়</p>
                  <p className="font-bold">{formatAED(shift.shiftTotalIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">নিট লাভ (Clean)</p>
                  <p className="font-bold text-green-600">{formatAED(shift.cleanMoney)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
