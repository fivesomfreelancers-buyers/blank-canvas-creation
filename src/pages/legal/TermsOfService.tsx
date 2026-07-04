import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Shield, FileText, Users, CreditCard, Package, Star, Gavel, Ban,
  Copyright, AlertTriangle, Lock, Mail, CheckCircle2, XCircle
} from 'lucide-react';

const sections = [
  { id: 'purpose', label: '1. Ujeeddada Fivesom', icon: FileText },
  { id: 'eligibility', label: '2. Shuruudaha Isticmaalka', icon: Users },
  { id: 'buyer-rights', label: '3. Xuquuqda Buyer', icon: CheckCircle2 },
  { id: 'freelancer-rights', label: '4. Xuquuqda Freelancer', icon: CheckCircle2 },
  { id: 'buyer-duties', label: '5. Waajibaadka Buyer', icon: Shield },
  { id: 'freelancer-duties', label: '6. Waajibaadka Freelancer', icon: Shield },
  { id: 'payments', label: '7. Xeerarka Payments', icon: CreditCard },
  { id: 'refunds', label: '8. Refund Policy', icon: CreditCard },
  { id: 'orders', label: '9. Order Rules', icon: Package },
  { id: 'delivery', label: '10. Delivery Rules', icon: Package },
  { id: 'reviews', label: '11. Review Policy', icon: Star },
  { id: 'disputes', label: '12. Dispute Resolution', icon: Gavel },
  { id: 'suspension', label: '13. Account Suspension', icon: AlertTriangle },
  { id: 'termination', label: '14. Account Termination', icon: Ban },
  { id: 'copyright', label: '15. Copyright Policy', icon: Copyright },
  { id: 'ip', label: '16. Intellectual Property', icon: Copyright },
  { id: 'prohibited', label: '17. Prohibited Activities', icon: XCircle },
  { id: 'community', label: '18. Community Guidelines', icon: Users },
  { id: 'fraud', label: '19. Fraud Prevention', icon: Shield },
  { id: 'spam', label: '20. Spam Policy', icon: Ban },
  { id: 'fake', label: '21. Fake & Multiple Accounts', icon: Ban },
  { id: 'verification', label: '22. Identity Verification', icon: CheckCircle2 },
  { id: 'vip', label: '23. VIP Membership Terms', icon: Star },
  { id: 'verified', label: '24. Verified Seller Terms', icon: CheckCircle2 },
  { id: 'affiliate', label: '25. Affiliate & Advertising', icon: FileText },
  { id: 'security', label: '26. Security Policy', icon: Lock },
  { id: 'abuse', label: '27. Abuse Reporting', icon: AlertTriangle },
  { id: 'changes', label: '28. Changes to Terms', icon: FileText },
  { id: 'contact', label: '29. Contact Information', icon: Mail },
];

const prohibitedList = [
  'Sawirro qaawan (Nude images)', 'Videos qaawan', 'Pornography', 'Nudity',
  'Sexual content', 'Prostitution', 'Harassment', 'Hate Speech', 'Racism',
  'Bullying', 'Threats', 'Blackmail', 'Scam', 'Fraud', 'Money Laundering',
  'Fake Reviews', 'Fake Orders', 'Fake Accounts', 'Copyright Violations',
  'Pirated Files', 'Malware', 'Viruses', 'Spam', 'Bot Activity',
  'Illegal Services', 'Illegal Products', 'Drug Sales', 'Weapons Sales',
  'Terrorism', 'Child Exploitation', 'Gambling', 'Human Trafficking',
  'Identity Theft', 'Impersonation',
];

