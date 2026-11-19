import {
  ChangeEvent,
  ComponentType,
  FC,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import autosize from 'autosize';
import classNames from 'classnames';

import { InputWrapper } from '~/components/input/InputWrapper';

import type { MarkdownEditorViewProps } from './components/MarkdownEditorView';
import styles from './styles.module.scss';
import { MarkdownEditorProps } from './types';
import { createTextareaFormatter } from './utils';

export type { MarkdownEditorProps, MarkdownFormatter } from './types';

type View = ComponentType<MarkdownEditorViewProps>;

let loadedView: View | undefined;

const loadView = (): Promise<View> =>
  import('./components/MarkdownEditorView').then(
    ({ MarkdownEditorView }) => (loadedView = MarkdownEditorView),
  );

interface Props extends MarkdownEditorProps {
  /**
   * Loads the editor only when the user is about to type: on hover, touch
   * or focus. Otherwise it loads on mount.
   */
  loadOnIntent?: boolean;
  /** Shown inside the input, above the text: formatting buttons, say. */
  header?: ReactNode;
}

/**
 * Markdown input with live preview. Its code loads on demand; until then, and
 * on the server, it is a plain textarea, so typing never waits for it.
 */
const MarkdownEditor: FC<Props> = ({ loadOnIntent, header, ...props }) => {
  const { value, onChange, onSubmit, onPaste, onFormatter, minRows } = props;

  const [view, setView] = useState<{ component: View }>();
  const [handoff, setHandoff] = useState<
    Pick<MarkdownEditorViewProps, 'focusOnMount' | 'initialSelection'>
  >({});
  const textarea = useRef<HTMLTextAreaElement>(null);
  const isLoading = useRef(false);
  const [focused, setFocused] = useState(false);

  const latest = useRef({ onChange, onFormatter });
  latest.current = { onChange, onFormatter };

  const load = useCallback(() => {
    if (isLoading.current) {
      return;
    }

    isLoading.current = true;

    (loadedView ? Promise.resolve(loadedView) : loadView())
      .then((component) => {
        const element = textarea.current;

        if (!element) {
          return;
        }

        setHandoff({
          focusOnMount: document.activeElement === element,
          initialSelection: [element.selectionStart, element.selectionEnd],
        });
        setView({ component });
      })
      // the textarea keeps working if the chunk fails to load
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loadOnIntent) {
      load();
    }
  }, [load, loadOnIntent]);

  // toolbars work with the textarea until the editor replaces it
  useEffect(() => {
    if (view || !textarea.current) {
      return;
    }

    latest.current.onFormatter?.(
      createTextareaFormatter(textarea.current, (it) =>
        latest.current.onChange(it),
      ),
    );
  }, [view]);

  useEffect(() => {
    const element = textarea.current;

    if (view || !element) {
      return;
    }

    autosize(element);
    return () => autosize.destroy(element);
  }, [view]);

  useEffect(() => {
    if (textarea.current) {
      autosize.update(textarea.current);
    }
  }, [value]);

  const onKeyDown = useCallback(
    ({ ctrlKey, metaKey, key }: KeyboardEvent) => {
      if ((ctrlKey || metaKey) && key === 'Enter') {
        onSubmit?.();
      }
    },
    [onSubmit],
  );

  const intent = loadOnIntent ? load : undefined;

  const onFocus = useCallback(() => {
    setFocused(true);
    intent?.();
  }, [intent]);

  // the header's buttons are part of the input, so moving to them keeps it
  // focused
  const onBlur = useCallback(({ currentTarget, relatedTarget }: FocusEvent) => {
    if (!currentTarget.contains(relatedTarget as Node | null)) {
      setFocused(false);
    }
  }, []);

  return (
    <div
      className={classNames(styles.wrap, props.className)}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={intent}
      onTouchStart={intent}
    >
      <InputWrapper focused={focused} notEmpty={!!value}>
        {!!header && <div className={styles.header}>{header}</div>}

        <div className={styles.body}>
          {view ? (
            <view.component {...props} {...handoff} />
          ) : (
            <textarea
              ref={textarea}
              value={value}
              onChange={({ target }: ChangeEvent<HTMLTextAreaElement>) =>
                onChange(target.value)
              }
              placeholder={props.placeholder}
              disabled={props.disabled}
              onKeyDown={onKeyDown}
              onPaste={(event) => onPaste?.(event.nativeEvent)}
              className={styles.textarea}
              style={{ minHeight: (minRows ?? 3) * 20 }}
            />
          )}
        </div>
      </InputWrapper>
    </div>
  );
};

export { MarkdownEditor };
