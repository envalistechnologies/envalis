import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import HeroSection from "@/components/common/HeroSection";

import { Link } from "react-router-dom";

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [resume, setResume] = useState(null);

  const applyMutation = useMutation({
    mutationFn: async (formData) => {
      const fd = new FormData();
      fd.append("applicantName", formData.fullName);
      fd.append("applicantEmail", formData.email);
      fd.append("applicantPhone", formData.phone);
      fd.append("coverLetter", formData.coverLetter);
      if (resume) fd.append("resume", resume);
      return publicAPI.applyJob(id, fd);
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setTimeout(() => navigate("/careers"), 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit application");
    },
  });

  const onSubmit = (data) => {
    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }
    applyMutation.mutate(data);
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge="Apply Now"
        title="Job Application"
        description="Submit your application and join our team"
      />

      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Careers
          </Link>
        </div>
      </div>

      {/* Form Section */}
      <section className="section-padding">
        <div className="container">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    {...register("fullName", { required: "Name is required" })}
                    placeholder="Your full name"
                    className="rounded-lg"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    placeholder="your@email.com"
                    className="rounded-lg"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <Input
                    {...register("phone", { required: "Phone is required" })}
                    placeholder="+1 (555) 123-4567"
                    className="rounded-lg"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Resume */}
                <div>
                  <label className="block text-sm font-medium mb-2">Resume *</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      className="hidden"
                      id="resume-input"
                    />
                    <label htmlFor="resume-input" className="cursor-pointer">
                      <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {resume ? resume.name : "Click to upload resume"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, or DOCX (Max 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Cover Letter</label>
                  <Textarea
                    {...register("coverLetter")}
                    placeholder="Tell us why you're interested in this position..."
                    rows={6}
                    className="rounded-lg"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="flex-1"
                  >
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/careers")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        </div>
      </section>
    </div>
  );
};

export default JobForm;
