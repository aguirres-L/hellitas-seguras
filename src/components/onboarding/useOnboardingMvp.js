import { useNavigate } from 'react-router-dom';

/**
 * Navegación para la landing de onboarding MVP (QR → explicación → registro).
 */
export function useOnboardingMvp() {
  const navigate = useNavigate();

  const onIrAInicio = () => {
    navigate('/');
  };

  return { onIrAInicio };
}
