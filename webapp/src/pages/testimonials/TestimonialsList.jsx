import { useQuery } from "@tanstack/react-query";
import { publicAPI } from "@/api/publicApi";
import HeroSection from "@/components/common/HeroSection";
import PageHeader from "@/components/common/PageHeader";

import { ErrorState } from "@/components/common/LoadingStates";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "@phosphor-icons/react";

const TestimonialsList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: () => publicAPI.getTestimonials().then((r) => r.data),
  });

  const testimonials = data?.testimonials || [];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <HeroSection
        badge="Success Stories"
        title="What Our Clients Say"
        description="Hear from businesses we've helped transform their digital presence."
      />

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load testimonials"
            message="Unable to fetch testimonials. Please try again."
          />
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No testimonials available yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Testimonials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {testimonials.map((testimonial) => (
                <Card key={testimonial._id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating || 5 }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            size={16}
                            weight="fill"
                            className="text-yellow-400"
                          />
                        )
                      )}
                    </div>

                    {/* Quote */}
                    <p className="text-muted-foreground italic mb-6 line-clamp-4">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 border-t pt-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={testimonial.clientAvatar?.url} />
                        <AvatarFallback>
                          {testimonial.clientName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {testimonial.clientName}
                        </p>
                        {testimonial.designation && (
                          <p className="text-xs text-muted-foreground">
                            {testimonial.designation}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Testimonials */}
            <div className="space-y-6">
              <PageHeader
                title="Detailed Testimonials"
                description="Read full testimonials from our clients"
                className="mb-8 text-center"
              />
              {testimonials.map((testimonial) => (
                <Card key={`full-${testimonial._id}`} className="hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 shrink-0">
                        <AvatarImage src={testimonial.clientAvatar?.url} />
                        <AvatarFallback>
                          {testimonial.clientName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">
                              {testimonial.clientName}
                            </p>
                            {testimonial.designation && (
                              <p className="text-sm text-muted-foreground">
                                {testimonial.designation}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: testimonial.rating || 5 }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  weight="fill"
                                  className="text-yellow-400"
                                />
                              )
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic">
                          "{testimonial.quote}"
                        </p>
                        {testimonial.details && (
                          <p className="text-sm text-muted-foreground mt-3">
                            {testimonial.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        </div>
      </section>
    </div>
  );
};

export default TestimonialsList;
