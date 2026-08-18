import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import GigDetails from "./pages/GigDetails";
import HowItWorks from "./pages/HowItWorks";
import Docs from "./pages/Docs";
import About from "./pages/About";
import Vip from "./pages/Vip";
import VipCheckout from "./pages/VipCheckout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import BuyerRegister from "./pages/BuyerRegister";
import FreelancerRegister from "./pages/FreelancerRegister";
import AuthCallback from "./pages/AuthCallback";
import RoleSelection from "./pages/RoleSelection";
import UpgradeRole from "./pages/UpgradeRole";
import CompleteProfile from "./pages/CompleteProfile";
import CreateGig from "./pages/CreateGig";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import FreelancerGigs from "./pages/freelancer/FreelancerGigs";
import FreelancerOrders from "./pages/freelancer/FreelancerOrders";
import FreelancerMessages from "./pages/freelancer/FreelancerMessages";
import FreelancerDeliverWork from "./pages/freelancer/FreelancerDeliverWork";
import DeliverySuccess from "./pages/freelancer/DeliverySuccess";
import FreelancerOrderDetails from "./pages/freelancer/FreelancerOrderDetails";
import FreelancerWallet from "./pages/freelancer/FreelancerWallet";
import FreelancerWithdraw from "./pages/freelancer/FreelancerWithdraw";
import FreelancerPayouts from "./pages/freelancer/FreelancerPayouts";
import FreelancerHelp from "./pages/freelancer/FreelancerHelp";
import FreelancerSettings from "./pages/freelancer/FreelancerSettings";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import FreelancerVerify from "./pages/freelancer/FreelancerVerify";
import FreelancerProfilePage from "./pages/FreelancerProfilePage";
import BuyerBrowse from "./pages/buyer/BuyerBrowse";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import BuyerMessages from "./pages/buyer/BuyerMessages";
import BuyerPayments from "./pages/buyer/BuyerPayments";
import BuyerHelp from "./pages/buyer/BuyerHelp";
import BuyerSettings from "./pages/buyer/BuyerSettings";
import BuyerOrderDetails from "./pages/buyer/BuyerOrderDetails";
import SubmitRequirements from "./pages/buyer/SubmitRequirements";
import PaymentSuccess from "./pages/buyer/PaymentSuccess";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";
import MessagesRedirect from "./pages/MessagesRedirect";
import Inbox from "./pages/Inbox";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FounderDashboard from "./pages/founder/FounderDashboard";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import { ThemeProvider } from "./components/ThemeProvider";
import PresenceProvider from "./components/presence/PresenceProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/gig/:slug" element={<GigDetails />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/about" element={<About />} />
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

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminDashboard />} />

              {/* Private Founder Dashboard — access decided by the `founder` role in user_roles */}
              <Route path="/founders" element={<FounderDashboard />} />
              <Route path="/founders/*" element={<FounderDashboard />} />

              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </PresenceProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
