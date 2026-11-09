import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import JobsMarketplace from '@/components/jobs/JobsMarketplace';

export default function PublicJobs() {
  return <div className="min-h-screen bg-background"><SEO title="Freelance Jobs & Project Opportunities | FIVESOM" description="Explore approved buyer projects on FIVESOM. Find work in design, websites, video and writing, or post your own project to receive freelancer proposals." canonical="/jobs" /><Navbar /><main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6"><JobsMarketplace /></main><Footer /></div>;
}