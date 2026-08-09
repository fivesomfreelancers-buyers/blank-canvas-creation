import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LegalLang = 'en' | 'so' | 'fr' | 'ar';

export const LEGAL_LANGS: { code: LegalLang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'so', label: 'Somali' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

interface Props {
  value: LegalLang;
  onChange: (lang: LegalLang) => void;
}

/** Language switcher scoped to the legal documents only. */
const LegalLanguageSwitcher: React.FC<Props> = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground me-1">
      <Globe className="w-3.5 h-3.5" /> Language
    </span>
    {LEGAL_LANGS.map((l) => (
      <Button
        key={l.code}
        size="sm"
        variant={value === l.code ? 'default' : 'outline'}
        className="h-8 px-3 text-xs"
        onClick={() => onChange(l.code)}
      >
        {l.label}
      </Button>
    ))}
  </div>
);

export default LegalLanguageSwitcher;
