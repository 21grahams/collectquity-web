import { useLocation, useNavigate } from 'react-router';

/** Back to the previous screen, or to the start when this one was opened straight from a link. */
export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();

  return () => (location.key === 'default' ? navigate('/', { replace: true }) : navigate(-1));
}
