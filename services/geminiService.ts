
import { GoogleGenAI, Type } from "@google/genai";
import { RawShiftData } from "../types.ts";

export const extractShiftDataFromImage = async (base64Image: string): Promise<RawShiftData> => {
  // Enhanced API Key detection
  let apiKey = '';
  try {
    apiKey = (process.env as any)?.API_KEY || (window as any)?.process?.env?.API_KEY || '';
  } catch (e) {
    console.error("Critical: Could not access process.env", e);
  }
  
  // If still empty, check if it was hardcoded or injected elsewhere
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.length < 10) {
    throw new Error("API_KEY খুঁজে পাওয়া যায়নি। দয়া করে Netlify Site Settings-এ 'API_KEY' যোগ করুন এবং সাইটটি Re-deploy করুন। আপনি যদি লোকাল মেশিনে থাকেন, তবে .env ফাইলটি চেক করুন।");
  }

  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const imageData = base64Image.split(',')[1] || base64Image;

  // Re-initialize AI client with the detected key
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageData,
            },
          },
          {
            text: `Extract taxi shift summary details from this UAE/Dubai taxi receipt image. 
            Identify these specific fields even if labeled differently:
            - "Total Sales" or "Total Amount" -> totalAmount
            - "Careem", "Card", or "Paid in Careem" -> paidInCareem
            - "Total Hired KM" -> totalHiredKm
            - "Vacant KM" -> vacantKm
            - "Total Trip" -> totalTrip
            - "Booking Trip" or "Dispatch Trip" -> bookingTrip
            - "Salik" or "Tollway" -> tollwayAmount
            - "Hala Pack" -> halaPackAmount
            - "Other Expenses" or "Fine/Gate" -> otherExpenses
            - "Date" -> date
            
            Return ONLY a valid JSON object. Use 0 for missing numeric values.`
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
          required: ["totalAmount", "totalHiredKm"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI ছবি থেকে কোনো তথ্য খুঁজে পায়নি।");
    
    const data = JSON.parse(text);
    return {
      totalAmount: Number(data.totalAmount) || 0,
      paidInCareem: Number(data.paidInCareem) || 0,
      totalHiredKm: Number(data.totalHiredKm) || 0,
      vacantKm: Number(data.vacantKm) || 0,
      totalTrip: Number(data.totalTrip) || 0,
      bookingTrip: Number(data.bookingTrip) || 0,
      tollwayAmount: Number(data.tollwayAmount) || 0,
      halaPackAmount: Number(data.halaPackAmount) || 0,
      otherExpenses: Number(data.otherExpenses) || 0,
      date: data.date || new Date().toISOString().split('T')[0]
    };
  } catch (error: any) {
    console.error("Gemini processing error:", error);
    
    if (error.message?.includes("API key not valid") || error.message?.includes("403")) {
      throw new Error("আপনার API Key-টি কাজ করছে না। অনুগ্রহ করে একটি বৈধ Key ব্যবহার করুন।");
    }
    
    throw new Error(error.message || "ছবিটি স্ক্যান করা সম্ভব হচ্ছে না। দয়া করে আরও পরিষ্কার ছবি তুলুন।");
  }
};
