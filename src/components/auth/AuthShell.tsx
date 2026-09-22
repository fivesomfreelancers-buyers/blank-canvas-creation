import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, LockKeyhole, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.png';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  benefits?: string[];
}

const AuthShell = ({ eyebrow, title, description, children, benefits }: AuthShellProps) => (
  <main className="dark min-h-screen bg-background pt-16 font-body">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1440px] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-card px-12 py-14 lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
        <Link to="/" className="relative inline-flex w-fit items-center gap-3" aria-label="FIVESOM home">
          <img src={logo} alt="" className="h-11 w-11 object-contain" />
          <span className="font-heading text-xl font-bold text-foreground">Fivesom</span>
        </Link>

        <div className="relative max-w-lg animate-fade-in-up">
          <p className="mb-4 text-sm font-semibold text-primary">{eyebrow}</p>
          <h2 className="font-heading text-4xl font-bold leading-tight text-foreground xl:text-5xl">{title}</h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">{description}</p>
          <div className="mt-10 space-y-4">
            {(benefits ?? ['Verified account access', 'Escrow-protected work', 'Your details stay secure']).map((item, index) => {
              const Icon = index === 0 ? BadgeCheck : index === 1 ? ShieldCheck : LockKeyhole;
              return (
                <div key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                  <span className="font-medium">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">Secure access for freelancers and clients worldwide.</p>
      </section>

      <section className="flex items-start justify-center px-4 py-10 sm:px-8 lg:items-center lg:px-12 lg:py-14">
        <div className="w-full max-w-2xl animate-fade-in-up">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden" aria-label="FIVESOM home">
            <img src={logo} alt="" className="h-10 w-10 object-contain" />
            <span className="font-heading text-lg font-bold text-foreground">FIVESOM</span>
          </Link>
          {children}
        </div>
      </section>
    </div>
  </main>
);

export default AuthShell;