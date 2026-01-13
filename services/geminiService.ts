
import { GoogleGenAI, Type } from "@google/genai";
import { RawShiftData } from "../types.ts";

export const extractShiftDataFromImage = async (base64Image: string): Promise<RawShiftData> => {
  // Accessing API_KEY safely.
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    throw new Error("API_KEY সেট করা নেই। দয়া করে নেটলিফাই সেটিংসে API_KEY যোগ করুন।");
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
    console.error("Failed to parse Gemini response:", error);
    throw new Error("ছবি থেকে তথ্য পড়া যায়নি। ছবি পরিষ্কার করে আবার তুলুন এবং নিশ্চিত করুন এটি একটি ভ্যালিড সামারি রিপোর্ট।");
  }
};
