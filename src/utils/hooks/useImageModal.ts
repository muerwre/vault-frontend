import { useCallback } from 'react';
import { IFile } from '~/redux/types';
import { modalShowPhotoswipe } from '~/redux/modal/actions';
import { useDispatch } from 'react-redux';

export const useImageModal = () => {
  const dispatch = useDispatch();

  return useCallback(
    (images: IFile[], index: number) => dispatch(modalShowPhotoswipe(images, index)),
    [dispatch]
  );
};
