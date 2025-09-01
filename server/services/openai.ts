import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-default" 
});

export async function analyzeImageFrame(imageUrl: string, frameId: string): Promise<{
  crowd_density: string;
  estimated_people: number;
  risk_level: string;
  detected_behaviors: string[];
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert crowd safety analyst. Analyze the image and return EXACTLY a JSON object with crowd_density (none|low|medium|high|critical), estimated_people (integer), risk_level (none|low|medium|high|critical), detected_behaviors (array of strings like panic_movement, blocking_exit, stampede_wave, scattered_fighting, obstruction), and confidence (0-1 float). Return only valid JSON, no extra text."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this crowd scene for safety risks. Focus on density, movement patterns, and potential dangers. Image URL: ${imageUrl}`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      crowd_density: result.crowd_density || 'low',
      estimated_people: result.estimated_people || 0,
      risk_level: result.risk_level || 'none',
      detected_behaviors: result.detected_behaviors || [],
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    // Return safe defaults on error
    return {
      crowd_density: 'low',
      estimated_people: 0,
      risk_level: 'none',
      detected_behaviors: [],
      confidence: 0.0
    };
  }
}

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // In production, download the audio file and transcribe
    const response = await openai.audio.transcriptions.create({
      file: await fetch(audioUrl).then(r => r.blob()) as any,
      model: "whisper-1",
      language: "hi" // Hindi as primary language for Mahakumbh
    });

    return response.text;
  } catch (error) {
    console.error("Audio transcription error:", error);
    return "Transcription failed";
  }
}

export async function generateAlertText(zone: string, alertType: string): Promise<{
  hindi: string;
  english: string;
  marathi: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Generate calm, respectful emergency instructions for Hindu pilgrims at Mahakumbh. Create appropriate text for loudspeaker announcements under 20 seconds. Return JSON with 'hindi', 'english', and 'marathi' fields."
        },
        {
          role: "user",
          content: `Generate emergency alert for ${alertType} in ${zone}. Make it calming and respectful for devotees. Include proper spiritual context.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      hindi: result.hindi || 'कृपया शांति से आगे बढ़ें।',
      english: result.english || 'Please move calmly and follow instructions.',
      marathi: result.marathi || 'कृपया शांततेत पुढे जा.'
    };
  } catch (error) {
    console.error("Alert generation error:", error);
    return {
      hindi: 'कृपया शांति से आगे बढ़ें।',
      english: 'Please move calmly and follow instructions.',
      marathi: 'कृपया शांततेत पुढे जा.'
    };
  }
}

export async function normalizeReport(text: string, mediaUrl?: string, lat?: number, lng?: number): Promise<{
  type: string;
  summary: string;
  severity: string;
  recommended_action: string;
  lang: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Extract structured information from pilgrim reports. Return JSON with type (panic|congestion|medical|lost_person|hazard), summary (one sentence), severity (low|medium|high), recommended_action (short instruction), and lang (detected language code)."
        },
        {
          role: "user",
          content: `Text: ${text}\nMedia: ${mediaUrl || 'none'}\nLocation: ${lat},${lng}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      type: result.type || 'congestion',
      summary: result.summary || text.substring(0, 100),
      severity: result.severity || 'medium',
      recommended_action: result.recommended_action || 'Investigate and respond',
      lang: result.lang || 'hi'
    };
  } catch (error) {
    console.error("Report normalization error:", error);
    return {
      type: 'congestion',
      summary: text.substring(0, 100),
      severity: 'medium',
      recommended_action: 'Investigate and respond',
      lang: 'hi'
    };
  }
}
