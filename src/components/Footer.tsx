import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-new.png';
import { openCookiePreferences } from '@/lib/cookieConsent';

const linkClass =
  'text-sm transition-colors text-muted-foreground hover:text-foreground';

const CATEGORIES = [
  { name: 'Logo Design', slug: 'logo-design' },
  { name: 'Motion Graphics', slug: 'motion-graphics' },
  { name: 'Video Editing', slug: 'video-editing' },
  { name: 'Web Design', slug: 'web-design' },
  { name: 'Content Writing', slug: 'content-writing' },
  { name: 'Web Development', slug: 'web-development' },
];

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/30 px-4 pt-16 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />
      <div className="max-w-7xl mx-auto">
        {/* Brand + bio */}
        <div className="mb-12 max-w-md">
          <div className="mb-4 flex items-center space-x-3">
            <img
              src={isDarkMode ? logoLight : logoDark}
              alt="FIVESOM Logo"
              width="50"
              height="50"
              className="object-contain transition-opacity duration-300"
            />
            <span className="brand-wordmark text-xl font-bold">Fivesom</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Fivesom is an African-born, Somali-rooted freelance marketplace
            connecting talented freelancers with clients across Africa, Asia,
            Europe and beyond. Every order is protected by escrow, so buyers
            get the work they paid for and freelancers get paid for the work
            they deliver.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((item) => (
                <li key={item.slug}>
                  <Link to={`/services/${item.slug}`} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/explore" className={linkClass}>
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/freelancers/africa" className={linkClass}>
                  Freelancers in Africa
                </Link>
              </li>
              <li>
                <Link to="/freelancers/somalia" className={linkClass}>
                  Somali Freelancer Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support/help-center" className={linkClass}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/support/contact" className={linkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/support/trust-safety" className={linkClass}>
                  Trust &amp; Safety
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className={linkClass}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className={linkClass}>
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className={`${linkClass} text-left`}
                >
                  Cookie Settings
                </button>
              </li>
              <li>
                <Link to="/delete-account" className={linkClass}>
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className={linkClass}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className={linkClass}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/academy" className={linkClass}>
                  Academy
                </Link>
              </li>
              <li>
                <Link to="/pricing" className={linkClass}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={linkClass}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  Jobs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={linkClass}>
                  Events
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 FIVESOM. All rights reserved.
          </p>
        </div>
      </div>

      <div
        className="mt-10 flex h-20 select-none items-end justify-center overflow-hidden sm:h-32 lg:h-48"
        aria-hidden="true"
      >
        <span className="translate-y-[18%] whitespace-nowrap text-center text-7xl font-black leading-none tracking-normal text-foreground opacity-[0.05] sm:text-9xl lg:text-[12rem]">
          FIVESOM
        </span>
      </div>
    </footer>
  );
};
