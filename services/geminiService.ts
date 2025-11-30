import { GoogleGenAI } from "@google/genai";
import { Release, ChangeItem } from "../types";

// Initialize the client
// The API key is guaranteed to be in process.env.API_KEY as per the system instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeRelease = async (release: Release, audience: 'technical' | 'general'): Promise<string> => {
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