import * as React from 'react';
import styles from './styles.module.scss';

interface ITextInputProps {
  type?: 'text' | 'password';
  placeholder?: string;
  label?: string;
  value?: string;

  onChange: React.ChangeEventHandler;
}

export const TextInput: React.FunctionComponent<ITextInputProps> = ({
  type = 'text',
  placeholder = '',
  label,
  onChange = () => {},
  value = '',
}) => (
  <div
    className={styles.wrapper}
  >
    <div className={styles.container}>
      {
        label
        && <div className={styles.label}>{label}</div>
      }
      <input
        placeholder={placeholder}
        className={styles.input}
        type={type}
        onChange={onChange}
        value={value}
      />
    </div>
  </div>
);
