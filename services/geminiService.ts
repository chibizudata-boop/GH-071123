import { GoogleGenAI, Type } from "@google/genai";
import { Resident, Task, Staff } from '../types';

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates detailed step-by-step instructions for a care task.
 * Takes resident context into account if provided.
 */
export const generateTaskInstructions = async (title: string, time: string, residentContext?: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    let contextPrompt = "";
    if (residentContext) {
      contextPrompt = `
      Resident Details (Needs special attention):
      "${residentContext}"
      PLEASE Customize the checklist specifically for this resident's needs/disability.
      `;
    }

    const prompt = `
      You are an expert care coordinator for a group home for people with disabilities.
      Create a concise but detailed checklist of 3-5 bullet points for the following task occurring at ${time}.
      
      Task: "${title}"
      ${contextPrompt}
      
      Tone: Professional, warm, and safety-focused.
      Language: Japanese.
      Output format: Just the bullet points.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "詳細を生成できませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AIアシスタントは現在利用できません。";
  }
};

/**
 * Analyzes an image and provides a description suitable for a shift log.
 */
export const analyzeImageForLog = async (base64Image: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash-image";
    
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const mimeType = base64Image.match(/data:([^;]*);/)?.[1] || "image/jpeg";

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: "この画像は障害者グループホームの業務連絡・チャットで使われます。画像に写っているものを識別し、状況を伝えるための簡潔な説明文（日本語）を作成してください。例えば、利用者の持ち物、食事の残量、破損箇所、書類など。"
          }
        ]
      }
    });

    return response.text || "画像の説明を生成できませんでした。";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "画像の解析に失敗しました。";
  }
};

/**
 * Parses a shift schedule image and extracts dates and staff names.
 */
export const parseShiftImage = async (base64Image: string, staffList: Staff[]): Promise<any[]> => {
  try {
    const model = "gemini-2.5-flash-image"; // Using the vision model
    
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const mimeType = base64Image.match(/data:([^;]*);/)?.[1] || "image/jpeg";
    
    const staffNames = staffList.map(s => s.name).join(', ');

    const prompt = `
      Analyze this image of a shift schedule (shift table).
      Extract the schedule for each date.
      
      The known staff members are: ${staffNames}.
      
      Return a JSON array where each object has:
      - date: "YYYY-MM-DD" (assume current year/month if not visible, or guess based on day numbers)
      - dayStaffName: The name of the staff working the day shift (日勤).
      - nightStaffName: The name of the staff working the night shift (夜勤).
      
      If you find a name that matches one of the known staff members partially, use the known name.
      If a slot is empty, leave the name as null.
      
      Response format: Just the JSON array. No markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error", e);
      return [];
    }
  } catch (error) {
    console.error("Gemini Shift Parse Error:", error);
    return [];
  }
};


/**
 * Generates a daily summary report based on completed tasks.
 * Can be scoped to 'All' (Handover report) or specific 'Resident' (Individual record).
 */
export const generateDailyReport = async (
  completedTasks: Task[], 
  residents: Resident[] = [],
  targetResident?: Resident
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    const taskSummary = completedTasks.map(t => {
      const resident = residents.find(r => r.id === t.residentId);
      // If generating for a specific resident, we don't need to repeat their name in every line if it's obvious,
      // but keeping it ensures context.
      const nameInfo = resident ? `[対象: ${resident.name} (Rm.${resident.roomNumber})]` : '[全体/共有]';
      return `- ${t.time} ${t.title} ${nameInfo}: ${t.description}`;
    }).join('\n');

    let prompt = "";

    if (targetResident) {
      // INDIVIDUAL RESIDENT REPORT
      prompt = `
        You are an AI assistant generating a daily care record (ケース記録) for a specific resident in a group home.
        
        Target Resident: ${targetResident.name} (Room ${targetResident.roomNumber})
        Assessment/Context: ${targetResident.assessment}
        
        Tasks Completed for this resident (or global tasks):
        ${taskSummary}

        Language: Japanese.
        Output Structure (Professional Care Record style):
        
        【${targetResident.name}様 本日の記録】
        
        ■ バイタル・健康状態
        (Infer from tasks or state '特変なし' if no health tasks found)
        
        ■ 生活・活動の様子
        (Summarize meals, activities, excretion support based on tasks)
        
        ■ 特記事項
        (Any specific incidents or notes from descriptions)
      `;
    } else {
      // GENERAL HANDOVER REPORT
      prompt = `
        You are an AI assistant generating a daily shift report for a group home.
        Based on the completed tasks list below, create a structured handover report (申し送り事項).
        
        **CRITICAL REQUIREMENT**: You MUST organize the report BY RESIDENT.
        
        Tasks Completed Today:
        ${taskSummary}
  
        Language: Japanese.
        Output Structure:
        
        【全体業務・共有事項】
        (Summarize tasks that are marked [全体/共有] or affect everyone)
  
        【利用者別経過】
        (Create a section for EACH resident mentioned in the tasks)
        
        ■ [Resident Name] (Room Number)
        ・(Time) Task: Detail
        ・(Any specific observations noted in the descriptions)
        
        ... (Repeat for other residents)
  
        【特記事項・次番への申し送り】
        (Summarize any high-priority items, incidents, or incomplete notes)
      `;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "レポートを生成できませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "レポート生成中にエラーが発生しました。";
  }
};