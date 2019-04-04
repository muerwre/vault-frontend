import * as React from 'react';

const style = require('./style.scss');

interface ITextInputProps {
  type?: 'text' | 'password',
  placeholder?: string,
  label?: string,
  value?: string,

  onChange: React.ChangeEventHandler,
}

export const TextInput: React.FunctionComponent<ITextInputProps> = ({
  type = 'text',
  placeholder = '',
  label,
  onChange = () => {},
  value='',
}) => (
  <div
    className={style.wrapper}
  >
    {
      label &&
      <div className={style.label}>{label}</div>
    }
    <div className={style.container}>
      <input
        placeholder={placeholder}
        className={style.input}
        type={type}
        onChange={onChange}
        value={value}
      />
    </div>
  </div>
);
