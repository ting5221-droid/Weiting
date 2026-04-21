import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CountryDetails {
  name: string;
  features: string;
  climate: string;
  visa: string;
  currency: string;
  warHistory: string;
}

export async function fetchCountryDetails(countryName: string): Promise<CountryDetails> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `提供關於 ${countryName} 的詳細資訊，包含特色、氣候、簽證、幣值以及目前的戰爭或衝突狀況。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          features: { type: Type.STRING },
          climate: { type: Type.STRING },
          visa: { type: Type.STRING },
          currency: { type: Type.STRING },
          warHistory: { type: Type.STRING }
        },
        required: ["name", "features", "climate", "visa", "currency", "warHistory"]
      }
    }
  });

  return JSON.parse(response.text);
}
