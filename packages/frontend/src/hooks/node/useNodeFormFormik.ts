import { useCallback, useRef } from 'react';

import {
  FormikConfig,
  FormikHelpers,
  useFormik,
  useFormikContext,
} from 'formik';
import { object } from 'yup';

import { INode } from '~/types';
import { Uploader } from '~/utils/context/UploaderContextProvider';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';

const validationSchema = object().shape({});

const afterSubmit =
  ({ resetForm, setSubmitting, setErrors }: FormikHelpers<INode>) =>
  (error?: unknown) => {
    setSubmitting(false);

    if (error) {
      showErrorToast(error);
      return;
    }

    if (getValidationErrors(error)) {
      setErrors(getValidationErrors(error)!);
      return;
    }

    if (resetForm) {
      resetForm();
    }
  };

export const useNodeFormFormik = (
  values: INode,
  uploader: Uploader,
  stopEditing: () => void,
  sendSaveRequest: (node: INode) => Promise<unknown>,
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
        afterSubmit(helpers)(error);
      }
    },
    [sendSaveRequest, uploader.files],
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
