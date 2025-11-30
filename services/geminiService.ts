import { GoogleGenAI } from "@google/genai";
import { Release, ChangeItem } from "../types";

// Check for API key presence to support optional AI features
const apiKey = process.env.API_KEY;
export const isAIEnabled = !!apiKey && apiKey !== 'undefined' && apiKey !== '';

let ai: GoogleGenAI | null = null;

if (isAIEnabled) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey as string });
  } catch (error) {
    console.warn("Failed to initialize Google GenAI client", error);
  }
}

export const summarizeRelease = async (release: Release, audience: 'technical' | 'general'): Promise<string> => {
  if (!ai) return "AI features are not enabled.";

  try {
    const modelId = 'gemini-2.5-flash';
    
    // Construct a structured prompt
    const changesText = release.changes.map(c => `- [${c.type}] ${c.description} ${c.details ? `(${c.details})` : ''}`).join('\n');
    
    const prompt = `
      Analyze the following software release notes for version ${release.version}:
      
      Title: ${release.title}
      Description: ${release.description}
      Changes:
      ${changesText}
      
      Task:
      ${audience === 'technical' 
        ? "Provide a concise technical breakdown. Highlight breaking changes, architectural shifts, and security implications. Use bullet points." 
        : "Explain this update to a non-technical stakeholder (CEO/Marketing). Focus on business value, new capabilities, and user experience improvements. Keep it friendly and exciting."}
        
      Format: Plain text with simple markdown formatting (bold/italic/lists). Keep it under 200 words.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 0.3, // Lower temperature for more factual summaries
      }
    });

    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Error summarizing release:", error);
    return "Sorry, I couldn't generate a summary for this release. Please try again later.";
  }
};


export const chatWithRelease = async (release: Release, question: string): Promise<string> => {
    if (!ai) return "AI features are not enabled.";

    try {
        const modelId = 'gemini-2.5-flash';
        
        const changesText = release.changes.map(c => `- [${c.type}] ${c.description} ${c.details ? `(${c.details})` : ''}`).join('\n');
        
        const prompt = `
          Context: You are an expert developer assistant answering questions about a specific software release (Version ${release.version}).
          
          Release Data:
          Title: ${release.title}
          Overview: ${release.description}
          Detailed Changes:
          ${changesText}
          
          User Question: "${question}"
          
          Answer concisely and accurately based ONLY on the provided release data. If the answer isn't in the release notes, say so politely.
        `;
    
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
        });
    
        return response.text || "No response generated.";
      } catch (error) {
        console.error("Error chatting with release:", error);
        return "I encountered an error trying to answer your question.";
      }
};

export const generateDraftDescription = async (version: string, changes: ChangeItem[]): Promise<string> => {
  if (!ai) return "";

  try {
      if (changes.length === 0) return "";
      
      const modelId = 'gemini-2.5-flash';
      const changesText = changes.map(c => `- [${c.type}] ${c.description}`).join('\n');
      
      const prompt = `
          Act as a Product Manager. Write a compelling, concise release description (max 3 sentences) for version ${version} of our software.
          
          Based on these changes:
          ${changesText}
          
          Focus on the value provided to the user. Do not use bullet points, just a summary paragraph.
      `;

      const response = await ai.models.generateContent({
           model: modelId,
           contents: prompt,
      });

      return response.text || "";
  } catch (error) {
      console.error("Error generating draft:", error);
      return "";
  }
};