export interface MoodReflectionRequest {
  mood: string;
}

export interface MoodReflectionResponse {
  reflection: string;
  error?: string;
}