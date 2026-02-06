
import { GoogleGenAI, Type } from "@google/genai";
import { StudySettings, CFATopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPersonalyPlan = async (settings: StudySettings, topics: CFATopic[]) => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    I am a CFA Level 1 candidate. 
    Start Date: ${settings.startDate}
    Exam Date: ${settings.examDate}
    Available Hours Per Week: ${settings.hoursPerWeek}
    Financial Background: ${settings.hasBackground ? 'Yes' : 'No'}
    
    Current Topics: ${topics.map(t => `${t.name} (Difficulty: ${t.difficulty}, Weight: ${t.weightMin}-${t.weightMax}%)`).join(', ')}

    Generate a high-level strategic study plan. 
    1. Overall strategy based on my background.
    2. A weekly breakdown for the next 8 weeks.
    3. For each week, provide a list of 7 daily tasks (one for each day).
    
    Structure the response in JSON format.
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
                    description: "7 tasks, one for each day of the week"
                  }
                }
              }
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['strategy', 'weeklyBreakdown', 'tips'],
          propertyOrdering: ['strategy', 'weeklyBreakdown', 'tips']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getTopicExplanation = async (topicName: string, query: string) => {
  const model = 'gemini-3-flash-preview';
  const prompt = `As a CFA tutor, explain this concept for Level 1: "${query}" in the context of ${topicName}. Keep it concise and exam-focused.`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    return response.text;
  } catch (error) {
    return "I'm sorry, I couldn't process that explanation right now.";
  }
};
