import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Lock, Database, Cookie, Shield, CreditCard, MessageSquare, FileText, UserX, Mail, Globe, Eye } from 'lucide-react';

const sections = [
  { id: 'data-collected', label: '1. Xogta La Ururiyo', icon: Database },
  { id: 'why', label: '2. Sababta Xogta Loo Ururiyo', icon: Eye },
  { id: 'usage', label: '3. Sida Loo Isticmaalo Xogta', icon: FileText },
  { id: 'cookies', label: '4. Cookies', icon: Cookie },
  { id: 'security', label: '5. Security', icon: Shield },
  { id: 'encryption', label: '6. Encryption', icon: Lock },
  { id: 'payments', label: '7. Payments & Stripe', icon: CreditCard },
  { id: 'user-privacy', label: '8. User Privacy', icon: Eye },
  { id: 'messages', label: '9. Message Privacy', icon: MessageSquare },
  { id: 'files', label: '10. File Privacy', icon: FileText },
  { id: 'account', label: '11. Account Protection', icon: Shield },
  { id: 'retention', label: '12. Data Retention', icon: Database },
  { id: 'gdpr', label: '13. GDPR Compliance', icon: Globe },
  { id: 'rights', label: '14. User Rights', icon: Shield },
  { id: 'delete', label: '15. Delete Account & Data', icon: UserX },
  { id: 'support', label: '16. Contact Support', icon: Mail },
  { id: 'updates', label: '17. Privacy Updates', icon: FileText },
];

const dataItems = [
  { title: 'Account Information', desc: 'Magaca buuxa, email, taleefanka, sawirka profile-ka, role (buyer/freelancer).' },
  { title: 'Verification Data', desc: 'Aqoonsiga rasmiga ah (ID), documents-ka xaqiijinta — waxay ku jiraan storage restricted ah.' },
  { title: 'Transaction Data', desc: 'Orders, payments, withdrawals, iyo wallet history.' },
  { title: 'Communication Data', desc: 'Chats-ka Buyer↔Freelancer, support tickets, iyo dispute chats.' },
  { title: 'Device & Usage', desc: 'IP address, browser type, device info, iyo pages-ka aad boogato (analytics).' },
  { title: 'Content You Upload', desc: 'Sawirrada gigga, portfolio, delivery files, iyo attachments-ka chat-ka.' },
];

