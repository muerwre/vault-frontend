import { INode } from '~/redux/types';
import { FileUploader } from '~/hooks/data/useFileUploader';
import { useCallback, useRef } from 'react';
import { FormikConfig, FormikHelpers, useFormik, useFormikContext } from 'formik';
import { object } from 'yup';
import { keys } from 'ramda';
import { showErrorToast } from '~/utils/errors/showToast';

const validationSchema = object().shape({});

const afterSubmit = ({ resetForm, setSubmitting, setErrors }: FormikHelpers<INode>) => (
  e?: string,
  errors?: Record<string, string>
) => {
  setSubmitting(false);

  if (e) {
    showErrorToast(e);
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
  stopEditing: () => void,
  sendSaveRequest: (node: INode) => Promise<unknown>
) => {
  const { current: initialValues } = useRef(values);

  const onReset = useCallback(() => {
    uploader.setFiles([]);

    if (stopEditing) stopEditing();
  }, [uploader, stopEditing]);

  const onSubmit = useCallback<FormikConfig<INode>['onSubmit']>(
    async (values, helpers) => {
      try {
        await sendSaveRequest({ ...values, files: uploader.files });
        afterSubmit(helpers)();
      } catch (error) {
        afterSubmit(helpers)(error?.response?.data?.error, error?.response?.data?.errors);
      }
    },
    [sendSaveRequest, uploader.files]
  );

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
