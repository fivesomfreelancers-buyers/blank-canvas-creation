import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-new.png';

interface LogoProps {
  className?: string;
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "", linkTo = "/" }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const logoElement = (
    <div className="flex items-center gap-2">
      <img 
        src={isDarkMode ? logoLight : logoDark} 
        alt="FIVESOM" 
        className={`h-[60px] w-auto object-contain transition-opacity duration-300 ${className}`}
      />
      <span className="text-2xl font-bold text-foreground tracking-tight">
        Fivesom
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
};