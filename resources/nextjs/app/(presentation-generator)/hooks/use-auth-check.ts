import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useAuthCheck = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { presentationData } = useSelector((state: RootState) => state.presentationGeneration);

  const isAuthorized = user?.id === presentationData?.presentation?.user_id;

  return {
    isAuthorized,
  };
}; 