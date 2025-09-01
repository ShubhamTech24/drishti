export interface CrowdAnalysis {
  crowd_density: 'none' | 'low' | 'medium' | 'high' | 'critical';
  estimated_people: number;
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  detected_behaviors: string[];
  confidence: number;
}

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  currentDensity: 'low' | 'medium' | 'high' | 'critical';
  estimatedCount: number;
}

export interface CameraSource {
  id: string;
  sourceId: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastSnapshot?: string;
}

export interface AlertPayload {
  zone: string;
  alertType: string;
  languages: string[];
  text: {
    hindi: string;
    english: string;
    marathi?: string;
    sanskrit?: string;
  };
}

export interface IncidentUpdate {
  eventId: string;
  status: string;
  assignedTo?: string;
  updatedBy?: string;
  timestamp: Date;
}
