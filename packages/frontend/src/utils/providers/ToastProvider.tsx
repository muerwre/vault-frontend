import { CSSProperties } from 'react';

import { Toaster } from 'react-hot-toast';

const containerStyle: CSSProperties = {
  top: 10,
  left: 10,
  bottom: 10,
  right: 10,
  textAlign: 'center',
};

export const ToastProvider = () => <Toaster containerStyle={containerStyle} />;
