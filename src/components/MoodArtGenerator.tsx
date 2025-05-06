import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Loader2, Download, Share2, Sparkles, BookOpen } from "lucide-react";
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
  const [moodReflection, setMoodReflection] = useState<string>("");
  const [isLoadingReflection, setIsLoadingReflection] = useState<boolean>(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

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

  const handleGenerateReflection = async () => {
    if (!mood) {
      setReflectionError("No mood selected");
      return;
    }

    setIsLoadingReflection(true);
    setReflectionError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('supabase-functions-generate-mood-reflection', {
        body: { mood }
      });

      if (error) throw new Error(error.message);
      
      if (data.error) {
        setReflectionError(data.error);
      } else {
        setMoodReflection(data.reflection);
      }
    } catch (err) {
      setReflectionError(err instanceof Error ? err.message : "Failed to generate mood reflection");
    } finally {
      setIsLoadingReflection(false);
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
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Input Section */}
      <Card className="p-6 backdrop-blur-md bg-white/90 border border-amber-400/50 shadow-xl rounded-xl overflow-hidden">
        <div className="space-y-6">
          <div>
            <Label htmlFor="mood" className="text-xl font-semibold text-amber-950">
              How are you feeling today?
            </Label>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={selectedMood === option ? "default" : "outline"}
                  onClick={() => {
                    setSelectedMood(option);
                    setCustomMood("");
                  }}
                  className={`rounded-full ${
                    selectedMood === option 
                      ? "bg-gradient-to-r from-amber-700 to-orange-800 text-white font-bold border-0 shadow-md" 
                      : "bg-amber-100 text-amber-950 border border-amber-500 hover:bg-amber-200"
                  }`}
                >
                  {option}
                </Button>
              ))}
              <Button
                type="button"
                variant={selectedMood === "custom" ? "default" : "outline"}
                onClick={() => setSelectedMood("custom")}
                className={`rounded-full ${
                  selectedMood === "custom" 
                    ? "bg-gradient-to-r from-amber-700 to-orange-800 text-white font-bold border-0 shadow-md" 
                    : "bg-amber-100 text-amber-950 border border-amber-500 hover:bg-amber-200"
                }`}
              >
                Custom
              </Button>
            </div>

            {selectedMood === "custom" && (
              <div className="mt-4">
                <Input
                  id="customMood"
                  placeholder="Describe your mood..."
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  className="w-full bg-amber-50 border-amber-400 text-amber-950 placeholder:text-amber-500 focus:ring-amber-600 focus:border-amber-600"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="details" className="text-xl font-semibold text-amber-950">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Add context or specific elements you'd like to see..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="mt-2 w-full bg-amber-50 border-amber-400 text-amber-950 placeholder:text-amber-500 focus:ring-amber-600 focus:border-amber-600"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-500 text-red-900 rounded-md font-medium">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerateArt}
            disabled={isLoading || !mood}
            className="w-full bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-800 hover:to-orange-900 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-6 w-6" />
                Generate Mood Art
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section - Rearranged to show text before image */}
      {(artDescription || imageUrl) && (
        <Card className="p-6 backdrop-blur-md bg-white/90 border border-amber-400/50 shadow-xl rounded-xl overflow-hidden">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-amber-950">
                Your Mood Art
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(artDescription)}
                  title="Copy description to clipboard"
                  className="bg-amber-100 text-amber-950 border border-amber-500 hover:bg-amber-200"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share"
                  className="bg-amber-100 text-amber-950 border border-amber-500 hover:bg-amber-200"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Text description now comes before the image */}
            {artDescription && (
              <div className="bg-amber-50 p-5 rounded-md border border-amber-400 shadow-inner">
                <p className="whitespace-pre-wrap text-amber-950 leading-relaxed">
                  {artDescription}
                </p>
              </div>
            )}
            
            {!imageUrl && artDescription && (
              <p className="text-sm text-amber-800 italic mt-3 font-medium">
                Use this description with your favorite image generation tool to create your artwork.
              </p>
            )}
            
            {/* Image now comes after the text */}
            {imageUrl && (
              <div className="flex justify-center mt-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <img 
                    src={imageUrl} 
                    alt={`Art representing ${mood}`} 
                    className="relative rounded-lg shadow-md max-h-96 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Mood Reflection Section */}
            {(artDescription || imageUrl) && !moodReflection && !isLoadingReflection && (
              <div className="mt-8 flex flex-col items-center">
                <p className="text-amber-900 text-center mb-4">
                  Would you like a personal reflection based on your mood?
                </p>
                <Button
                  onClick={handleGenerateReflection}
                  className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white py-2 px-6 rounded-full font-medium shadow-md transition-all duration-300 flex items-center"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Get Mood Reflection
                </Button>
              </div>
            )}

            {isLoadingReflection && (
              <div className="mt-6 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
                <p className="text-amber-900 mt-2">Generating your reflection...</p>
              </div>
            )}

            {reflectionError && (
              <div className="p-4 bg-red-100 border border-red-500 text-red-900 rounded-md font-medium mt-6">
                {reflectionError}
              </div>
            )}

            {moodReflection && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-amber-950 mb-3">
                  Your Mood Reflection
                </h3>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-md border border-amber-400 shadow-inner">
                  <p className="whitespace-pre-wrap text-amber-950 leading-relaxed italic">
                    {moodReflection}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}