import RoleRegistration from '@/components/auth/RoleRegistration';
import SEO from '@/components/SEO';

const FreelancerRegister = () => (
  <>
    <SEO title="Create Your Freelancer Account | FIVESOM" description="Complete your FIVESOM freelancer profile and start selling your professional skills." canonical="/register/freelancer" noindex />
    <RoleRegistration role="freelancer" />
  </>
);

export default FreelancerRegister;