import RoleRegistration from '@/components/auth/RoleRegistration';
import SEO from '@/components/SEO';

const BuyerRegister = () => (
  <>
    <SEO title="Create Your Buyer Account | FIVESOM" description="Complete your FIVESOM buyer account and start hiring skilled freelancers." canonical="/register/buyer" noindex />
    <RoleRegistration role="buyer" />
  </>
);

export default BuyerRegister;