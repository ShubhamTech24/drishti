import OpenAI from "openai";
import { spawn } from "child_process";

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
      max_completion_tokens: 300
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

export async function compareFaces(uploadedImageBuffer: Buffer, databaseImageUrl: string): Promise<{
  isMatch: boolean;
  confidence: number;
  similarity: number;
}> {
  try {
    // Convert buffer to base64 for OpenAI
    const base64Image = uploadedImageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert face recognition system. Compare two face images and return EXACTLY a JSON object with isMatch (boolean), confidence (0-1 float), and similarity (0-100 integer percentage). Focus on facial features, bone structure, eyes, nose, mouth shape. Return only valid JSON, no extra text."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Compare these two face images. Are they the same person? First image is uploaded search photo, second is from database."
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            },
            {
              type: "image_url",
              image_url: { url: databaseImageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isMatch: result.isMatch || false,
      confidence: result.confidence || 0.0,
      similarity: result.similarity || 0
    };
  } catch (error) {
    console.error("Face comparison error:", error);
    return {
      isMatch: false,
      confidence: 0.0,
      similarity: 0
    };
  }
}

export async function analyzeIncidentFromText(description: string, mediaUrl?: string): Promise<{
  category: string;
  severity: string;
  urgency: string;
  recommendedResponse: string;
  estimatedPeople: number;
}> {
  try {
    const messages: any[] = [
      {
        role: "system",
        content: "You are an expert emergency response coordinator for religious gatherings. Analyze incident reports and return EXACTLY a JSON object with category (medical|crowd_control|lost_person|stampede|fire|structural|security), severity (low|medium|high|critical), urgency (low|medium|high|immediate), recommendedResponse (brief action), and estimatedPeople (integer affected). Return only valid JSON."
      },
      {
        role: "user",
        content: `Incident description: ${description}`
      }
    ];

    if (mediaUrl) {
      messages[1].content = [
        { type: "text", text: `Incident description: ${description}` },
        { type: "image_url", image_url: { url: mediaUrl } }
      ];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      response_format: { type: "json_object" },
      max_completion_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      category: result.category || 'crowd_control',
      severity: result.severity || 'medium',
      urgency: result.urgency || 'medium',
      recommendedResponse: result.recommendedResponse || 'Deploy response team',
      estimatedPeople: result.estimatedPeople || 1
    };
  } catch (error) {
    console.error("Incident analysis error:", error);
    return {
      category: 'crowd_control',
      severity: 'medium',
      urgency: 'medium',
      recommendedResponse: 'Deploy response team',
      estimatedPeople: 1
    };
  }
}

// AI-powered face matching for lost person search
export async function findMatchingPerson(searchImageUrl: string, lostPersonData: any[]): Promise<{
  matches: any[];
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in facial recognition and person identification. Analyze the provided search image and compare it with lost person records. Look for facial features, clothing, age, gender, and any distinctive characteristics. Return a JSON object with potential matches and confidence scores."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image to find potential matches with missing persons. Here are the registered lost persons: ${JSON.stringify(lostPersonData, null, 2)}. Return matches with confidence scores and reasoning.`
            },
            {
              type: "image_url",
              image_url: {
                url: searchImageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      matches: result.matches || [],
      confidence: result.overall_confidence || 0
    };
  } catch (error) {
    console.error("Face matching error:", error);
    return {
      matches: [],
      confidence: 0
    };
  }
}

// Analyze uploaded image/video for person detection
export async function analyzeSearchMedia(mediaUrl: string, mediaType: 'image' | 'video'): Promise<{
  detectedPersons: any[];
  description: string;
  extractedFeatures: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are analyzing ${mediaType} content to help find missing persons. Extract detailed information about people visible in the ${mediaType}. Focus on physical characteristics, clothing, age estimates, and any unique identifiers. Return JSON with detected persons array and description.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${mediaType} for person detection. Extract all visible people with detailed descriptions including physical features, clothing, estimated age, gender, and any distinguishing characteristics.`
            },
            {
              type: "image_url",
              image_url: {
                url: mediaUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      detectedPersons: result.detected_persons || [],
      description: result.description || '',
      extractedFeatures: result.extracted_features || []
    };
  } catch (error) {
    console.error("Media analysis error:", error);
    return {
      detectedPersons: [],
      description: 'Analysis failed',
      extractedFeatures: []
    };
  }
}

// Two-step search: Compare target person image with uploaded search media
export async function searchPersonInMedia(searchMediaUrl: string, targetPersonUrl: string, mediaType: 'image' | 'video'): Promise<{
  found: boolean;
  confidence: number;
  location: string;
  description: string;
  matchDetails: any;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert in person identification and search. Compare the target person with people in the search ${mediaType}. Look for facial features, clothing, posture, and any distinctive characteristics. Return JSON with detailed analysis of whether the person is found and where.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Search for the target person in this ${mediaType}. First analyze the target person image, then search for them in the search ${mediaType}. Return JSON with: found (boolean), confidence (0-100), location (description of where in image/video), description (detailed explanation), and matchDetails (specific matching features).`
            },
            {
              type: "image_url",
              image_url: {
                url: targetPersonUrl,
                detail: "high"
              }
            },
            {
              type: "image_url", 
              image_url: {
                url: searchMediaUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      found: result.found || false,
      confidence: result.confidence || 0,
      location: result.location || '',
      description: result.description || '',
      matchDetails: result.matchDetails || {}
    };
  } catch (error) {
    console.error("Person search in media error:", error);
    return {
      found: false,
      confidence: 0,
      location: '',
      description: 'Search analysis failed',
      matchDetails: {}
    };
  }
}
