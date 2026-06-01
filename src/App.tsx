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
import BuyerRegister from "./pages/BuyerRegister";
import FreelancerRegister from "./pages/FreelancerRegister";
import AuthCallback from "./pages/AuthCallback";
import RoleSelection from "./pages/RoleSelection";
import CompleteProfile from "./pages/CompleteProfile";
import CreateGig from "./pages/CreateGig";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import FreelancerGigs from "./pages/freelancer/FreelancerGigs";
import FreelancerOrders from "./pages/freelancer/FreelancerOrders";
import FreelancerMessages from "./pages/freelancer/FreelancerMessages";
import FreelancerDeliverWork from "./pages/freelancer/FreelancerDeliverWork";
import FreelancerOrderDetails from "./pages/freelancer/FreelancerOrderDetails";
import FreelancerWallet from "./pages/freelancer/FreelancerWallet";
import FreelancerWithdraw from "./pages/freelancer/FreelancerWithdraw";
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
import SellerPayment from "./pages/SellerPayment";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ThemeProvider } from "./components/ThemeProvider";
import PresenceTracker from "./components/presence/PresenceTracker";
import RoleGuard from "./components/RoleGuard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PresenceTracker />
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
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/select-role" element={<RoleSelection />} />
              <Route path="/complete-profile/:role" element={<CompleteProfile />} />
              <Route path="/seller/payment" element={<RoleGuard allow="freelancer"><SellerPayment /></RoleGuard>} />
              <Route path="/payment" element={<RoleGuard allow="buyer"><PaymentPage /></RoleGuard>} />
              <Route path="/create-gig" element={<RoleGuard allow="freelancer"><CreateGig /></RoleGuard>} />
              <Route path="/edit-gig/:gigId" element={<RoleGuard allow="freelancer"><CreateGig /></RoleGuard>} />
              
              {/* Public Freelancer Profile Route */}
              <Route path="/profile/:freelancerId" element={<FreelancerProfilePage />} />
              
              {/* Freelancer Routes */}
              <Route path="/freelancer/dashboard" element={<RoleGuard allow="freelancer"><FreelancerDashboard /></RoleGuard>} />
              <Route path="/freelancer/gigs" element={<RoleGuard allow="freelancer"><FreelancerGigs /></RoleGuard>} />
              <Route path="/freelancer/orders" element={<RoleGuard allow="freelancer"><FreelancerOrders /></RoleGuard>} />
              <Route path="/freelancer/order/:orderId" element={<RoleGuard allow="freelancer"><FreelancerOrderDetails /></RoleGuard>} />
              <Route path="/freelancer/messages" element={<RoleGuard allow="freelancer"><FreelancerMessages /></RoleGuard>} />
              <Route path="/freelancer/deliver" element={<RoleGuard allow="freelancer"><FreelancerDeliverWork /></RoleGuard>} />
              <Route path="/freelancer/wallet" element={<RoleGuard allow="freelancer"><FreelancerWallet /></RoleGuard>} />
              <Route path="/freelancer/wallet/withdraw" element={<RoleGuard allow="freelancer"><FreelancerWithdraw /></RoleGuard>} />
              <Route path="/freelancer/help" element={<RoleGuard allow="freelancer"><FreelancerHelp /></RoleGuard>} />
              <Route path="/freelancer/settings" element={<RoleGuard allow="freelancer"><FreelancerSettings /></RoleGuard>} />
              <Route path="/freelancer/profile" element={<RoleGuard allow="freelancer"><FreelancerProfile /></RoleGuard>} />
              <Route path="/freelancer/verify" element={<RoleGuard allow="freelancer"><FreelancerVerify /></RoleGuard>} />
              
              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<RoleGuard allow="buyer"><BuyerDashboard /></RoleGuard>} />
              <Route path="/buyer/browse" element={<RoleGuard allow="buyer"><BuyerBrowse /></RoleGuard>} />
              <Route path="/buyer/orders" element={<RoleGuard allow="buyer"><BuyerOrders /></RoleGuard>} />
              <Route path="/buyer/messages" element={<RoleGuard allow="buyer"><BuyerMessages /></RoleGuard>} />
              <Route path="/buyer/payments" element={<RoleGuard allow="buyer"><BuyerPayments /></RoleGuard>} />
              <Route path="/buyer/help" element={<RoleGuard allow="buyer"><BuyerHelp /></RoleGuard>} />
              <Route path="/buyer/settings" element={<RoleGuard allow="buyer"><BuyerSettings /></RoleGuard>} />
              <Route path="/buyer/order/:orderId" element={<RoleGuard allow="buyer"><BuyerOrderDetails /></RoleGuard>} />
              <Route path="/buyer/orders/:orderId" element={<RoleGuard allow="buyer"><BuyerOrderDetails /></RoleGuard>} />
              <Route path="/buyer/order/:orderId/requirements" element={<RoleGuard allow="buyer"><SubmitRequirements /></RoleGuard>} />
              <Route path="/buyer/orders/:orderId/requirements" element={<RoleGuard allow="buyer"><SubmitRequirements /></RoleGuard>} />
              <Route path="/vip-checkout" element={<RoleGuard allow="freelancer"><VipCheckout /></RoleGuard>} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