const rights = [
  { title: 'Right to Access', desc: 'Waxaad codsan kartaa nuqul ka mid ah dhammaan xogtaada aan haysano.' },
  { title: 'Right to Rectification', desc: 'Waxaad saxi kartaa macluumaad khaldan.' },
  { title: 'Right to Erasure', desc: 'Waxaad codsan kartaa in la tirtiro xogtaada gebi ahaanba.' },
  { title: 'Right to Object', desc: 'Waxaad diidi kartaa habab gaar ah oo xog-processing ah.' },
  { title: 'Right to Portability', desc: 'Waxaad ku codsan kartaa xogtaada format machine-readable ah.' },
];

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | FIVESOM"
        description="Sida Fivesom u ururiyo, u isticmaalo, oo u ilaaliyo xogtaada shakhsi ahaaneed — encryption, retention, GDPR compliance, iyo xuquuqda user-ka."
        canonical="/legal/privacy"
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5" />
              PRIVACY & DATA
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Waxaan qadarinaa xogtaada shakhsi ahaaneed. Bogagan wuxuu si cad u sharaxayaa waxa aan ururino, sababta, iyo sida aan u ilaalinno.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Waxaa la cusboonaysiiyay: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Table of Contents</p>
                  <ScrollArea className="h-[calc(100vh-220px)] pr-2">
                    <nav className="space-y-1">
                      {sections.map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md px-2 py-1.5 transition-colors"
                        >
                          <s.icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{s.label}</span>
                        </a>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>

            <article className="max-w-none">
              <Card className="border-border">
                <CardContent className="p-6 md:p-10 space-y-10 text-foreground">

                  <section id="data-collected">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> 1. Xogta Aan Ururino</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dataItems.map((d) => (
                        <div key={d.title} className="p-4 rounded-lg border border-border bg-muted/30">
                          <p className="font-semibold text-foreground mb-1">{d.title}</p>
                          <p className="text-sm text-muted-foreground">{d.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="why">
                    <h2 className="text-2xl font-bold mb-3">2. Sababta Xogta Loo Ururiyo</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Fulinta adeegga (accounts, gigs, orders, payments).</li>
                      <li>Xaqiijinta aqoonsiga si loo yareeyo fake accounts.</li>
                      <li>Ilaalinta platform-ka fraud-ka iyo abuse-ka.</li>
                      <li>Hagaajinta muuqaalka (analytics) iyo user experience.</li>
                      <li>Xiriirinta users marka la baahdo (notifications, support).</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="usage">
                    <h2 className="text-2xl font-bold mb-3">3. Sida Loo Isticmaalo Xogta</h2>
                    <p className="text-muted-foreground">Xogta kaliya waxaa loo isticmaalaa ujeeddooyinka sharraxan sare. Ma iibino xog user-ka cid saddexaad, mana isticmaalno xogta gaarka ah ee chats-ka si xayaysiis loogu diro user-ka.</p>
                  </section>

                  <Separator />
                  <section id="cookies">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Cookie className="w-5 h-5 text-primary" /> 4. Cookies</h2>
                    <p className="text-muted-foreground">Waxaan isticmaalnaa cookies muhiim ah oo lagu ilaaliyo session-kaaga (login), theme preference, iyo analytics fudud. Waxaad ka joojin kartaa cookies non-essential ah settings-ka browser-kaaga.</p>
                  </section>

                  <Separator />
                  <section id="security">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> 5. Security</h2>
                    <p className="text-muted-foreground">Xog kastaa waxay ku jirtaa Supabase database-ka kaas oo lagu ilaaliyo Row Level Security (RLS). Kaliya user-ka lahaanshaha xogta ayaa arki kara. Passwords-ka waa hashed lamana kaydiyo qaab plaintext ah.</p>
                  </section>

                  <Separator />
                  <section id="encryption">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> 6. Encryption</h2>
                    <p className="text-muted-foreground">Dhammaan xiriirka website-ka wuxuu ku maraa HTTPS/TLS encryption. Storage buckets-ka xogta xasaasiga ah (verification docs) waxay leeyihiin signed URLs oo waqti-xaddidan.</p>
                  </section>

                  <Separator />
                  <section id="payments">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> 7. Payments & Stripe Security</h2>
                    <p className="text-muted-foreground">Fivesom ma kaydiso raw card details. Dhammaan card processing waxaa maraya providers PCI-DSS compliant ah sida Stripe. USSD payments-ka gudaha waxay maraan mobile money providers-ka Soomaaliyeed sida EVC Plus, Zaad, iyo Sahal.</p>
                  </section>

                  <Separator />
                  <section id="user-privacy">
                    <h2 className="text-2xl font-bold mb-3">8. User Privacy</h2>
                    <p className="text-muted-foreground">Profile-ka user-ka wuxuu muujiyaa oo kaliya macluumaadka user-ku doortay inuu shaacaya (display name, bio, portfolio). Email, phone iyo verification docs waa la qariyaa.</p>
                  </section>

                  <Separator />
                  <section id="messages">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> 9. Message Privacy</h2>
                    <p className="text-muted-foreground">Chats-ka waxaa arki kara kaliya participants-ka la xiriira (buyer, freelancer, ama support). Admins-ku waxay heli karaan chats kaliya marka ay soo baxdo dispute ama abuse report.</p>
                  </section>

                  <Separator />
                  <section id="files">
                    <h2 className="text-2xl font-bold mb-3">10. File Privacy</h2>
                    <p className="text-muted-foreground">Files-ka delivery-ga waxaa arki kara kaliya buyer-ka iyo freelancer-ka la xiriira order-ka. Storage buckets restricted ah waxay isticmaalaan signed URLs oo dhici doona.</p>
                  </section>

                  <Separator />
                  <section id="account">
                    <h2 className="text-2xl font-bold mb-3">11. Account Protection</h2>
                    <p className="text-muted-foreground">Waxaan isticmaalnaa Google OAuth security, rate limiting, iyo suspicious login detection. Waxaa lagugu talinayaa inaad isticmaasho password adag oo Google account-kaaga.</p>
                  </section>

                  <Separator />
                  <section id="retention">
                    <h2 className="text-2xl font-bold mb-3">12. Data Retention</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Account data: ilaa user-ku tirtiro account-ka.</li>
                      <li>Transaction records: 7 sano si loo raaco financial regulations.</li>
                      <li>Chat attachments: 7–30 maalmood kadib order-ka waa la tirtiraa.</li>
                      <li>Verification docs: la tirtiraa marka la ansixiyo ama la diido.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="gdpr">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> 13. GDPR Compliance</h2>
                    <p className="text-muted-foreground">Fivesom waxay ixtiraamdaa mabaadi'da GDPR ee EU users, oo ay ku jiraan lawful basis for processing, data minimization, iyo user consent.</p>
                  </section>

                  <Separator />
                  <section id="rights">
                    <h2 className="text-2xl font-bold mb-3">14. User Rights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rights.map((r) => (
                        <div key={r.title} className="p-4 rounded-lg border border-border bg-muted/30">
                          <p className="font-semibold text-foreground mb-1">{r.title}</p>
                          <p className="text-sm text-muted-foreground">{r.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="delete">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><UserX className="w-5 h-5 text-primary" /> 15. Delete Account & Data</h2>
                    <p className="text-muted-foreground">Waxaad ka tirtiri kartaa account-kaaga Settings → Delete Account. Marka la tirtiro, dhammaan xogta shakhsi ahaaneed waa la masaxayaa 30 maalmood gudahood, marka laga reebo xogta financial-ka ee sharcigu qabo in la haysto.</p>
                  </section>

                  <Separator />
                  <section id="support">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> 16. Contact Support</h2>
                    <p className="text-muted-foreground">
                      Wixii su'aal ah ee privacy ah, la xiriir{' '}
                      <Link to="/support/contact" className="text-primary underline">Fivesom Support</Link>. Waxaan kaa jawaabnaa 48 saac gudahood.
                    </p>
                  </section>

                  <Separator />
                  <section id="updates">
                    <h2 className="text-2xl font-bold mb-3">17. Privacy Updates</h2>
                    <p className="text-muted-foreground">Waxaan wax ka beddeli karnaa Privacy Policy waqti kasta. Isbeddellada waaweyn waxaa lagu wargeliyaa users-ka email ama in-app notification 30 maalmood ka hor inta aysan bilaaban.</p>
                  </section>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <Link to="/legal/terms" className="text-sm text-primary underline">← View Terms of Service</Link>
                    <Link to="/support/contact" className="text-sm text-primary underline">Contact Support →</Link>
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
