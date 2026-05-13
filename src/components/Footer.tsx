import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-new.png';

export const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
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
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
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
              {['Logo Design', 'Video Editing', 'Web Design', 'Content Writing', 'App UI Design'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                    {item}
                  </a>
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
                <Link to="/vip" className="text-sm transition-colors text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <span>VIP Membership</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FFD166] to-[#FF9F1C] text-black">NEW</span>
                </Link>
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
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Privacy Policy
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
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Freelancer Tips
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm transition-colors text-muted-foreground hover:text-foreground">
                  Events
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 mt-8 text-center border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 FIVESOM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};