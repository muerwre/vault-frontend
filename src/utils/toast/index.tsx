import React from 'react';

import classNames from 'classnames';
import toast from 'react-hot-toast';
import { ToastOptions } from 'react-hot-toast/dist/core/types';

import { isTablet } from '~/constants/dom';

import styles from './styles.module.scss';

const defaultOptions: ToastOptions = {
  icon: null,
  duration: 3000,
  position: isTablet() ? 'top-center' : 'bottom-center',
};

export const showToastError = (message: string) =>
  toast.error(t => <span onClick={() => toast.dismiss(t.id)}>{message}</span>, {
    ...defaultOptions,
    className: classNames(styles.toast, styles.error),
  });

export const showToastSuccess = (message: string) =>
  toast.success(t => <span onClick={() => toast.dismiss(t.id)}>{message}</span>, {
    ...defaultOptions,
    className: classNames(styles.toast, styles.success),
  });

export const showToastInfo = (message: string) =>
  toast.success(t => <span onClick={() => toast.dismiss(t.id)}>{message}</span>, {
    ...defaultOptions,
    className: classNames(styles.toast, styles.info),
  });

export const hideToast = (id: string) => toast.dismiss(id);
