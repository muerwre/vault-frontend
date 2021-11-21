import { INode } from '~/redux/types';
import { FileUploader } from '~/utils/hooks/useFileUploader';
import { useCallback, useEffect, useRef } from 'react';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { object } from 'yup';
import { useDispatch } from 'react-redux';
import { nodeSubmitLocal } from '~/redux/node/actions';
import { keys } from 'ramda';

const validationSchema = object().shape({});

const onSuccess = ({ resetForm, setStatus, setSubmitting, setErrors }: FormikHelpers<INode>) => (
  e?: string,
  errors?: Record<string, string>
) => {
  setSubmitting(false);

  if (e) {
    setStatus(e);
    return;
  }

  if (errors && keys(errors).length) {
    setErrors(errors);
    return;
  }

  if (resetForm) {
    resetForm();
  }
};

export const useNodeFormFormik = (
  values: INode,
  uploader: FileUploader,
  stopEditing: () => void
) => {
  const dispatch = useDispatch();
  const onSubmit = useCallback(
    (values: INode, helpers: FormikHelpers<INode>) => {
      helpers.setSubmitting(true);
      dispatch(nodeSubmitLocal(values, onSuccess(helpers)));
    },
    [dispatch]
  );

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

  useEffect(
    () => {
      formik.setFieldValue('files', uploader.files);
    },
    // because it breaks files logic
    // eslint-disable-next-line
    [uploader.files, formik.setFieldValue]
  );

  return formik;
};

export const useNodeFormContext = () => useFormikContext<INode>();
