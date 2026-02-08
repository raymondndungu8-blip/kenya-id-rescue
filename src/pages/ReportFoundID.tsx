import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Calendar, FileText, Phone, Mail, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IDPhotoUpload from "@/components/IDPhotoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { sanitizeError } from "@/lib/errorHandler";
import { getImageExtension } from "@/lib/imageValidator";

const formSchema = z.object({
  id_type: z.string().min(1, "Please select an ID type"),
  name_on_id: z.string().trim().regex(/^[a-zA-Z\s\-.']*$/, "Name contains invalid characters").max(100).optional().or(z.literal("")),
  id_number: z.string().trim().regex(/^[A-Za-z0-9\-*]*$/, "ID number must contain only letters, numbers, or dashes").max(50).optional().or(z.literal("")),
  location_found: z.string().trim().min(1, "Location is required").max(200),
  date_found: z.string().min(1, "Date is required"),
  description: z.string().trim().max(500).optional(),
  contact_phone: z.string().trim().regex(/^(\+?[0-9\s\-()]{7,20})?$/, "Invalid phone number format").max(20).optional().or(z.literal("")),
  contact_email: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const ID_TYPES = ["National ID", "Driver's License", "Passport", "Student ID", "Work ID", "Other"];

const ReportFoundID = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Front photo state
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [frontScanning, setFrontScanning] = useState(false);
  const [frontScanned, setFrontScanned] = useState(false);

  // Back photo state
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [backScanning, setBackScanning] = useState(false);
  const [backScanned, setBackScanned] = useState(false);

  // AI extracted data
  const [aiData, setAiData] = useState<Record<string, unknown>>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_type: "",
      name_on_id: "",
      id_number: "",
      location_found: "",
      date_found: new Date().toISOString().split("T")[0],
      description: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  const scanPhoto = async (file: File, side: "front" | "back") => {
    const setScanningState = side === "front" ? setFrontScanning : setBackScanning;
    const setScannedState = side === "front" ? setFrontScanned : setBackScanned;

    setScanningState(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-id`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64, side }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "AI scanning failed");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setAiData((prev) => ({ ...prev, [side]: result.data }));

        // Auto-fill form fields from front scan
        if (side === "front" && result.data) {
          const d = result.data;
          if (d.full_name && !form.getValues("name_on_id")) {
            form.setValue("name_on_id", d.full_name);
          }
          if (d.id_number && !form.getValues("id_number")) {
            form.setValue("id_number", d.id_number);
          }
          if (d.id_type && !form.getValues("id_type")) {
            const matchedType = ID_TYPES.find(
              (t) => t.toLowerCase() === d.id_type?.toLowerCase()
            );
            if (matchedType) form.setValue("id_type", matchedType);
          }
          toast.success("AI extracted information from the front of the ID!");
        } else if (side === "back") {
          toast.success("AI extracted information from the back of the ID!");
        }

        setScannedState(true);
      }
    } catch (error: unknown) {
      console.error("Scan error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to scan ID. You can still fill in details manually."
      );
    } finally {
      setScanningState(false);
    }
  };

  const handleFrontPhotoSelected = (file: File, preview: string) => {
    setFrontFile(file);
    setFrontPreview(preview);
    setFrontScanned(false);
    scanPhoto(file, "front");
  };

  const handleBackPhotoSelected = (file: File, preview: string) => {
    setBackFile(file);
    setBackPreview(preview);
    setBackScanned(false);
    scanPhoto(file, "back");
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      let frontPath = null;
      let backPath = null;

      // Upload front photo
      if (frontFile) {
        const fileExt = getImageExtension(frontFile.type);
        const fileName = `test-user/${Date.now()}-front.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("id-photos").upload(fileName, frontFile);
        if (uploadError) throw uploadError;
        frontPath = fileName;
      }

      // Upload back photo
      if (backFile) {
        const fileExt = getImageExtension(backFile.type);
        const fileName = `test-user/${Date.now()}-back.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("id-photos").upload(fileName, backFile);
        if (uploadError) throw uploadError;
        backPath = fileName;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData: any = {
        reporter_id: null,
        id_type: data.id_type,
        name_on_id: data.name_on_id || null,
        id_number: data.id_number || null,
        location_found: data.location_found,
        date_found: data.date_found,
        description: data.description || null,
        photo_url: frontPath,
        photo_front_url: frontPath,
        photo_back_url: backPath,
        ai_extracted_data: Object.keys(aiData).length > 0 ? aiData : null,
        contact_phone: data.contact_phone || null,
        contact_email: data.contact_email || null,
      };
      const { error } = await supabase.from("found_ids").insert(insertData);

      if (error) throw error;

      toast.success("Found ID reported successfully! Thank you for helping.");
      navigate("/");
    } catch (error: unknown) {
      console.error("Submit error details:", error);
      const message = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'message' in error 
          ? String((error as { message: unknown }).message) 
          : sanitizeError(error);
      toast.error(message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Report a Found ID
            </h1>
            <p className="text-muted-foreground">
              Help reunite someone with their lost ID by providing details below
            </p>
          </div>

          {/* AI Scanning Info */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">AI-Powered ID Scanning</p>
              <p className="text-muted-foreground">
                Upload front and back photos of the ID. Our AI will automatically extract 
                information and store facial data for secure owner verification.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Photo Uploads - Front & Back */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    ID Photos (AI will scan automatically)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <IDPhotoUpload
                      side="front"
                      photoPreview={frontPreview}
                      isScanning={frontScanning}
                      scanComplete={frontScanned}
                      onPhotoSelected={handleFrontPhotoSelected}
                      onPhotoRemoved={() => {
                        setFrontFile(null);
                        setFrontPreview(null);
                        setFrontScanned(false);
                        setAiData((prev) => { const n = { ...prev }; delete n.front; return n; });
                      }}
                    />
                    <IDPhotoUpload
                      side="back"
                      photoPreview={backPreview}
                      isScanning={backScanning}
                      scanComplete={backScanned}
                      onPhotoSelected={handleBackPhotoSelected}
                      onPhotoRemoved={() => {
                        setBackFile(null);
                        setBackPreview(null);
                        setBackScanned(false);
                        setAiData((prev) => { const n = { ...prev }; delete n.back; return n; });
                      }}
                    />
                  </div>
                </div>

                {/* ID Type */}
                <FormField
                  control={form.control}
                  name="id_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of ID *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ID_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name on ID */}
                <FormField
                  control={form.control}
                  name="name_on_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on ID (if visible)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID Number */}
                <FormField
                  control={form.control}
                  name="id_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number (partial or full)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 12345***" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Found */}
                <FormField
                  control={form.control}
                  name="location_found"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location Found *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CBD, Nairobi near Kencom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Found */}
                <FormField
                  control={form.control}
                  name="date_found"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Found *
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Additional Details
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other details that might help identify the owner..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Info */}
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Your Contact Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+254..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting || frontScanning || backScanning}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportFoundID;
