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
import AdminDashboard from "./pages/admin/AdminDashboard";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import { ThemeProvider } from "./components/ThemeProvider";
import PresenceProvider from "./components/presence/PresenceProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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
              <Route path="/gig/:id" element={<GigDetails />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/vip" element={<Vip />} />
              <Route path="/vip-checkout" element={<VipCheckout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/buyer" element={<BuyerRegister />} />
              <Route path="/register/freelancer" element={<FreelancerRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              <Route path="/select-role" element={<RoleSelection />} />
              <Route path="/become-buyer" element={<UpgradeRole role="buyer" />} />
              <Route path="/become-freelancer" element={<UpgradeRole role="freelancer" />} />
              <Route path="/complete-profile/:role" element={<CompleteProfile />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/buyer/payment-success" element={<PaymentSuccess />} />
              <Route path="/create-gig" element={<CreateGig />} />
              <Route path="/edit-gig/:gigId" element={<CreateGig />} />
              
              {/* Public Freelancer Profile Route */}
              <Route path="/profile/:freelancerId" element={<FreelancerProfilePage />} />
              
              {/* Freelancer Routes */}
              <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
              <Route path="/freelancer/gigs" element={<FreelancerGigs />} />
              <Route path="/freelancer/orders" element={<FreelancerOrders />} />
              <Route path="/freelancer/order/:orderId" element={<FreelancerOrderDetails />} />
              <Route path="/freelancer/messages" element={<FreelancerMessages />} />
              <Route path="/freelancer/deliver" element={<FreelancerDeliverWork />} />
              <Route path="/freelancer/delivery-success/:orderId" element={<DeliverySuccess />} />
              <Route path="/freelancer/wallet" element={<FreelancerWallet />} />
              <Route path="/freelancer/wallet/withdraw" element={<FreelancerWithdraw />} />
              <Route path="/freelancer/payouts" element={<FreelancerPayouts />} />
              <Route path="/freelancer/help" element={<FreelancerHelp />} />
              <Route path="/freelancer/settings" element={<FreelancerSettings />} />
              <Route path="/freelancer/profile" element={<FreelancerProfile />} />
              <Route path="/freelancer/verify" element={<FreelancerVerify />} />
              
              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/browse" element={<BuyerBrowse />} />
              <Route path="/buyer/orders" element={<BuyerOrders />} />
              <Route path="/buyer/messages" element={<BuyerMessages />} />
              <Route path="/buyer/payments" element={<BuyerPayments />} />
              <Route path="/buyer/help" element={<BuyerHelp />} />
              <Route path="/buyer/settings" element={<BuyerSettings />} />
              <Route path="/buyer/order/:orderId" element={<BuyerOrderDetails />} />
              <Route path="/buyer/orders/:orderId" element={<BuyerOrderDetails />} />
              <Route path="/buyer/order/:orderId/requirements" element={<SubmitRequirements />} />
              <Route path="/buyer/orders/:orderId/requirements" element={<SubmitRequirements />} />
              
              {/* Legal Routes */}
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              
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
