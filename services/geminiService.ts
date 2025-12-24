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

  // Dedicated image models that support image output via inlineData
  const PRIMARY_MODEL = 'gemini-2.5-flash-image';
  const FALLBACK_MODEL = 'gemini-3-pro-image-preview';

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
5. Output the result as a PNG with a proper alpha channel.
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
Apply the modification while maintaining consistency with the original lighting and perspective.
Output only the modified image.`;
      break;
  }

  const performRequest = async (model: string): Promise<string | null> => {
    // Both models used here are image models and support imageConfig.
    const config: any = {
      imageConfig: {
        aspectRatio: "1:1"
      }
    };

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
      config: config
    });

    const candidates = response.candidates || [];
    if (candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    // If we get here, the model returned text instead of an image.
    // For these models, this usually means it refused or failed the specific generation.
    return null;
  };

  try {
    const result = await performRequest(PRIMARY_MODEL);
    if (result) return result;
    
    // If PRIMARY returned null (no image), try FALLBACK
    console.warn(`Primary model ${PRIMARY_MODEL} returned no image data. Attempting fallback...`);
    return await performRequest(FALLBACK_MODEL);
  } catch (error: any) {
    const status = error?.status || error?.code;
    const message = error?.message || "";

    // Retry on common availability errors (429, 404, 400)
    if (status === 429 || status === 400 || status === 404 || 
        message.includes("429") || message.includes("400") || message.includes("404")) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed (Status: ${status}). Retrying with ${FALLBACK_MODEL}...`);
      try {
        const result = await performRequest(FALLBACK_MODEL);
        if (!result) throw new Error("Fallback model failed to generate image data.");
        return result;
      } catch (fallbackError: any) {
        console.error("Fallback Model Synthesis Error:", fallbackError);
        throw fallbackError;
      }
    }

    console.error("Primary Model Synthesis Error:", error);
    throw error;
  }
}