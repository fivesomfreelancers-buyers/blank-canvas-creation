import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Cookie, Lock } from 'lucide-react';
import { COOKIE_CATEGORIES, getConsent, saveConsent } from '@/lib/cookieConsent';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const CookiePreferencesDialog: React.FC<Props> = ({ open, onOpenChange, onSaved }) => {
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Re-read the stored choice each time the panel opens.
  useEffect(() => {
    if (!open) return;
    const c = getConsent();
    setFunctional(c ? c.functional : true);
    setAnalytics(c ? c.analytics : false);
    setMarketing(c ? c.marketing : false);
  }, [open]);

  const values: Record<string, { value: boolean; set: (v: boolean) => void }> = {
    functional: { value: functional, set: setFunctional },
    analytics: { value: analytics, set: setAnalytics },
    marketing: { value: marketing, set: setMarketing },
  };

  const commit = (choice: { functional: boolean; analytics: boolean; marketing: boolean }) => {
    saveConsent(choice);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Cookie className="h-5 w-5 text-primary" />
            Cookie preferences
          </DialogTitle>
          <DialogDescription>
            Choose which cookies FIVESOM may use. You can change this at any time from the Cookie Settings
            link in the footer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {COOKIE_CATEGORIES.map((cat) => {
            const control = values[cat.key];
            return (
              <div key={cat.key} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {cat.title}
                      {cat.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                  </div>
                  {cat.locked ? (
                    <span className="shrink-0 text-[11px] font-medium text-primary bg-primary/10 rounded-full px-2 py-1">
                      Always on
                    </span>
                  ) : (
                    <Switch
                      checked={control.value}
                      onCheckedChange={control.set}
                      aria-label={`Allow ${cat.title}`}
                      className="shrink-0"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Read more in our{' '}
          <Link to="/legal/cookies" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link to="/legal/privacy" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => commit({ functional: false, analytics: false, marketing: false })}
          >
            Reject non-essential
          </Button>
          <Button variant="secondary" onClick={() => commit({ functional, analytics, marketing })}>
            Save my choices
          </Button>
          <Button onClick={() => commit({ functional: true, analytics: true, marketing: true })}>
            Accept all
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookiePreferencesDialog;
