
export interface RawShiftData {
  totalAmount: number;
  paidInCareem: number;
  totalHiredKm: number;
  vacantKm: number;
  totalTrip: number;
  bookingTrip: number;
  tollwayAmount: number;
  halaPackAmount: number;
  otherExpenses: number;
  date: string;
}

export interface CalculatedShift {
  id: string;
  raw: RawShiftData;
  shiftTotalIncome: number;
  expenses: {
    fuel: number;
    booking: number;
    normalTrip: number;
    tollway: number;
    halaPack: number;
    other: number;
  };
  totalExpense: number;
  cleanMoney: number;
  dailyPercentage: number;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  carSideNumber: string;
  mobileNumber: string;
  isSubscribed: boolean;
}
