import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Loader2, Download, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const MOOD_OPTIONS = [
  "Happy", "Sad", "Excited", "Calm", "Anxious", 
  "Peaceful", "Energetic", "Melancholic", "Hopeful", 
  "Nostalgic", "Inspired", "Confused", "Grateful"
];

export default function MoodArtGenerator() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [customMood, setCustomMood] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [artDescription, setArtDescription] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mood = selectedMood === "custom" ? customMood : selectedMood;

  const handleGenerateArt = async () => {
    if (!mood) {
      setError("Please select or enter a mood");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('supabase-functions-generate-mood-art', {
        body: { 
          mood,
          additionalDetails: additionalDetails.trim() || undefined
        }
      });

      if (error) throw new Error(error.message);
      
      if (data.error) {
        setError(data.error);
      } else {
        setArtDescription(data.artDescription);
        setGeneratedContent(data.generatedContent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate art description");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Art based on ${mood}`,
        text: artDescription,
      }).catch(err => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(artDescription)
        .then(() => alert("Description copied to clipboard!"))
        .catch(err => console.error("Error copying to clipboard:", err));
    }
  };

  // Extract image from generatedContent if available
  const getImageFromContent = () => {
    if (!generatedContent) return null;
    
    // Try to find image in the content parts
    const parts = generatedContent.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  };

  const imageUrl = getImageFromContent();

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Mood to Art
        </h1>
        <p className="text-lg text-gray-600">
          Transform your emotions into unique artwork
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-white to-purple-50 shadow-lg">
        <div className="space-y-6">
          <div>
            <Label htmlFor="mood" className="text-lg font-medium">
              How are you feeling today?
            </Label>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={selectedMood === option ? "default" : "outline"}
                  onClick={() => {
                    setSelectedMood(option);
                    setCustomMood("");
                  }}
                  className="rounded-full"
                >
                  {option}
                </Button>
              ))}
              <Button
                type="button"
                variant={selectedMood === "custom" ? "default" : "outline"}
                onClick={() => setSelectedMood("custom")}
                className="rounded-full"
              >
                Custom
              </Button>
            </div>

            {selectedMood === "custom" && (
              <div className="mt-3">
                <Input
                  id="customMood"
                  placeholder="Describe your mood..."
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="details" className="text-lg font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Add context or specific elements you'd like to see..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="mt-2 w-full"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerateArt}
            disabled={isLoading || !mood}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Mood Art"
            )}
          </Button>
        </div>
      </Card>

      {(artDescription || imageUrl) && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Mood Art
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(artDescription)}
                  title="Copy description to clipboard"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {imageUrl && (
              <div className="flex justify-center">
                <img 
                  src={imageUrl} 
                  alt={`Art representing ${mood}`} 
                  className="rounded-lg shadow-md max-h-96 object-contain"
                />
              </div>
            )}
            
            {artDescription && (
              <div className="bg-white p-4 rounded-md border border-gray-200 shadow-inner">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {artDescription}
                </p>
              </div>
            )}
            
            {!imageUrl && artDescription && (
              <p className="text-sm text-gray-500 italic">
                Use this description with your favorite image generation tool to create your artwork.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}