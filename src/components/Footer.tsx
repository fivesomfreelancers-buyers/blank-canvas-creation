import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Moon, Phone, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { SocialLinks }  from './SocialLinks';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-new.png';
import { openCookiePreferences } from '@/lib/cookieConsent';

export const SUPPORT_EMAIL = 'fivesomsupport@gmail.com';

export const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={isDarkMode ? logoLight : logoDark} 
                alt="FIVESOM Logo" 
                width="50"
                height="50"
                className="object-contain transition-opacity duration-300"
              />
              <span className="text-xl font-bold text-foreground">
                FIVESOM
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with talented freelancers and grow your business with confidence.
            </p>

            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-foreground">Contact Us</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://wa.me/393208057092"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with Fivesom on WhatsApp"
                    className="text-sm transition-colors text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.174-.297-.019-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.198.057-.372-.058-.52-.115-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.36-.214-3.742.982.999-3.648-.235-.375a9.86 9.86 0 0 1-1.51-5.26c0-5.445 4.436-9.879 9.888-9.879a9.82 9.82 0 0 1 6.99 2.898 9.82 9.82 0 0 1 2.894 6.99c-.003 5.446-4.437 9.884-9.889 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L0 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.463 3.49"/>
                    </svg>
                    +39 320 805 7092
                  </a>
                </li>

                <li>
                  <a href="tel:+252636371510" className="text-sm transition-colors text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +252 63 637 1510
                  </a>
                </li>
                <li>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm transition-colors text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <SocialLinks iconSize={18} showLabel />

            {/* Theme Toggle */}
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 h-9 transition-all duration-300 hover:scale-105"
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                aria-pressed={isDarkMode}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4 transition-transform duration-300" />
                    <span className="text-xs font-medium">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 transition-transform duration-300" />
                    <span className="text-xs font-medium">Dark</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              Categories
            </h4>
            <ul className="space-y-2">
              {[
                { name: 'Logo Design', slug: 'logo-design' },
                { name: 'Motion Graphics', slug: 'motion-graphics' },
                { name: 'Video Editing', slug: 'video-editing' },
                { name: 'Web Design', slug: 'web-design' },
                { name: 'Content Writing', slug: 'content-writing' },
                { name: 'App UI Design', slug: 'app-ui-design' },
                { name: 'Graphic Design', slug: 'graphic-design' },
                { name: 'App Development', slug: 'app-development' },
                { name: 'Web Development', slug: 'web-development' },
              ].map((item) => (
                <li key={item.slug}>
                  <Link to={`/services/${item.slug}`} className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1 cursor-not-allowed opacity-70">
                  <span>VIP Membership</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FFD166] to-[#FF9F1C] text-black">Coming Soon</span>
                </span>
              </li>
              <li>
                <Link to="/docs#support" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="text-sm text-left transition-colors text-muted-foreground hover:text-foreground"
                >
                  Cookie Settings
                </button>
              </li>
              <li>
                <Link to="/delete-account" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Delete Account
                </Link>
              </li>


            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              Community
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 mt-8 text-center border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 FIVESOM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};