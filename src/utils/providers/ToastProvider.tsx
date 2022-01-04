import { Toaster } from 'react-hot-toast';
import React from 'react';

const containerStyle = {
  top: 10,
  left: 10,
  bottom: 10,
  right: 10,
};

export const ToastProvider = () => <Toaster containerStyle={containerStyle} />;
