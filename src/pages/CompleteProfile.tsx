import { Navigate, useParams } from 'react-router-dom';
import RoleRegistration from '@/components/auth/RoleRegistration';

const CompleteProfile = () => {
  const { role } = useParams<{ role: string }>();

  if (role !== 'buyer' && role !== 'freelancer') {
    return <Navigate to="/select-role" replace />;
  }

  // Legacy links now use the same atomic, database-authoritative completion
  // flow as current registration. There is no second partial-save path.
  return <RoleRegistration role={role} />;
};

export default CompleteProfile;
