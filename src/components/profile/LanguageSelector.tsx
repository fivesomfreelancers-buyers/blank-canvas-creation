import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WORLD_LANGUAGES, languageFlag } from '@/lib/languages';

interface LanguageSelectorProps {
  value: string[];
  onChange: (languages: string[]) => void;
  id?: string;
  max?: number;
}

const LanguageSelector = ({ value, onChange, id = 'languages', max = 20 }: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);

  const toggleLanguage = (language: string) => {
    if (value.includes(language)) {
      onChange(value.filter((item) => item !== language));
      return;
    }
    if (value.length < max) onChange([...value, language]);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selected languages">
          {value.map((language) => (
            <li key={language} className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span aria-hidden="true">{languageFlag(language)}</span>
              {language}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full text-primary/70 hover:text-primary"
                onClick={() => toggleLanguage(language)}
                aria-label={`Remove ${language}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-11 w-full justify-between bg-background font-normal"
          >
            Search languages…
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search languages…" />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {WORLD_LANGUAGES.map(({ name, flag }) => {
                  const selected = value.includes(name);
                  return (
                    <CommandItem key={name} value={name} onSelect={() => toggleLanguage(name)}>
                      <Check className={`mr-2 h-4 w-4 ${selected ? 'opacity-100' : 'opacity-0'}`} />
                      <span className="mr-2" aria-hidden="true">{flag}</span>
                      {name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">Select every language you can work in. You can choose up to {max}.</p>
    </div>
  );
};

export default LanguageSelector;