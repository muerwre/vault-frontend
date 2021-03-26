import { IComment, INode } from '~/redux/types';
import { FileUploader } from '~/utils/hooks/fileUploader';
import { useCallback, useRef } from 'react';
import { useFormik, useFormikContext } from 'formik';
import { object } from 'yup';

const validationSchema = object().shape({});

export const useNodeFormFormik = (
  values: INode,
  uploader: FileUploader,
  stopEditing: () => void
) => {
  const onSubmit = useCallback(console.log, []);
  const { current: initialValues } = useRef(values);

  const onReset = useCallback(() => {
    uploader.setFiles([]);

    if (stopEditing) stopEditing();
  }, [uploader, stopEditing]);

  return useFormik<INode>({
    initialValues,
    validationSchema,
    onSubmit,
    onReset,
    initialStatus: '',
    validateOnChange: true,
  });
};

export const useNodeFormContext = () => useFormikContext<INode>();
