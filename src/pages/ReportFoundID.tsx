import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, MapPin, Calendar, FileText, Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

// Enhanced validation schema with format validation and whitespace normalization
const formSchema = z.object({
  id_type: z.string().min(1, "Please select an ID type"),
  name_on_id: z.string()
    .trim()
    .regex(/^[a-zA-Z\s\-.']*$/, "Name contains invalid characters")
    .max(100)
    .optional()
    .or(z.literal("")),
  id_number: z.string()
    .trim()
    .regex(/^[A-Za-z0-9\-*]*$/, "ID number must contain only letters, numbers, or dashes")
    .max(50)
    .optional()
    .or(z.literal("")),
  location_found: z.string().trim().min(1, "Location is required").max(200),
  date_found: z.string().min(1, "Date is required"),
  description: z.string().trim().max(500).optional(),
  contact_phone: z.string()
    .trim()
    .regex(/^(\+?[0-9\s\-()]{7,20})?$/, "Invalid phone number format")
    .max(20)
    .optional()
    .or(z.literal("")),
  contact_email: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const ID_TYPES = [
  "National ID",
  "Driver's License",
  "Passport",
  "Student ID",
  "Work ID",
  "Other",
];

const ReportFoundID = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Please sign in to report a found ID");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      let photoPath = null;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("id-photos")
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        // Store the file path, not a public URL (bucket is private)
        photoPath = fileName;
      }

      const { error } = await supabase.from("found_ids").insert({
        reporter_id: user.id,
        id_type: data.id_type,
        name_on_id: data.name_on_id || null,
        id_number: data.id_number || null,
        location_found: data.location_found,
        date_found: data.date_found,
        description: data.description || null,
        photo_url: photoPath,
        contact_phone: data.contact_phone || null,
        contact_email: data.contact_email || null,
      });

      if (error) throw error;

      toast.success("Found ID reported successfully! Thank you for helping.");
      navigate("/");
    } catch (error: unknown) {
      toast.error(sanitizeError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-display font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to report a found ID
            </p>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

          <div className="glass-card p-6 md:p-8 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ID Type */}
                <FormField
                  control={form.control}
                  name="id_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of ID *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                        <Textarea
                          placeholder="Any other details that might help identify the owner..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Photo of ID (optional)
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    {photoPreview ? (
                      <div className="space-y-4">
                        <img
                          src={photoPreview}
                          alt="ID preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                        >
                          Remove Photo
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload a photo (max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

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

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isSubmitting}
                >
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
