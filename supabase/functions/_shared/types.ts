export interface MoodArtRequest {
  mood: string;
  additionalDetails?: string;
}

export interface MoodArtResponse {
  artDescription: string;
  generatedContent?: any;
  error?: string;
}