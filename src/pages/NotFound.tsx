import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Compass, Home, LifeBuoy, BookOpen, Search } from "lucide-react";
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

/**
 * Fallback page for genuinely invalid URLs only.
 * Valid application routes are handled by the router and the hosting SPA
 * fallback (see public/_redirects), so this page must never appear for them.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: no route matched", location.pathname);
  }, [location.pathname]);

  const suggestions = [
    { to: "/explore", icon: Search, title: "Explore services", text: "Browse every live gig on FIVESOM." },
    { to: "/services", icon: Compass, title: "Service categories", text: "Find the category you need." },
    { to: "/docs", icon: BookOpen, title: "Documentation", text: "Guides in English, Somali, Arabic and French." },
    { to: "/support/help-center", icon: LifeBuoy, title: "Help Center", text: "Answers and support options." },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <Helmet>
        <title>Page not found — FIVESOM</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="w-full max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">This page doesn’t exist</h1>
        <p className="mt-3 text-muted-foreground">
          The address <span className="font-mono text-foreground/80 break-all">{location.pathname}</span> could not be
          found. It may have been moved, or the link you followed is out of date.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to homepage
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/support/contact">Contact support</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 text-left">
          {suggestions.map(({ to, icon: Icon, title, text }) => (
            <Link
              key={to}
              to={to}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Icon className="h-4 w-4 text-primary" />
                {title}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
