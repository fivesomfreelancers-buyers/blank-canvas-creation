import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// The homepage stays in the main bundle so the first paint is instant.
import Index from "./pages/Index";

// Everything else is code-split: a visitor only downloads the page they open.
const Explore = lazy(() => import("./pages/Explore"));
const GigDetails = lazy(() => import("./pages/GigDetails"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Docs = lazy(() => import("./pages/Docs"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Vip = lazy(() => import("./pages/Vip"));
const VipCheckout = lazy(() => import("./pages/VipCheckout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BuyerRegister = lazy(() => import("./pages/BuyerRegister"));
const FreelancerRegister = lazy(() => import("./pages/FreelancerRegister"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const UpgradeRole = lazy(() => import("./pages/UpgradeRole"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const CreateGig = lazy(() => import("./pages/CreateGig"));
const FreelancerDashboard = lazy(() => import("./pages/FreelancerDashboard"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const FreelancerGigs = lazy(() => import("./pages/freelancer/FreelancerGigs"));
const FreelancerOrders = lazy(() => import("./pages/freelancer/FreelancerOrders"));
const FreelancerMessages = lazy(() => import("./pages/freelancer/FreelancerMessages"));
const FreelancerDeliverWork = lazy(() => import("./pages/freelancer/FreelancerDeliverWork"));
const DeliverySuccess = lazy(() => import("./pages/freelancer/DeliverySuccess"));
const FreelancerOrderDetails = lazy(() => import("./pages/freelancer/FreelancerOrderDetails"));
const FreelancerWallet = lazy(() => import("./pages/freelancer/FreelancerWallet"));
const FreelancerWithdraw = lazy(() => import("./pages/freelancer/FreelancerWithdraw"));
const FreelancerPayouts = lazy(() => import("./pages/freelancer/FreelancerPayouts"));
const FreelancerHelp = lazy(() => import("./pages/freelancer/FreelancerHelp"));
const FreelancerSettings = lazy(() => import("./pages/freelancer/FreelancerSettings"));
const FreelancerProfile = lazy(() => import("./pages/freelancer/FreelancerProfile"));
const FreelancerVerify = lazy(() => import("./pages/freelancer/FreelancerVerify"));
const FreelancerProfilePage = lazy(() => import("./pages/FreelancerProfilePage"));
const BuyerBrowse = lazy(() => import("./pages/buyer/BuyerBrowse"));
const BuyerOrders = lazy(() => import("./pages/buyer/BuyerOrders"));
const BuyerMessages = lazy(() => import("./pages/buyer/BuyerMessages"));
const BuyerPayments = lazy(() => import("./pages/buyer/BuyerPayments"));
const BuyerHelp = lazy(() => import("./pages/buyer/BuyerHelp"));
const BuyerSettings = lazy(() => import("./pages/buyer/BuyerSettings"));
const BuyerOrderDetails = lazy(() => import("./pages/buyer/BuyerOrderDetails"));
const SubmitRequirements = lazy(() => import("./pages/buyer/SubmitRequirements"));
const PaymentSuccess = lazy(() => import("./pages/buyer/PaymentSuccess"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MessagesRedirect = lazy(() => import("./pages/MessagesRedirect"));
const Inbox = lazy(() => import("./pages/Inbox"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const FounderDashboard = lazy(() => import("./pages/founder/FounderDashboard"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));

import CookieConsentManager from "@/components/cookies/CookieConsentManager";
import { ThemeProvider } from "./components/ThemeProvider";
import PresenceProvider from "./components/presence/PresenceProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
        <PresenceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/gig/:slug" element={<GigDetails />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/vip" element={<Vip />} />
              <Route path="/vip-checkout" element={<VipCheckout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/buyer" element={<BuyerRegister />} />
              <Route path="/register/freelancer" element={<FreelancerRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Email links land here and get routed to the right inbox */}
              <Route path="/messages" element={<MessagesRedirect />} />
              <Route path="/support/messages" element={<MessagesRedirect />} />
              {/* Universal inbox — works for every signed-in role */}
              <Route path="/inbox" element={<ProtectedRoute require="authenticated"><Inbox /></ProtectedRoute>} />

              <Route path="/select-role" element={<ProtectedRoute require="authenticated"><RoleSelection /></ProtectedRoute>} />
              <Route path="/become-buyer" element={<ProtectedRoute><UpgradeRole role="buyer" /></ProtectedRoute>} />
              <Route path="/become-freelancer" element={<ProtectedRoute><UpgradeRole role="freelancer" /></ProtectedRoute>} />
              <Route path="/complete-profile/:role" element={<ProtectedRoute require="authenticated"><CompleteProfile /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute require="authenticated"><PaymentPage /></ProtectedRoute>} />
              <Route path="/buyer/payment-success" element={<ProtectedRoute require="authenticated"><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/create-gig" element={<ProtectedRoute require="authenticated"><CreateGig /></ProtectedRoute>} />
              <Route path="/edit-gig/:gigId" element={<ProtectedRoute require="authenticated"><CreateGig /></ProtectedRoute>} />

              {/* Public Freelancer Profile Routes (slug based) */}
              <Route path="/profile/:freelancerId" element={<FreelancerProfilePage />} />

              {/* Freelancer Routes */}
              <Route path="/freelancer/dashboard" element={<ProtectedRoute require="freelancer"><FreelancerDashboard /></ProtectedRoute>} />
              <Route path="/freelancer/gigs" element={<ProtectedRoute require="freelancer"><FreelancerGigs /></ProtectedRoute>} />
              <Route path="/freelancer/orders" element={<ProtectedRoute require="freelancer"><FreelancerOrders /></ProtectedRoute>} />
              <Route path="/freelancer/order/:orderId" element={<ProtectedRoute require="freelancer"><FreelancerOrderDetails /></ProtectedRoute>} />
              <Route path="/freelancer/messages" element={<ProtectedRoute require="freelancer"><FreelancerMessages /></ProtectedRoute>} />
              <Route path="/freelancer/deliver" element={<ProtectedRoute require="freelancer"><FreelancerDeliverWork /></ProtectedRoute>} />
              <Route path="/freelancer/delivery-success/:orderId" element={<ProtectedRoute require="freelancer"><DeliverySuccess /></ProtectedRoute>} />
              <Route path="/freelancer/wallet" element={<ProtectedRoute require="freelancer"><FreelancerWallet /></ProtectedRoute>} />
              <Route path="/freelancer/wallet/withdraw" element={<ProtectedRoute require="freelancer"><FreelancerWithdraw /></ProtectedRoute>} />
              <Route path="/freelancer/payouts" element={<ProtectedRoute require="freelancer"><FreelancerPayouts /></ProtectedRoute>} />
              <Route path="/freelancer/help" element={<ProtectedRoute require="freelancer"><FreelancerHelp /></ProtectedRoute>} />
              <Route path="/freelancer/settings" element={<ProtectedRoute require="freelancer"><FreelancerSettings /></ProtectedRoute>} />
              <Route path="/freelancer/profile" element={<ProtectedRoute require="freelancer"><FreelancerProfile /></ProtectedRoute>} />
              <Route path="/freelancer/verify" element={<ProtectedRoute require="freelancer"><FreelancerVerify /></ProtectedRoute>} />

              {/* Public freelancer profile — MUST stay after the static /freelancer/* routes */}
              <Route path="/freelancer/:username" element={<FreelancerProfilePage />} />

              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<ProtectedRoute require="buyer"><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/buyer/browse" element={<ProtectedRoute require="buyer"><BuyerBrowse /></ProtectedRoute>} />
              <Route path="/buyer/orders" element={<ProtectedRoute require="buyer"><BuyerOrders /></ProtectedRoute>} />
              <Route path="/buyer/messages" element={<ProtectedRoute require="buyer"><BuyerMessages /></ProtectedRoute>} />
              <Route path="/buyer/payments" element={<ProtectedRoute require="buyer"><BuyerPayments /></ProtectedRoute>} />
              <Route path="/buyer/help" element={<ProtectedRoute require="buyer"><BuyerHelp /></ProtectedRoute>} />
              <Route path="/buyer/settings" element={<ProtectedRoute require="buyer"><BuyerSettings /></ProtectedRoute>} />
              <Route path="/buyer/order/:orderId" element={<ProtectedRoute require="buyer"><BuyerOrderDetails /></ProtectedRoute>} />
              <Route path="/buyer/orders/:orderId" element={<ProtectedRoute require="buyer"><BuyerOrderDetails /></ProtectedRoute>} />
              <Route path="/buyer/order/:orderId/requirements" element={<ProtectedRoute require="buyer"><SubmitRequirements /></ProtectedRoute>} />
              <Route path="/buyer/orders/:orderId/requirements" element={<ProtectedRoute require="buyer"><SubmitRequirements /></ProtectedRoute>} />

              {/* Legal Routes */}
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />

              {/* Public account/data deletion request page (Google Play requirement) */}
              <Route path="/delete-account" element={<DeleteAccount />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminDashboard />} />

              {/* Private Founder Dashboard — access decided by the `founder` role in user_roles */}
              <Route path="/founders" element={<FounderDashboard />} />
              <Route path="/founders/*" element={<FounderDashboard />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            <CookieConsentManager />
          </BrowserRouter>
        </TooltipProvider>
        </PresenceProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
