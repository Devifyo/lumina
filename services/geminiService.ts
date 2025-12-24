
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EditMode, Selection } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

export async function editImage(
  base64Data: string,
  mimeType: string,
  mode: EditMode,
  customPrompt?: string,
  selection?: Selection
): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  let prompt = '';
  switch (mode) {
    case EditMode.REMOVE_BACKGROUND:
      prompt = `ACT AS AN ADVANCED ALPHA-CHANNEL EXTRACTION ENGINE.
Task: PROFESSIONAL SUBJECT ISOLATION (TRANSPARENT PNG).
Instructions:
1. Identify the primary subject(s) in the foreground with maximum precision.
2. Remove all background elements, including sky, ground, and distant objects.
3. CRITICAL: The resulting image MUST have a functional alpha channel.
4. Set the Alpha value of all background pixels to 0 (100% transparent).
5. Ensure subject edges are clean, anti-aliased, and free of background color bleeding.
6. Return the isolated subject as a high-quality transparent PNG.
7. NO placeholder backgrounds. Only the subject on a truly transparent canvas.`;
      break;
    case EditMode.REMOVE_OBJECT:
      const coordContext = selection 
        ? `STRICT TARGET: The object to be erased is located at normalized coordinates (X: ${selection.x.toFixed(4)}, Y: ${selection.y.toFixed(4)}).` 
        : `TARGET DESCRIPTION: "${customPrompt}".`;
        
      prompt = `ACT AS A WORLD-CLASS INPAINTING SPECIALIST.
Task: SEAMLESS OBJECT ERASURE & SCENE RECONSTRUCTION.
Context: ${coordContext}
Instructions:
1. Completely remove the target object, its shadows, reflections, and any related artifacts.
2. Inpaint the resulting void by synthesizing the background textures, patterns, and lighting from the surrounding area.
3. Ensure the reconstruction is mathematically and visually consistent with the rest of the scene's perspective and depth.
4. The final result must be a single cohesive image where the object is entirely gone without a trace.
5. RETURN ONLY THE EDITED IMAGE DATA.`;
      break;
    case EditMode.ENHANCE:
      prompt = `ACT AS A PROFESSIONAL PHOTO EDITOR.
Task: NEURAL ENHANCEMENT & UPSCALING.
Instructions:
1. Increase local contrast and sharpness while suppressing digital noise.
2. Optimize color balance, saturation, and dynamic range for a premium look.
3. Simulate a high-end full-frame camera sensor fidelity.
4. Fix compression artifacts and restore micro-textures.
5. RETURN ONLY THE ENHANCED IMAGE DATA.`;
      break;
    case EditMode.BLUR_BACKGROUND:
      const focusPoint = selection 
        ? `FOCUS ANCHOR: Point at (X: ${selection.x.toFixed(4)}, Y: ${selection.y.toFixed(4)}).` 
        : `AUTO-FOCUS: Find the most prominent foreground subject.`;

      prompt = `ACT AS A CINEMATIC LENS SIMULATOR.
Task: DEPTH-AWARE BOKEH (PORTRAIT BLUR).
Instructions:
1. Keep the subject at the ${focusPoint} razor-sharp.
2. Apply a smooth, progressive Gaussian blur to everything behind the subject.
3. Simulate a fast f/1.4 prime lens aesthetic.
4. Ensure the depth transition is natural and edges are masked perfectly.
5. RETURN ONLY THE EDITED IMAGE DATA.`;
      break;
    case EditMode.CUSTOM_PROMPT:
      prompt = `Task: ARTISTIC NEURAL TRANSFORMATION.
User Request: "${customPrompt}".
Maintain the structure and identity of the source while applying the requested changes creatively and realistically. Return the resulting image data only.`;
      break;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
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
      // Iterate through parts to find the image data as per guidelines
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
}
