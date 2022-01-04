import React from 'react';
import toast from 'react-hot-toast';
import styles from './styles.module.scss';
import { ToastOptions } from 'react-hot-toast/dist/core/types';
import classNames from 'classnames';
import { isTablet } from '~/constants/dom';

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

export const hideToast = (id: string) => toast.dismiss(id);
