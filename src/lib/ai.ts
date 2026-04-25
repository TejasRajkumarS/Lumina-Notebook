import { GoogleGenAI, Modality } from "@google/genai";
import { Source, Message } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateChatResponse(
  userPrompt: string,
  sources: Source[],
  history: Message[]
) {
  const context = sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.name} ---\n${s.content}`)
    .join("\n\n");

  const systemInstruction = `
    You are Lumina AI, a sophisticated research assistant. 
    Your primary goal is to provide source-grounded answers based EXCLUSIVELY on the provided context.
    
    RULES:
    1. Only use information from the provided sources.
    2. If the answer is not in the context, say "I don't have enough information from your sources to answer that."
    3. Include INLINE CITATIONS using the format [Source Name]. If page numbers are available in the text, include them [Source Name, Page X].
    4. Keep your tone professional, academic, and helpful.
    5. Use markdown for better readability (bolding, lists, etc.).
    6. FLASHCARDS: If the user's prompt indicates they want flashcards, study sets, quiz questions, or practice materials, you MUST generate them in a JSON block with the language tag 'flashcards'.
       The JSON must be an array of objects, each with "front" and "back" keys.
       
       Format Example:
       Here are some flashcards to help you study:
       \`\`\`flashcards
       [
         {"front": "What is the capital of France?", "back": "Paris"},
         {"front": "Who wrote 'Romeo and Juliet'?", "back": "William Shakespeare"}
       ]
       \`\`\`
       
       Always provide a brief introductory sentence before the flashcard block.
       Ensure the flashcards are focused on the key concepts found in the provided sources.
    
    CONTEXT:
    ${context}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { role: "user", parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.2,
    },
  });

  return response.text;
}

export async function generateSourceInsights(sourceContent: string) {
  const prompt = `
    Analyze the following document and provide:
    1. A concise summary (max 300 words).
    2. Three suggested analytical questions for the user to explore this content deeper.
    
    Format your response as valid JSON with "summary" and "questions" (array of strings) keys.
    
    DOCUMENT:
    ${sourceContent}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

export async function generatePodcastScript(sources: Source[]) {
  const context = sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.name} ---\n${s.content}`)
    .join("\n\n");

  const prompt = `
    Based on the following research documents, create a conversational "Podcast" script between two hosts:

    - Host A: A curious interviewer who asks insightful questions and guides the conversation. Keep their dialogue concise and focused on asking questions.
    - Host B: An expert who provides detailed explanations and insights. Their responses should be comprehensive but well-structured.

    IMPORTANT RULES:
    1. Clearly alternate between Host A and Host B - never have the same speaker twice in a row
    2. Host A should ask ONE clear question at a time
    3. Host B should provide a complete answer before Host A asks the next question
    4. Each dialogue turn should be a complete thought - no interruptions or back-and-forth within a single turn
    5. Make the conversation natural and engaging, but maintain clear speaker boundaries
    6. Aim for 8-12 exchanges total (Host A asks, Host B answers, repeat)

    Format the response as a valid JSON array of objects where each object has:
    - "speaker": "Host A" or "Host B"
    - "text": The complete dialogue spoken by that person (one full question or one full answer)

    CONTEXT:
    ${context}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

export async function generateTTS(script: { speaker: string; text: string }[]) {
  const fullText = script.map(s => `${s.speaker}: ${s.text}`).join("\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `TTS the following conversation:\n${fullText}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: "Host A",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
            },
            {
              speaker: "Host B",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
            }
          ]
        }
      }
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}
