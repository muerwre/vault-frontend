import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import { IInputTextProps } from '~/redux/types';
import { useTranslatedError } from '~/hooks/data/useTranslatedError';
import { InputWrapper } from '~/components/input/InputWrapper';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { useFocusEvent } from '~/hooks/dom/useFocusEvent';

const InputText: FC<IInputTextProps> = ({
  className = '',
  handler,
  required = false,
  title,
  error,
  value = '',
  suffix,
  ...props
}) => {
  const { focused, onFocus, onBlur } = useFocusEvent();
  const [revealed, setRevealed] = useState(false);

  const onInput = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      if (!handler) {
        return;
      }

      handler(target.value);
    },
    [handler]
  );

  const toggleRevealed = useCallback(() => setRevealed(!revealed), [setRevealed, revealed]);

  const translatedError = useTranslatedError(error);

  const type = props.type === 'password' && revealed ? 'text' : props.type;

  return (
    <InputWrapper title={title} error={translatedError} focused={focused} notEmpty={!!value}>
      <div className={classNames(styles.input, { [styles.has_error]: !!error })}>
        <input
          {...props}
          onFocus={onFocus}
          onBlur={onBlur}
          type={type}
          onChange={onInput}
          className={classNames(styles.input_text, className)}
          value={value || ''}
        />

        {(!!suffix || props.type === 'password') && (
          <div className={styles.suffix}>
            {suffix}
            {props.type === 'password' && (
              <Icon icon="eye" onClick={toggleRevealed} className={styles.reveal} />
            )}
          </div>
        )}
      </div>
    </InputWrapper>
  );
};

export { InputText };