const consequences = [
  { label: 'Warning', desc: 'Digniin rasmi ah oo lagu wargeliyo user-ka.' },
  { label: 'Content Removal', desc: 'Content-ka jebiya xeerarka waa la tirtiraa.' },
  { label: 'Temporary Suspension', desc: 'Account-ka waxaa lagu xayiraa muddo gaaban.' },
  { label: 'Permanent Ban', desc: 'Isticmaale wali laga saarayo Fivesom si joogto ah.' },
  { label: 'Account Closure', desc: 'Xisaabta si buuxda ayaa loo xirayaa, lacagihii hadhayna waa la sii deynayaa haddii ay xalaal yihiin.' },
];

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service | FIVESOM"
        description="Xeerarka rasmiga ah ee isticmaalka Fivesom marketplace — buyer, freelancer, payments, disputes, iyo waxyaabaha mamnuuca ah."
        canonical="/legal/terms"
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <FileText className="w-3.5 h-3.5" />
              LEGAL DOCUMENT
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cinwaannada shuruudaha rasmiga ah ee xakameynaya isticmaalka madasha Fivesom. Fadlan si taxaddar leh u akhri kahor intaadan adeegsan adeegga.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Waxaa la cusboonaysiiyay: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sticky TOC */}
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

            {/* Content */}
            <article className="prose prose-invert max-w-none">
              <Card className="border-border">
                <CardContent className="p-6 md:p-10 space-y-10 text-foreground">

                  <section id="purpose">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> 1. Ujeeddada Fivesom</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Fivesom waa marketplace freelance-ka Somaliyeed ee isku xira Buyers iyo Freelancers si loo iibiyo oo loo iibsado adeegyo digital ah sida design, development, video editing, content writing iyo kuwo kale. Ujeeddadeenu waa in aan siino xirfadleyda Soomaaliyeed madasha rasmiga ah ee ay ku helaan mushaharkooda si ammaan ah iyadoo la adeegsanayo escrow-based payment system.
                    </p>
                  </section>

                  <Separator />
                  <section id="eligibility">
                    <h2 className="text-2xl font-bold mb-3">2. Shuruudaha Isticmaalka Website-ka</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Waa inaad ka weyn tahay 18 sano.</li>
                      <li>Waa inaad bixisaa macluumaad sax ah oo rasmi ah.</li>
                      <li>Waa in aadan sameyn wax badan oo accounts ah (multiple accounts).</li>
                      <li>Waa inaad raacdaa dhammaan sharciyada dalkaaga iyo kuwa caalamiga ah.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="buyer-rights">
                    <h2 className="text-2xl font-bold mb-3">3. Xuquuqda Buyer</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Inuu helo delivery sax ah oo la mid ah waxa lagu ballan qaaday gigga.</li>
                      <li>Inuu codsado revision haddii shaqadu aysan buuxin shuruudaha.</li>
                      <li>Inuu furo dispute haddii uu freelancer-ku fashilmo.</li>
                      <li>Inuu helo refund marka xaalada la ansixiyo.</li>
                      <li>Inuu galo chat ammaan ah oo la fiirsan karo.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="freelancer-rights">
                    <h2 className="text-2xl font-bold mb-3">4. Xuquuqda Freelancer</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Inuu helo lacagtiisa marka delivery-ga la ansixiyo (Available Balance).</li>
                      <li>Inuu difaaco shaqadiisa marka dispute la furo.</li>
                      <li>Inuu diido shaqooyin ka baxsan xirfadiisa.</li>
                      <li>Inuu helo review sax ah oo cadaalad ah.</li>
                      <li>Inuu codsado Verified ama VIP status.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="buyer-duties">
                    <h2 className="text-2xl font-bold mb-3">5. Waajibaadka Buyer</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Bixinta lacagta ka hor inta aan shaqada la bilaabin.</li>
                      <li>Bixinta requirements cad oo dhamaystiran.</li>
                      <li>Ka jawaabista fariimaha freelancer-ka waqti macquul ah.</li>
                      <li>Ansixinta delivery-ga marka ay buuxsanto shuruudaha.</li>
                      <li>Ka fogaanshaha cabashooyin been abuur ah.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="freelancer-duties">
                    <h2 className="text-2xl font-bold mb-3">6. Waajibaadka Freelancer</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Gudbinta shaqo tayo leh oo waafaqsan gigga.</li>
                      <li>Ixtiraamka waqtiga (deadline) la ballan qaaday.</li>
                      <li>Isticmaalka luuqad xushmad leh.</li>
                      <li>Yeynan gudbin shaqo la xaday ama copyright leh.</li>
                      <li>Sameynta communication professional ah.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="payments">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> 7. Xeerarka Payments</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Dhammaan payments waxay maraan escrow system. Lacagta buyer-ka ayaa la qabtaa ilaa uu freelancer-ku dhamaystiro shaqada oo buyer-ku ansixiyo. Fivesom waxay qaadataa boqolley yar (service fee) oo intiisa kale la siiyo freelancer-ka Available Balance-kiisa. Withdraw kaliya wuxuu ka shaqeeyaa Available Balance oo aan ahayn Total Earned.
                    </p>
                  </section>

                  <Separator />
                  <section id="refunds">
                    <h2 className="text-2xl font-bold mb-3">8. Refund Policy</h2>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                      <li>Refund waxaa la bixiyaa haddii freelancer-ku uusan gudbin shaqada.</li>
                      <li>Refund waxaa la bixiyaa haddii shaqadu si weyn uga duwan tahay tii la ballan qaaday.</li>
                      <li>Refund lama bixiyo marka buyer-ku beddelo fikirkiisa kadib delivery.</li>
                      <li>Dhammaan refund waxaa go'aamiya admin dispute team.</li>
                    </ul>
                  </section>

                  <Separator />
                  <section id="orders">
                    <h2 className="text-2xl font-bold mb-3">9. Order Rules</h2>
                    <p className="text-muted-foreground">Order kasta wuxuu maraa: Requirements → In Progress → Delivered → Accepted/Revision/Disputed. Order lama cancel karo kadib marka freelancer-ku bilaabo shaqada iyada oo aan la marin dispute.</p>
                  </section>

                  <Separator />
                  <section id="delivery">
                    <h2 className="text-2xl font-bold mb-3">10. Delivery Rules</h2>
                    <p className="text-muted-foreground">Freelancer-ku waa inuu gudbiyaa delivery kaas oo ay ku jiraan files-ka, sharraxaad, iyo wax kasta oo lagu heshiiyay. Delivery waxaa la ansixiyaa 3 maalmood gudahood haddii uusan buyer-ku dhaqaajin, waxayna otomaatig u tagtaa Available Balance-ka freelancer-ka.</p>
                  </section>

                  <Separator />
                  <section id="reviews">
                    <h2 className="text-2xl font-bold mb-3">11. Review Policy</h2>
                    <p className="text-muted-foreground">Reviews waa inay noqdaan run iyo cadaalad ah. Fake reviews, reviews la iibsaday, ama reviews aan xiriir la lahayn shaqada waa mamnuuc waana la tirtirayaa.</p>
                  </section>

                  <Separator />
                  <section id="disputes">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Gavel className="w-5 h-5 text-primary" /> 12. Dispute Resolution</h2>
                    <p className="text-muted-foreground">Marka labada dhinac isku khilaafaan, admin team-ka ayaa dhexdhexaadin doona iyada oo la tixgelinayo chat history, delivery files, iyo requirements-ka asalka ah. Go'aanka admin-ka waa final.</p>
                  </section>

                  <Separator />
                  <section id="suspension">
                    <h2 className="text-2xl font-bold mb-3">13. Account Suspension</h2>
                    <p className="text-muted-foreground">Account-ka waa la xayiri karaa muddo gaaban haddii user-ku jebiyo xeerar. Muddadu waxay noqon kartaa 24 saac ilaa 30 maalmood iyadoo la tixgelinayo darnaanta xaalada.</p>
                  </section>

                  <Separator />
                  <section id="termination">
                    <h2 className="text-2xl font-bold mb-3">14. Account Termination</h2>
                    <p className="text-muted-foreground">Fivesom waxay xaq u leedahay inay xirto account kasta oo jebiya xeerarka si joogto ah, gaar ahaan kuwa ku lug leh khiyaano, khiyaamada, ama waxyaabaha mamnuuca ah.</p>
                  </section>

                  <Separator />
                  <section id="copyright">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Copyright className="w-5 h-5 text-primary" /> 15. Copyright Policy</h2>
                    <p className="text-muted-foreground">Ma oggola in la iibiyo ama la gudbiyo shaqo copyright leh oo aan qofka lahayn. DMCA takedown requests waa la fulinayaa 48 saac gudahood.</p>
                  </section>

                  <Separator />
                  <section id="ip">
                    <h2 className="text-2xl font-bold mb-3">16. Intellectual Property</h2>
                    <p className="text-muted-foreground">Shaqada la gudbiyo waxaa iska leh buyer-ka marka payment la dhameystiro, ilaa haddii uu freelancer-ku si cad ugu qoro heshiis kale.</p>
                  </section>

                  <Separator />
                  <section id="prohibited">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2 text-destructive"><XCircle className="w-5 h-5" /> 17. Prohibited Activities — Waxyaabaha Mamnuuca ah</h2>
                    <p className="text-muted-foreground mb-4">Fivesom si adag u mamnuucday dhammaan waxyaabahan hoos ku qoran. Ku lug lahaanshaha wuxuu keeni doonaa xayiraad joogto ah:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prohibitedList.map((item) => (
                        <div key={item} className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/5 border border-destructive/20">
                          <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="community">
                    <h2 className="text-2xl font-bold mb-3">18. Community Guidelines</h2>
                    <p className="text-muted-foreground">Isticmaal luuqad xushmad leh. Ixtiraam dhammaan users-ka iyadoon loo eegin diinta, qowmiyada, jinsiga, ama luuqada. Chat-ka wuxuu leeyahay automatic moderation oo lagu ogaanayo waxyaabaha xun.</p>
                  </section>

                  <Separator />
                  <section id="fraud">
                    <h2 className="text-2xl font-bold mb-3">19. Fraud Prevention</h2>
                    <p className="text-muted-foreground">Wax kasta oo khiyaamo ah — fake orders, chargeback abuse, payment fraud, ama phishing — waxay keenaysaa xayiraad joogto ah iyo, marka loo baahdo, gudbinta hay'adaha sharciga.</p>
                  </section>

                  <Separator />
                  <section id="spam">
                    <h2 className="text-2xl font-bold mb-3">20. Spam Policy</h2>
                    <p className="text-muted-foreground">Diridda fariimaha soo noqnoqda, bulk messages, ama xiriirinta buyers dibedda Fivesom si looga fogaado fees-ka waa mamnuuc.</p>
                  </section>

                  <Separator />
                  <section id="fake">
                    <h2 className="text-2xl font-bold mb-3">21. Fake Accounts & Multiple Accounts</h2>
                    <p className="text-muted-foreground">Qof waliba wuxuu leeyahay hal account keliya. Fake accounts, impersonation, ama sameynta accounts badan si loogu daboolo xayiraad waa mamnuuc.</p>
                  </section>

                  <Separator />
                  <section id="verification">
                    <h2 className="text-2xl font-bold mb-3">22. Identity Verification</h2>
                    <p className="text-muted-foreground">Fivesom waxay codsan kartaa aqoonsi (ID) si loo xaqiijiyo aqoonsiga. Xogta aqoonsigu waa la ilaaliyaa iyadoo la adeegsanayo encryption, kuma qeyb galno cid saddexaad.</p>
                  </section>

                  <Separator />
                  <section id="vip">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> 23. VIP Membership Terms</h2>
                    <p className="text-muted-foreground">VIP membership waa lacag-bixin bille ah oo bixisa waxyaabo dheeraad ah sida priority support, badges, iyo visibility sare. Lama refund gareeyo lacagta VIP marka bishu bilaabanto.</p>
                  </section>

                  <Separator />
                  <section id="verified">
                    <h2 className="text-2xl font-bold mb-3">24. Verified Seller (Blue Tick) Terms</h2>
                    <p className="text-muted-foreground">Blue Tick waxaa la siiyaa freelancers-ka la xaqiijiyay aqoonsigooda, tayada shaqadooda iyo taariikhda cadaalada leh. Waa la qaadi karaa haddii xeerar la jebiyo.</p>
                  </section>

                  <Separator />
                  <section id="affiliate">
                    <h2 className="text-2xl font-bold mb-3">25. Affiliate & Advertising Rules</h2>
                    <p className="text-muted-foreground">Xayaysiiska hore ee gigyada waa in ay run tahay lamana isticmaali karo sawirro been abuur ah ama ballan qaadyo aan la fulin karin.</p>
                  </section>

                  <Separator />
                  <section id="security">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> 26. Security Policy</h2>
                    <p className="text-muted-foreground">Passwords-ka waa la hash-gareeyay. Chats-ka waxaa lagu ilaaliyaa RLS security. Ha la wadaagin cid password-kaaga.</p>
                  </section>

                  <Separator />
                  <section id="abuse">
                    <h2 className="text-2xl font-bold mb-3">27. Abuse Reporting</h2>
                    <p className="text-muted-foreground">Isticmaal Report button-ka si aad noogu soo sheegto content xun, users-ka jebiya xeerar, ama khiyaano. Warbixinnada waxaa la eegayaa 24 saac gudahood.</p>
                  </section>

                  <Separator />
                  <section id="changes">
                    <h2 className="text-2xl font-bold mb-3">28. Changes to Terms</h2>
                    <p className="text-muted-foreground">Fivesom waxay xaq u leedahay inay wax ka beddesho xeerarkan waqti kasta. Isbeddellada waaweyn waxaa lagu wargeliyaa users-ka email ama in-app notification.</p>
                  </section>

                  <Separator />
                  <section id="consequences">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-primary" /> Waxa Dhaca Marka Xeerar La Jebiyo</h2>
                    <div className="space-y-2">
                      {consequences.map((c) => (
                        <div key={c.label} className="p-3 rounded-lg border border-border bg-muted/30">
                          <p className="font-semibold text-foreground">{c.label}</p>
                          <p className="text-sm text-muted-foreground">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <Separator />
                  <section id="contact">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> 29. Contact Information</h2>
                    <p className="text-muted-foreground">
                      Wixii su'aalo ah ee ku saabsan xeerarkan, fadlan nala soo xiriir iyada oo loo marayo{' '}
                      <Link to="/support/contact" className="text-primary underline">Contact Support</Link> ama{' '}
                      <Link to="/legal/privacy" className="text-primary underline">Privacy Policy</Link>.
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
