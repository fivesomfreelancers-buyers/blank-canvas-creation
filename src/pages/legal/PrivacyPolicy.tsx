import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { privacyCopy } from '@/lib/i18n/translations/privacy';
import { Lock, Database, Cookie, Shield, CreditCard, MessageSquare, FileText, UserX, Mail, Globe, Eye } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'data-collected': Database, why: Eye, usage: FileText, cookies: Cookie, security: Shield,
  encryption: Lock, payments: CreditCard, 'user-privacy': Eye, messages: MessageSquare,
  files: FileText, account: Shield, retention: Database, gdpr: Globe, rights: Shield,
  delete: UserX, support: Mail, updates: FileText,
};

const PrivacyPolicy: React.FC = () => {
  const { lang, dir } = useLanguage();
  const c = privacyCopy[lang];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SEO title={`${c.title} | FIVESOM`} description={c.subtitle} canonical="/legal/privacy" />
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5" />
              {c.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{c.title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{c.subtitle}</p>
            <p className="text-xs text-muted-foreground mt-3">
              {c.updatedLabel}: {new Date().toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">{c.toc}</p>
                  <ScrollArea className="h-[calc(100vh-220px)] pr-2">
                    <nav className="space-y-1">
                      {c.tocItems.map((s) => {
                        const Icon = ICONS[s.id] ?? FileText;
                        return (
                          <a key={s.id} href={`#${s.id}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md px-2 py-1.5 transition-colors">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{s.label}</span>
                          </a>
                        );
                      })}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>

            <article className="max-w-none">
              <Card className="border-border">
                <CardContent className="p-6 md:p-10 space-y-10 text-foreground">

                  <section id="data-collected">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> {c.dataCollectedTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {c.dataItems.map((d) => (
                        <div key={d.title} className="p-4 rounded-lg border border-border bg-muted/30">
                          <p className="font-semibold text-foreground mb-1">{d.title}</p>
                          <p className="text-sm text-muted-foreground">{d.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="why">
                    <h2 className="text-2xl font-bold mb-3">{c.why.title}</h2>
                    <ul className="list-disc ps-6 text-muted-foreground space-y-1.5">
                      {c.why.items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </section>

                  {[c.usage, c.cookies, c.security, c.encryption, c.payments, c.userPrivacy, c.messages, c.files, c.account].map((s, i) => {
                    const ids = ['usage','cookies','security','encryption','payments','user-privacy','messages','files','account'];
                    return (
                      <React.Fragment key={ids[i]}>
                        <Separator />
                        <section id={ids[i]}>
                          <h2 className="text-2xl font-bold mb-3">{s.title}</h2>
                          <p className="text-muted-foreground">{s.body}</p>
                        </section>
                      </React.Fragment>
                    );
                  })}

                  <Separator />
                  <section id="retention">
                    <h2 className="text-2xl font-bold mb-3">{c.retention.title}</h2>
                    <ul className="list-disc ps-6 text-muted-foreground space-y-1.5">
                      {c.retention.items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </section>

                  <Separator />
                  <section id="gdpr">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> {c.gdpr.title}</h2>
                    <p className="text-muted-foreground">{c.gdpr.body}</p>
                  </section>

                  <Separator />
                  <section id="rights">
                    <h2 className="text-2xl font-bold mb-3">{c.rightsTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {c.rights.map((r) => (
                        <div key={r.title} className="p-4 rounded-lg border border-border bg-muted/30">
                          <p className="font-semibold text-foreground mb-1">{r.title}</p>
                          <p className="text-sm text-muted-foreground">{r.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="delete">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><UserX className="w-5 h-5 text-primary" /> {c.deleteAccount.title}</h2>
                    <p className="text-muted-foreground">{c.deleteAccount.body}</p>
                  </section>

                  <Separator />
                  <section id="support">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> {c.support.title}</h2>
                    <p className="text-muted-foreground">
                      {c.support.body}{' '}
                      <Link to="/support/contact" className="text-primary underline">{c.support.linkLabel}</Link>.
                    </p>
                  </section>

                  <Separator />
                  <section id="updates">
                    <h2 className="text-2xl font-bold mb-3">{c.updates.title}</h2>
                    <p className="text-muted-foreground">{c.updates.body}</p>
                  </section>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <Link to="/legal/terms" className="text-sm text-primary underline">{c.backToTerms}</Link>
                    <Link to="/support/contact" className="text-sm text-primary underline">{c.contactLink}</Link>
                  </div>

                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
