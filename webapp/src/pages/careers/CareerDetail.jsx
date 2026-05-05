import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, MapPin, Briefcase, Clock, Users } from "@phosphor-icons/react";
import { publicAPI } from "@/api/publicApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroSection from "@/components/common/HeroSection";
import Tags from "@/components/common/Tags";
import RichTextContent from "@/components/common/RichTextContent";

import { ErrorState, NotFoundState } from "@/components/common/LoadingStates";
import { toast } from "sonner";

const CareerDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["job", slug],
    queryFn: () => publicAPI.getJob(slug).then((r) => r.data.job),
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );

  if (isError)
    return (
      <ErrorState
        title="Failed to load job"
        message="The job posting could not be loaded."
      />
    );

  if (!job)
    return (
      <NotFoundState
        title="Job not found"
        message="The job you're looking for doesn't exist or has been removed."
      />
    );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge={job.department}
        title={job.title}
        description={job.location}
        contentClassName="max-w-none"
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

      {/* Content */}
      <section className="section-padding">
        <div className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <RichTextContent html={job.description} />
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Key Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0"></span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nice to Have */}
            {job.niceToHave && job.niceToHave.length > 0 && (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold mb-3">Nice to Have</h3>
                <ul className="space-y-2">
                  {job.niceToHave.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-blue-900">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Benefits</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {job.benefits.map((benefit, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium">{benefit}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {job.perks && job.perks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Perks</h2>
                <div className="space-y-2">
                  {job.perks.map((perk, idx) => (
                    <p
                      key={idx}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {perk}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Department
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {job.department}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Type
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {job.type.replace(/_/g, " ")}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Location
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin size={14} />
                    {job.location}
                    {job.isRemote && " (Remote)"}
                  </p>
                </div>

                <Separator />

                {job.experience?.level && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Experience Level
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {job.experience.level}
                      </Badge>
                    </div>
                    <Separator />
                  </>
                )}

                {job.salary?.isVisible && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Salary
                      </p>
                      <p className="text-sm font-medium">
                        {job.salary.min && `${job.salary.currency} ${job.salary.min}`}
                        {job.salary.max && ` - ${job.salary.max}`}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Openings
                  </p>
                  <p className="text-sm">{job.openings} position(s)</p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      job.status === "active" ? "bg-green-50 text-green-700" : ""
                    }`}
                  >
                    {job.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tags tags={job.skills} />
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-linear-to-br from-brand-50 to-purple-50 border-brand-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">Ready to apply?</p>
                <Link to={`/careers/${job._id}/apply`}>
                  <Button className="w-full gap-2">
                    Apply Now <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {job.applicationDeadline && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-900 mb-1">
                  Application Deadline
                </p>
                <p className="text-sm font-semibold text-yellow-900">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

export default CareerDetail;
