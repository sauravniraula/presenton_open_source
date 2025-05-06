import { useDispatch } from 'react-redux';
import { useAuthCheck } from './use-auth-check';
import { 
  addSlideBodyItem, 
  deleteSlideBodyItem, 
  updateSlideVariant,
  updateSlideImage,
  deleteSlideImage,
  
  // Import other slide operation actions as needed
} from '@/store/slices/presentationGeneration';

export const useSlideOperations = (slideIndex: number) => {
  const dispatch = useDispatch();
  const { isAuthorized } = useAuthCheck();

  const handleAddItem = ({item}: {item: any}) => {
    if (!isAuthorized) return;
    dispatch(addSlideBodyItem({ index: slideIndex, item }));
  };

  const handleDeleteItem = ({itemIndex}: {itemIndex: number}) => {
    if (!isAuthorized) return;
    dispatch(deleteSlideBodyItem({ index: slideIndex, itemIdx: itemIndex }));
  };

  const handleVariantChange = ({variant}: {variant: number}) => {
    if (!isAuthorized) return;
    dispatch(updateSlideVariant({ index: slideIndex, variant }));
  };

  const handleImageChange = ({imageUrl, imageIndex}: {imageUrl: string, imageIndex: number}) => {
    if (!isAuthorized) return;
    dispatch(updateSlideImage({ index: slideIndex, imageIdx: imageIndex, image: imageUrl }));
  };
  const handleDeleteImage = ({imageIndex}: {imageIndex: number}) => {
    if (!isAuthorized) return;
    dispatch(deleteSlideImage({ index: slideIndex, imageIdx: imageIndex }));
  };

 
  // Add other common slide operations here

  return {
    isAuthorized,
    handleAddItem,
    handleDeleteItem,
    handleVariantChange,
    handleImageChange,
    handleDeleteImage,
   
  };
}; 