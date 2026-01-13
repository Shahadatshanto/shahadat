
import { RawShiftData, CalculatedShift } from '../types.ts';
import { 
  FUEL_COST_PER_KM, 
  BOOKING_TRIP_EXPENSE_UNIT, 
  NORMAL_TRIP_EXPENSE_UNIT, 
  PERCENTAGE_TIERS 
} from '../constants.ts';

export const calculateShift = (raw: RawShiftData): CalculatedShift => {
  const shiftTotalIncome = raw.totalAmount + raw.paidInCareem;
  
  const fuel = raw.totalHiredKm * FUEL_COST_PER_KM;
  const booking = raw.bookingTrip * BOOKING_TRIP_EXPENSE_UNIT;
  const normalTrip = (raw.totalTrip - raw.bookingTrip) * NORMAL_TRIP_EXPENSE_UNIT;
  const tollway = raw.tollwayAmount;
  const halaPack = raw.halaPackAmount;
  const other = raw.otherExpenses;

  const totalExpense = fuel + booking + normalTrip + tollway + halaPack + other;
  const cleanMoney = shiftTotalIncome - totalExpense;

  let dailyPercentage = 0;
  for (const tier of PERCENTAGE_TIERS) {
    if (cleanMoney >= tier.min && cleanMoney < tier.max) {
      dailyPercentage = tier.rate;
      break;
    }
  }
  if (cleanMoney >= 2000) dailyPercentage = 37;

  return {
    id: Math.random().toString(36).substr(2, 9),
    raw,
    shiftTotalIncome,
    expenses: { fuel, booking, normalTrip, tollway, halaPack, other },
    totalExpense,
    cleanMoney,
    dailyPercentage,
    timestamp: Date.now()
  };
};

export const formatAED = (amount: number) => `AED ${amount.toFixed(2)}`;
