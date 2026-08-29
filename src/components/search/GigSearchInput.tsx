import React, { useEffect, useRef, useState } from 'react';
import { Search, Tag, X } from 'lucide-react';
import { useTagSuggestions } from '@/hooks/useGigSearch';

interface GigSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

/**
 * Search field with live tag suggestions coming from real gig tags in the
 * database. Results update as the user types — no Enter required.
 */
const GigSearchInput: React.FC<GigSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search for services, e.g. "Somali TikTok Edit"',
  className = '',
  inputClassName = '',
  autoFocus,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { suggestions } = useTagSuggestions(value);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => setActiveIndex(-1), [value]);

  const pick = (tag: string) => {
    onChange(tag);
    setOpen(false);
    onSubmit?.(tag);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        pick(suggestions[activeIndex].tag);
      } else {
        setOpen(false);
        onSubmit?.(value);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search gigs"
        aria-autocomplete="list"
        className={`w-full pl-12 pr-10 py-3 rounded-xl border-0 outline-none bg-muted/50 text-foreground placeholder:text-muted-foreground ${inputClassName}`}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange('');
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-2xl py-1"
        >
          {suggestions.map((s, i) => (
            <li key={s.tag}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => pick(s.tag)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Tag className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="truncate">{s.tag}</span>
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {s.count} {s.count === 1 ? 'gig' : 'gigs'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GigSearchInput;
