import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";

// Pages
import Home from "@/pages/home/Home";
import ServicesList from "@/pages/services/ServicesList";
import ServiceDetail from "@/pages/services/ServiceDetail";
import PortfolioList from "@/pages/portfolio/PortfolioList";
import PortfolioDetail from "@/pages/portfolio/PortfolioDetail";
import ProjectList from "@/pages/projects/ProjectList";
import CaseStudiesList from "@/pages/caseStudies/CaseStudiesList";
import CaseStudyDetail from "@/pages/caseStudies/CaseStudyDetail";
import BlogList from "@/pages/blog/BlogList";
import BlogDetail from "@/pages/blog/BlogDetail";
import ArticleList from "@/pages/articles/ArticleList";
import ArticleDetail from "@/pages/articles/ArticleDetail";
import ResourcesList from "@/pages/resources/ResourcesList";
import ResourceDetail from "@/pages/resources/ResourceDetail";
import TestimonialsList from "@/pages/testimonials/TestimonialsList";
import CareersList from "@/pages/careers/CareersList";
import CareerDetail from "@/pages/careers/CareerDetail";
import JobForm from "@/pages/careers/JobForm";
import Contact from "@/pages/contact/Contact";
import About from "@/pages/static/About";
import PrivacyPolicy from "@/pages/static/PrivacyPolicy";
import TermsOfService from "@/pages/static/TermsOfService";
import NotFound from "@/components/common/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />

          <Route path="/portfolio" element={<PortfolioList />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
          <Route path="/projects" element={<ProjectList />} />

          <Route path="/case-studies" element={<CaseStudiesList />} />
          <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />

          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />

          <Route path="/articles" element={<ArticleList />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />

          <Route path="/resources" element={<ResourcesList />} />
          <Route path="/resources/:slug" element={<ResourceDetail />} />

          <Route path="/testimonials" element={<TestimonialsList />} />

          <Route path="/careers" element={<CareersList />} />
          <Route path="/careers/:slug" element={<CareerDetail />} />
          <Route path="/careers/:id/apply" element={<JobForm />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;