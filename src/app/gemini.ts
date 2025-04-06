// src/app/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual Gemini API key
const API_KEY = "AIzaSyBII1KWM0GZdcPKHwws7e3Y1P-VrXPk1tA";

const genAI = new GoogleGenerativeAI(API_KEY);


const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: `
    You are a fire safety training assistant for hotel staff. Your role is to:
    1. Generate realistic fire drill scenarios specific to hotels
    2. Evaluate staff responses based on safety protocols
    3. Provide constructive feedback with safety improvement suggestions
    4. Score responses on a 1-5 scale (1=unsafe, 5=excellent)
    5. Adapt difficulty based on user's role (housekeeping, front desk, etc.)
    
    Always prioritize:
    - Guest safety protocols
    - Local fire regulations
    - Clear communication standards
    - Practical evacuation procedures
  `
});

export async function generateFireDrillQuestion(previousQuestions: string[] = []) {
  const prompt = `
    Generate a unique hotel fire drill training question that hasn't been used yet.
    Previous questions: ${previousQuestions.join(", ") || "None"}
    
    Requirements:
    - Must be scenario-based
    - Should test practical response knowledge
    - Include potential hazards specific to hotels
    - Format as a clear question
    
    Examples:
    - "You smell smoke coming from a guest room while doing turndown service. What steps do you take?"
    - "A visually impaired guest needs assistance during an evacuation. How do you help?"
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function evaluateFireDrillResponse(question: string, response: string) {
  const prompt = `
    Question: ${question}
    Response: ${response}
    
    Evaluate this fire drill response according to:
    1. Safety protocol adherence (20%)
    2. Guest consideration (20%)
    3. Communication clarity (20%)
    4. Practicality (20%)
    5. Speed of implementation (20%)
    
    Provide:
    - Numerical score (1-5)
    - Brief feedback
    - 2-3 specific improvement suggestions
    - Correct procedure summary
    
    Format as JSON:
    {
      "score": number,
      "feedback": string,
      "improvements": string[],
      "correctProcedure": string
    }
  `;

  const result = await model.generateContent(prompt);
  try {
    return JSON.parse(result.response.text());
  } catch (e) {
    console.error("Error parsing Gemini response", e);
    return {
      score: 3,
      feedback: "Response evaluation unavailable",
      improvements: [],
      correctProcedure: ""
    };
  }
}

