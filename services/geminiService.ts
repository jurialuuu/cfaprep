
import { GoogleGenAI, Type } from "@google/genai";
import { StudySettings, CFATopic } from "../types";

// Always initialize the client using the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPersonalyPlan = async (settings: StudySettings, topics: CFATopic[]) => {
  // Use gemini-3-flash-preview as it is generally more stable and faster for JSON tasks
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    I am a CFA Level 1 candidate. 
    Target Exam Date: ${settings.examDate} (November 2026 Window)
    Available Hours Per Week: ${settings.hoursPerWeek}
    Financial Background: ${settings.hasBackground ? 'Yes' : 'No'}
    
    Current Topics and Weights: ${topics.map(t => `${t.name} (Difficulty: ${t.difficulty}, Weight: ${t.weightMin}-${t.weightMax}%)`).join(', ')}

    Generate a high-level strategic study plan for the next 8 weeks. 
    Return a JSON object with:
    1. "strategy": A 2-sentence overall strategy based on my profile.
    2. "weeklyBreakdown": An array of 8 week objects. Each week object must contain:
       - "week": Number (1-8)
       - "topic": The main topic(s) for that week.
       - "focusArea": Specific sub-concepts to master.
       - "dailyTasks": An array of EXACTLY 7 clear, actionable tasks (one for each day of the week).
    3. "tips": An array of 3 specific study tips for this candidate.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            weeklyBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.NUMBER },
                  topic: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  dailyTasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    minItems: 7,
                    maxItems: 7
                  }
                },
                required: ['week', 'topic', 'focusArea', 'dailyTasks']
              }
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['strategy', 'weeklyBreakdown', 'tips']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    // Throw error so caller can handle UI feedback
    throw error;
  }
};

export const getTopicExplanation = async (topicName: string, query: string) => {
  const model = 'gemini-3-flash-preview';
  const prompt = `As a CFA tutor, explain this concept for Level 1: "${query}" in the context of ${topicName}. Keep it concise and exam-focused. Use bullet points if helpful.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "I'm sorry, I couldn't process that explanation right now. Please try a different query.";
  }
};
