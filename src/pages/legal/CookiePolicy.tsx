import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, ShieldCheck } from 'lucide-react';
import { COOKIE_CATEGORIES, openCookiePreferences } from '@/lib/cookieConsent';

const CookiePolicy: React.FC = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Cookie Policy | FIVESOM"
      description="How FIVESOM uses cookies and similar technologies, which categories exist, and how you can change your cookie preferences at any time."
      canonical="/legal/cookies"
    />
    <Navbar />

    <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Cookie className="w-3.5 h-3.5" />
            Cookies & tracking
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Cookie Policy</h1>
          <p className="text-muted-foreground">
            What cookies FIVESOM uses, why we use them, and how you stay in control.
          </p>
        </div>

        <Card className="border-border mb-6">
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">What cookies are</h2>
              <p>
                Cookies are small files stored on your device. FIVESOM also uses similar technologies such as
                local storage. Some are strictly necessary to run the marketplace; others are optional and
                only used when you allow them.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">Your consent</h2>
              <p>
                On your first visit we ask for your choice. Nothing outside the necessary category is
                activated before you consent, and your decision is stored for up to 12 months. You can change
                or withdraw it at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-8">
          {COOKIE_CATEGORIES.map((cat) => (
            <Card key={cat.key} className="border-border">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {cat.title}
                  {cat.locked && (
                    <span className="text-[11px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      Always on
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" /> Manage your cookie settings
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Update your choices whenever you like — no account needed.
              </p>
            </div>
            <Button onClick={openCookiePreferences} className="shrink-0">
              Cookie settings
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2 justify-center">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          More detail in our{' '}
          <Link to="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>

    <Footer />
  </div>
);

export default CookiePolicy;
