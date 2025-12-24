import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EditMode, Selection } from "../types";

export async function editImage(
  base64Data: string,
  mimeType: string,
  mode: EditMode,
  customPrompt?: string,
  selection?: Selection
): Promise<string | null> {
  // Use the API key provided in the environment. Guidelines state process.env.API_KEY.
  // Assuming the developer or environment mapping handles API_KEY vs GEMINI_API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Use gemini-2.5-flash-image for all visual generation and editing tasks
  const MODEL_NAME = 'gemini-2.5-flash-image';

  let prompt = '';
  switch (mode) {
    case EditMode.REMOVE_BACKGROUND:
      prompt = `ACT AS AN ADVANCED ALPHA-CHANNEL EXTRACTION ENGINE.
Task: PROFESSIONAL SUBJECT ISOLATION (TRANSPARENT PNG).
Instructions:
1. Precisely identify the primary subject(s) in the foreground.
2. REMOVE ALL BACKGROUND PIXELS including shadows, floors, skies, and secondary objects.
3. CRITICAL: The output image MUST BE A TRANSPARENT PNG.
4. Set the alpha value of all non-subject pixels to 0 (100% transparent).
5. Ensure subject edges are sharp, clean, anti-aliased, and have NO fringe colors from the original background.
6. The resulting subject must be centered on a transparent canvas.
7. DO NOT add any placeholder backgrounds (no white, no black, no checkers). JUST TRANSPARENCY.`;
      break;
    case EditMode.REMOVE_OBJECT:
      const coordContext = selection 
        ? `STRICT TARGET: The object to be erased is located at normalized coordinates (X: ${selection.x.toFixed(4)}, Y: ${selection.y.toFixed(4)}).` 
        : `TARGET DESCRIPTION: "${customPrompt}".`;
        
      prompt = `ACT AS A WORLD-CLASS INPAINTING SPECIALIST.
Task: SEAMLESS OBJECT ERASURE & SCENE RECONSTRUCTION.
Context: ${coordContext}
Instructions:
1. Completely remove the target object and all its related shadows and reflections.
2. Synthesize a perfectly matched background by inferring patterns and lighting from surrounding pixels.
3. Maintain perspective and focal depth consistency across the reconstructed area.
4. The final result must look untouched, as if the object never existed.
5. Return only the edited image data.`;
      break;
    case EditMode.ENHANCE:
      prompt = `ACT AS A PROFESSIONAL PHOTO RETOUCHER.
Task: NEURAL ENHANCEMENT & HD RESTORATION.
Instructions:
1. Sharpen micro-textures and restore details lost to compression.
2. Optimize contrast, dynamic range, and color vibrancy while maintaining realism.
3. Suppress digital noise without losing organic skin or material textures.
4. Upscale the perceived quality to professional standard.
5. Return only the enhanced image data.`;
      break;
    case EditMode.BLUR_BACKGROUND:
      const focusPoint = selection 
        ? `FOCUS ANCHOR: Focus on point (X: ${selection.x.toFixed(4)}, Y: ${selection.y.toFixed(4)}).` 
        : `AUTO-FOCUS: Focus on the most prominent foreground subject.`;

      prompt = `ACT AS A CINEMATIC OPTICS EMULATOR.
Task: DEPTH-AWARE BOKEH (PORTRAIT BLUR).
Context: ${focusPoint}
Instructions:
1. Keep the subject crystal clear and sharp.
2. Apply a smooth, progressive lens blur to all background elements.
3. Simulate an f/1.4 aperture look with natural bokeh patterns.
4. Ensure the transition between the focused subject and blurred background is seamless.
5. Return only the edited image data.`;
      break;
    case EditMode.CUSTOM_PROMPT:
      prompt = `Task: CREATIVE NEURAL TRANSFORMATION.
User Instruction: "${customPrompt}".
Apply the requested changes while maintaining the original composition's perspective and core identity. Return only the resulting image data.`;
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
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error: any) {
    console.error("Vision Synthesis Error:", error);
    throw error;
  }
}