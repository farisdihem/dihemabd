import { GoogleGenAI } from '@google/genai';

export const getGeminiClient = () => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('API Key not found');
  }
  return new GoogleGenAI({ apiKey });
};

export const getModelName = () => {
  return localStorage.getItem('gemini_model') || 'gemini-3-flash-preview';
};

export const generateContent = async (prompt: string, responseMimeType: string = 'text/plain') => {
  const ai = getGeminiClient();
  const model = getModelName();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType,
      },
    });
    return response.text;
  } catch (error: any) {
    let errorMessage = error.message || "فشل الاتصال بـ API";
    if (errorMessage.toLowerCase().includes("high demand") || errorMessage.includes('429')) {
      errorMessage = "النموذج يواجه ضغطاً كبيراً حالياً. يرجى المحاولة مرة أخرى بعد دقيقة، أو تغيير 'نموذج الذكاء الاصطناعي' من الإعدادات إلى Gemini Pro.";
    }
    throw new Error(errorMessage);
  }
};

export const generateImage = async (prompt: string) => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: "Create a highly realistic, beautifully colored, and meticulously detailed mathematical geometric diagram based on this description: " + prompt + ". Use a professional, vibrant color palette with fine details. If the shape is complex, seamlessly integrate subtle, high-quality illustrative elements (like real-world objects, textures, or 3D-like shading) to make it visually stunning yet educationally clear. Ensure all mathematical labels, points, and measurements are perfectly legible and precise. The final image should look like a premium textbook illustration.",
          },
        ],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
