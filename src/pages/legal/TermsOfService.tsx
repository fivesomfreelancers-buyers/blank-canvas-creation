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
import { termsCopy } from '@/lib/i18n/translations/terms';
import {
  Shield, FileText, Users, CreditCard, Package, Star, Gavel, Ban,
  Copyright, AlertTriangle, Lock, Mail, CheckCircle2, XCircle
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  purpose: FileText, eligibility: Users, 'buyer-rights': CheckCircle2, 'freelancer-rights': CheckCircle2,
  'buyer-duties': Shield, 'freelancer-duties': Shield, payments: CreditCard, refunds: CreditCard,
  orders: Package, delivery: Package, reviews: Star, disputes: Gavel, suspension: AlertTriangle,
  termination: Ban, copyright: Copyright, ip: Copyright, prohibited: XCircle, community: Users,
  fraud: Shield, spam: Ban, fake: Ban, verification: CheckCircle2, vip: Star, verified: CheckCircle2,
  affiliate: FileText, security: Lock, abuse: AlertTriangle, changes: FileText, contact: Mail,
};

const TermsOfService: React.FC = () => {
  const { lang, dir } = useLanguage();
  const c = termsCopy[lang];

  const simpleSections = [
    c.purpose, c.eligibility, c.buyerRights, c.freelancerRights, c.buyerDuties, c.freelancerDuties,
    c.payments, c.refunds, c.orders, c.delivery, c.reviews, c.disputes, c.suspension, c.termination,
    c.copyright, c.ip,
  ];
  const afterProhibited = [
    c.community, c.fraud, c.spam, c.fake, c.verification, c.vip, c.verified, c.affiliate,
    c.security, c.abuse, c.changes,
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SEO title={`${c.title} | FIVESOM`} description={c.subtitle} canonical="/legal/terms" />
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <FileText className="w-3.5 h-3.5" />
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
                  {simpleSections.map((s, i) => (
                    <React.Fragment key={s.id}>
                      {i > 0 && <Separator />}
                      <section id={s.id}>
                        <h2 className="text-2xl font-bold mb-3">{s.title}</h2>
                        {'body' in s && s.body && (
                          <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                        )}
                        {'items' in s && s.items && (
                          <ul className="list-disc ps-6 text-muted-foreground space-y-1.5">
                            {s.items.map((it, idx) => <li key={idx}>{it}</li>)}
                          </ul>
                        )}
                      </section>
                    </React.Fragment>
                  ))}

                  <Separator />
                  <section id="prohibited">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" /> {c.prohibited.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">{c.prohibited.intro}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {c.prohibited.items.map((item) => (
                        <div key={item} className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/5 border border-destructive/20">
                          <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {afterProhibited.map((s) => (
                    <React.Fragment key={s.id}>
                      <Separator />
                      <section id={s.id}>
                        <h2 className="text-2xl font-bold mb-3">{s.title}</h2>
                        <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                      </section>
                    </React.Fragment>
                  ))}

                  <Separator />
                  <section id="consequences">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" /> {c.consequencesTitle}
                    </h2>
                    <div className="space-y-2">
                      {c.consequences.map((k) => (
                        <div key={k.label} className="p-3 rounded-lg border border-border bg-muted/30">
                          <p className="font-semibold text-foreground">{k.label}</p>
                          <p className="text-sm text-muted-foreground">{k.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="contact">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" /> {c.contact.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {c.contact.body}{' '}
                      <Link to="/support/contact" className="text-primary underline">{c.contact.supportLink}</Link>{' — '}
                      <Link to="/legal/privacy" className="text-primary underline">{c.contact.privacyLink}</Link>.
                    </p>
                  </section>

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

export default TermsOfService;
