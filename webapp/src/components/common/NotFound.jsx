import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NotFound = () => (
    <div className="bg-background">
        <section className="min-h-[70vh] flex items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-950 via-brand-950 to-purple-950 text-white">
            <div className="absolute inset-0 bg-dots opacity-30" />
            <div className="container mx-auto text-center py-24 relative">
                <Badge className="mb-4 bg-white/10 text-white border-white/20">404</Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">Page not found</h1>
                <p className="text-white/70 max-w-xl mx-auto mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/">
                        <Button size="lg" variant="gradient">
                            Back to home <ArrowRight size={16} />
                        </Button>
                    </Link>
                    <Link to="/contact">
                        <Button size="lg" variant="glass">Contact us</Button>
                    </Link>
                </div>
            </div>
        </section>
    </div>
);

export default NotFound;
