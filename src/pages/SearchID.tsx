import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, MapPin, Calendar, CreditCard, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [verificationAnswer, setVerificationAnswer] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

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
    if (!user) {
      toast.error("Please sign in to request ID details");
      navigate("/auth");
      return;
    }
    setSelectedResult(result);
    setVerificationAnswer("");
    setIsRequestDialogOpen(true);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request ID Details</DialogTitle>
            <DialogDescription>
              To verify you're the rightful owner, please provide additional information 
              that only the owner would know.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Verification Information
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Provide details like your full name, complete ID number, date of birth, 
                or other identifying information that appears on your ID.
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
                <li>The finder will review your request</li>
                <li>If approved, you'll get access to full details</li>
                <li>Contact information will be shared for pickup</li>
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
                disabled={isSubmittingRequest || !verificationAnswer.trim()}
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
