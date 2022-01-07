import React, {
  ChangeEvent,
  DetailedHTMLProps,
  forwardRef,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useState
} from "react";
import classNames from "classnames";
import autosize from "autosize";
import styles from "./styles.module.scss";

import { InputWrapper } from "~/components/input/InputWrapper";
import { useForwardRef } from "~/hooks/dom/useForwardRef";

type IProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & {
  minRows?: number;
  maxRows?: number;
  error?: string;
  value: string;
  className?: string;
  handler: (value: string) => void;
  title?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, IProps>(
  (
    {
      placeholder,
      error,
      minRows = 3,
      maxRows = 30,
      className,
      handler,
      title = '',
      value,
      ...props
    },
    forwardRef
  ) => {
    const ref = useForwardRef(forwardRef);
    const [focused, setFocused] = useState(false);

    const onInput = useCallback(
      ({ target }: ChangeEvent<HTMLTextAreaElement>) => handler(target.value),
      [handler]
    );

    const onFocus = useCallback(() => setFocused(true), [setFocused]);
    const onBlur = useCallback(() => setFocused(false), [setFocused]);

    useEffect(() => {
      if (!ref?.current) return;
      autosize(ref?.current);
      return () => autosize.destroy(ref);
    }, [ref]);

    useEffect(() => {
      if (!ref?.current) return;

      autosize.update(ref);
    }, [ref, value, forwardRef]);

    return (
      <InputWrapper title={title} error={error} focused={focused} notEmpty={!!value}>
        <textarea
          {...props}
          ref={ref}
          style={{
            ...props.style,
            minHeight: minRows * 20,
          }}
          value={value || ''}
          placeholder={placeholder}
          className={classNames(styles.textarea, className)}
          onChange={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </InputWrapper>
    );
  }
);

export { Textarea };
