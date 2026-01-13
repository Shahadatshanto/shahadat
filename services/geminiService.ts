
import { GoogleGenAI, Type } from "@google/genai";
import { RawShiftData } from "../types.ts";

export const extractShiftDataFromImage = async (base64Image: string): Promise<RawShiftData> => {
  // Safely check for API_KEY to avoid ReferenceErrors in browser
  let apiKey = '';
  try {
    apiKey = (process.env as any).API_KEY || '';
  } catch (e) {
    console.warn("Could not access process.env.API_KEY directly.");
  }
  
  if (!apiKey) {
    throw new Error("API_KEY খুঁজে পাওয়া যায়নি। নেটলিফাই এনভায়রনমেন্ট ভ্যারিয়েবল চেক করুন।");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `Extract taxi shift summary details from this image. 
            Respond with the following JSON structure ONLY. Use 0 if a field is not found.
            Ensure numeric values are provided for all amounts.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalAmount: { type: Type.NUMBER },
            paidInCareem: { type: Type.NUMBER },
            totalHiredKm: { type: Type.NUMBER },
            vacantKm: { type: Type.NUMBER },
            totalTrip: { type: Type.NUMBER },
            bookingTrip: { type: Type.NUMBER },
            tollwayAmount: { type: Type.NUMBER },
            halaPackAmount: { type: Type.NUMBER },
            otherExpenses: { type: Type.NUMBER },
            date: { type: Type.STRING }
          },
          required: ["totalAmount", "paidInCareem", "totalHiredKm", "totalTrip"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      totalAmount: data.totalAmount || 0,
      paidInCareem: data.paidInCareem || 0,
      totalHiredKm: data.totalHiredKm || 0,
      vacantKm: data.vacantKm || 0,
      totalTrip: data.totalTrip || 0,
      bookingTrip: data.bookingTrip || 0,
      tollwayAmount: data.tollwayAmount || 0,
      halaPackAmount: data.halaPackAmount || 0,
      otherExpenses: data.otherExpenses || 0,
      date: data.date || new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Gemini processing error:", error);
    throw new Error("ছবি থেকে তথ্য পড়া সম্ভব হয়নি। আবার চেষ্টা করুন।");
  }
};
