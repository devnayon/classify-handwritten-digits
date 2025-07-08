interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const classifyWithGemini = async (imageData: ImageData): Promise<{
  digit: number;
  confidence: number;
  reasoning: string;
}> => {
  try {
    // Convert ImageData to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to base64
    const base64Image = canvas.toDataURL('image/png').split(',')[1];
    
    const prompt = `You are an expert at recognizing handwritten digits. Analyze this image and identify the handwritten digit (0-9).

Please respond with ONLY a JSON object in this exact format:
{
  "digit": <number from 0-9>,
  "confidence": <decimal from 0.0 to 1.0>,
  "reasoning": "<brief explanation of why you identified this digit>"
}

Look carefully at the strokes, curves, and overall shape. Consider common ways people write each digit.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyChbazbSH883uEmbmuCscaAIUyn6jOsp8w`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/png",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Gemini response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      digit: parseInt(result.digit),
      confidence: parseFloat(result.confidence),
      reasoning: result.reasoning || 'No reasoning provided'
    };
    
  } catch (error) {
    console.error('Gemini classification error:', error);
    throw error;
  }
};