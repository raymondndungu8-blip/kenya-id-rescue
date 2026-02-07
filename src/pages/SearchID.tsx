import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, MapPin, Calendar, CreditCard, Loader2, Shield, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SelfieCapture from "@/components/SelfieCapture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeError } from "@/lib/errorHandler";

// Validation schema for search
const searchSchema = z.object({
  name: z.string().trim().max(100).optional().or(z.literal("")),
  id_number: z.string()
    .trim()
    .regex(/^[A-Za-z0-9\-]*$/, "ID number must contain only letters, numbers, or dashes")
    .max(50)
    .optional()
    .or(z.literal("")),
  id_type: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
}).refine(
  (data) => data.name || data.id_number || data.id_type || data.location,
  { message: "Please enter at least one search criteria" }
);

type SearchData = z.infer<typeof searchSchema>;

interface SearchResult {
  id: string;
  id_type: string;
  name_on_id_masked: string | null;
  id_number_masked: string | null;
  location_found: string;
  date_found: string;
}

const ID_TYPES = [
  "National ID",
  "Driver's License",
  "Passport",
  "Student ID",
  "Work ID",
  "Other",
];

const SearchID = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [verificationAnswer, setVerificationAnswer] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [faceMatchResult, setFaceMatchResult] = useState<{
    match_confidence: number;
    match_level: string;
    reasoning: string;
  } | null>(null);
  const [isMatchingFace, setIsMatchingFace] = useState(false);

  const form = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      name: "",
      id_number: "",
      id_type: "",
      location: "",
    },
  });

  const onSearch = async (data: SearchData) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data: searchResults, error } = await supabase.rpc('search_found_ids', {
        search_name: data.name || null,
        search_id_number: data.id_number || null,
        search_id_type: data.id_type || null,
        search_location: data.location || null,
      });

      if (error) throw error;

      setResults(searchResults || []);
      
      if (!searchResults || searchResults.length === 0) {
        toast.info("No matching IDs found. Try different search criteria.");
      }
    } catch (error: unknown) {
      const errorMessage = sanitizeError(error);
      if (errorMessage.includes("At least one search parameter")) {
        toast.error("Please enter at least one search criteria");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestDetails = (result: SearchResult) => {
    setSelectedResult(result);
    setVerificationAnswer("");
    setSelfieBase64(null);
    setFaceMatchResult(null);
    setIsRequestDialogOpen(true);
  };

  const handleSelfieCaptured = async (base64: string) => {
    if (!selectedResult) return;
    setSelfieBase64(base64);
    setIsMatchingFace(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/match-face`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            selfieBase64: base64,
            foundIdId: selectedResult.id,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (errData.match_possible === false) {
          toast.info("No ID photo available for face matching. Please verify with credentials only.");
          return;
        }
        throw new Error(errData.error || "Face matching failed");
      }

      const data = await response.json();
      if (data.success && data.result) {
        setFaceMatchResult(data.result);

        if (data.result.match_level === "high") {
          toast.success(`Face match confidence: ${data.result.match_confidence}%! High match detected.`);
        } else if (data.result.match_level === "medium") {
          toast.info(`Face match confidence: ${data.result.match_confidence}%. Please also provide credentials.`);
        } else {
          toast.warning(`Low face match (${data.result.match_confidence}%). Please provide your credentials for verification.`);
        }
      }
    } catch (error: unknown) {
      console.error("Face match error:", error);
      toast.error(error instanceof Error ? error.message : "Face matching failed. You can still verify with credentials.");
    } finally {
      setIsMatchingFace(false);
    }
  };

  const submitVerificationRequest = async () => {
    if (!selectedResult || !verificationAnswer.trim()) {
      toast.error("Please provide verification information");
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const { data, error } = await supabase.rpc('request_id_details', {
        found_id: selectedResult.id,
        verification_answer: verificationAnswer.trim(),
      });

      if (error) throw error;

      // Send email notification to the reporter (fire and forget)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-verification-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ found_id: selectedResult.id }),
        }).catch((err) => console.error('Email notification error:', err));
      }

      toast.success("Verification request submitted! The finder will review your request.");
      setIsRequestDialogOpen(false);
      setSelectedResult(null);
      setVerificationAnswer("");
    } catch (error: unknown) {
      toast.error(sanitizeError(error));
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Search for Your Lost ID
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your ID details to search for matches. For privacy, results show 
              partial information only. You can request full details after verification.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Privacy Protected Search</p>
              <p className="text-muted-foreground">
                Search results show masked information to protect everyone's privacy. 
                Request verification to access full details.
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="glass-card p-6 md:p-8 rounded-2xl mb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSearch)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number (partial or full)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12345 or last 4 digits" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of ID</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Any type</SelectItem>
                            {ID_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location Found
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nairobi CBD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full md:w-auto"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {results.length > 0 
                  ? `Found ${results.length} matching ID${results.length !== 1 ? 's' : ''}`
                  : 'No Results Found'
                }
              </h2>

              {results.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No IDs match your search criteria.</p>
                    <p className="mt-2">Try different search terms or check back later.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {results.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            {result.id_type}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRequestDetails(result)}
                          >
                            Request Details
                          </Button>
                        </div>
                        <CardDescription>
                          Found on {new Date(result.date_found).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {result.name_on_id_masked && (
                            <div>
                              <span className="text-muted-foreground">Name: </span>
                              <span className="font-medium">{result.name_on_id_masked}</span>
                            </div>
                          )}
                          {result.id_number_masked && (
                            <div>
                              <span className="text-muted-foreground">ID #: </span>
                              <span className="font-medium">{result.id_number_masked}</span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Location:
                            </span>
                            <span className="font-medium ml-1">{result.location_found}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Verification Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              Take a selfie for AI face matching and provide your credentials to verify ownership.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            {/* Step 1: Selfie Face Match */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
                Face Verification (AI Scan)
              </h4>
              <SelfieCapture
                onSelfieCaptured={handleSelfieCaptured}
                isProcessing={isMatchingFace}
              />

              {/* Face match result */}
              {faceMatchResult && (
                <div className={`p-3 rounded-lg text-sm border ${
                  faceMatchResult.match_level === "high"
                    ? "bg-secondary/10 border-secondary/30 text-secondary"
                    : faceMatchResult.match_level === "medium"
                    ? "bg-accent/10 border-accent/30 text-accent-foreground"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}>
                  <p className="font-medium">
                    Face Match: {faceMatchResult.match_confidence}% ({faceMatchResult.match_level})
                  </p>
                  <p className="text-xs mt-1 opacity-80">{faceMatchResult.reasoning}</p>
                </div>
              )}
            </div>

            {/* Step 2: Credentials */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
                Provide Your Credentials
              </h4>
              <p className="text-xs text-muted-foreground">
                Enter your full name, complete ID number, date of birth, or other identifying information.
              </p>
              <Input
                placeholder="Enter your full name and ID number..."
                value={verificationAnswer}
                onChange={(e) => setVerificationAnswer(e.target.value)}
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium">What happens next?</p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>AI face match results are included with your request</li>
                <li>The finder will review your request and credentials</li>
                <li>If approved, you'll get access to full details for pickup</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsRequestDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="hero"
                onClick={submitVerificationRequest}
                disabled={isSubmittingRequest || !verificationAnswer.trim() || isMatchingFace}
              >
                {isSubmittingRequest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchID;
