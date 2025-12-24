import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EditMode, Selection } from "../types";

export async function editImage(
  base64Data: string,
  mimeType: string,
  mode: EditMode,
  customPrompt?: string,
  selection?: Selection
): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const PRIMARY_MODEL = 'gemini-2.5-flash-image';
  const FALLBACK_MODEL = 'gemini-flash-latest';

  let prompt = '';
  switch (mode) {
    case EditMode.REMOVE_BACKGROUND:
      prompt = `TASK: HIGH-FIDELITY SUBJECT ISOLATION.
Output format: TRANSPARENT PNG.
Instructions:
1. Identify the central subject(s) with surgical precision.
2. Remove all background elements completely.
3. Every pixel that is NOT part of the subject must have ALPHA = 0 (100% transparent).
4. Do NOT use placeholder colors (no white, black, or grey backgrounds).
5. Clean the edges of the subject to prevent "halos" or original background bleeding.
6. The subject should be the only visible content on a fully transparent canvas.`;
      break;
    case EditMode.REMOVE_OBJECT:
      const coordContext = selection 
        ? `TARGET: The object at normalized coordinates X:${selection.x.toFixed(3)}, Y:${selection.y.toFixed(3)}.` 
        : `TARGET: "${customPrompt}".`;
        
      prompt = `TASK: SEAMLESS OBJECT ERASURE.
Context: ${coordContext}
Instructions:
1. Erase the specified object and its associated shadow/reflection.
2. Inpaint the area by synthesizing a matching background from surroundings.
3. Ensure no artifacts or blurring remains in the edited region.
4. Output the full image with the object removed.`;
      break;
    case EditMode.ENHANCE:
      prompt = `TASK: NEURAL RETOUCHING.
Instructions:
1. Upscale perceived detail and micro-contrast.
2. Reduce noise and compression artifacts.
3. Balance exposure and color vibrancy for a professional "studio" look.
4. Output the enhanced image.`;
      break;
    case EditMode.BLUR_BACKGROUND:
      const focusPoint = selection 
        ? `FOCUS: Anchor focus at (X:${selection.x.toFixed(3)}, Y:${selection.y.toFixed(3)}).` 
        : `FOCUS: Auto-detect and focus on the main subject.`;

      prompt = `TASK: DEPTH-OF-FIELD SIMULATION.
Context: ${focusPoint}
Instructions:
1. Keep the subject in razor-sharp focus.
2. Apply a progressive, natural lens blur (bokeh) to all background layers.
3. Mimic a high-quality prime lens (e.g., f/1.8).
4. Output the result.`;
      break;
    case EditMode.CUSTOM_PROMPT:
      prompt = `TASK: CREATIVE EDITING.
User Instruction: "${customPrompt}".
Apply the modification while maintaining consistency with the original lighting and perspective.`;
      break;
  }

  const performRequest = async (model: string): Promise<string | null> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidates = response.candidates || [];
    if (candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  };

  try {
    // Attempt with Primary Model
    return await performRequest(PRIMARY_MODEL);
  } catch (error: any) {
    const status = error?.status || error?.code;
    const message = error?.message || "";

    // Check if error is Quota (429) or Bad Request (400)
    if (status === 429 || status === 400 || message.includes("quota") || message.includes("limit")) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed (Status: ${status}). Falling back to ${FALLBACK_MODEL}...`);
      try {
        return await performRequest(FALLBACK_MODEL);
      } catch (fallbackError: any) {
        console.error("Fallback Model Synthesis Error:", fallbackError);
        throw fallbackError;
      }
    }

    console.error("Primary Model Synthesis Error:", error);
    throw error;
  }
}