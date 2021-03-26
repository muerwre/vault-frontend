import { INode } from '~/redux/types';
import { FileUploader } from '~/utils/hooks/fileUploader';
import { useCallback, useEffect, useRef } from 'react';
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

  const formik = useFormik<INode>({
    initialValues,
    validationSchema,
    onSubmit,
    onReset,
    initialStatus: '',
    validateOnChange: true,
  });

  useEffect(() => {
    formik.setFieldValue('files', uploader.files);
  }, [formik.setFieldValue, uploader.files]);

  return formik;
};

export const useNodeFormContext = () => useFormikContext<INode>();
