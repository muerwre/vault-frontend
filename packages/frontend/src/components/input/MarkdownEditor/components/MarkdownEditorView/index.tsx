import '@atomic-editor/editor/styles.css';

import { CSSProperties, FC, useEffect, useRef, useState } from 'react';

import { Annotation, Compartment, EditorState, Prec } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import classNames from 'classnames';

import styles from '../../styles.module.scss';
import { MarkdownEditorProps } from '../../types';

import { vaultEditorExtensions } from './extensions';
import { createViewFormatter } from './formatter';

export interface MarkdownEditorViewProps extends MarkdownEditorProps {
  /** Takes over focus and caret from the textarea it replaces. */
  focusOnMount?: boolean;
  initialSelection?: [number, number];
}

/** Marks changes that came from the value prop, not from the user. */
const external = Annotation.define<boolean>();

const editable = (disabled?: boolean) => [
  EditorView.editable.of(!disabled),
  EditorState.readOnly.of(!!disabled),
];

/**
 * Markdown editor with live preview: formatting renders as you type, the
 * text stays markdown. Loaded lazily through MarkdownEditor.
 */
const MarkdownEditorView: FC<MarkdownEditorViewProps> = ({
  value,
  onChange,
  placeholder: placeholderText = '',
  minRows = 3,
  disabled,
  onSubmit,
  onPaste,
  onFormatter,
  focusOnMount,
  initialSelection,
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView>();
  const editableCompartment = useRef(new Compartment());

  // the view lives across renders, so it calls the latest props through refs
  const callbacks = useRef({ onChange, onSubmit, onPaste, onFormatter });
  callbacks.current = { onChange, onSubmit, onPaste, onFormatter };

  useEffect(() => {
    if (!root.current) {
      return;
    }

    const instance = new EditorView({
      parent: root.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          vaultEditorExtensions(),
          placeholder(placeholderText),
          editableCompartment.current.of(editable(disabled)),
          Prec.high(
            keymap.of([
              {
                key: 'Mod-b',
                run: (it) => {
                  createViewFormatter(it).wrap('**', '**');
                  return true;
                },
              },
              {
                key: 'Mod-i',
                run: (it) => {
                  createViewFormatter(it).wrap('*', '*');
                  return true;
                },
              },
              {
                key: 'Mod-Enter',
                run: () => {
                  callbacks.current.onSubmit?.();
                  return !!callbacks.current.onSubmit;
                },
              },
            ]),
          ),
          EditorView.domEventHandlers({
            paste: (event) => {
              callbacks.current.onPaste?.(event);
              return false;
            },
          }),
          EditorView.updateListener.of((update) => {
            const isExternal = update.transactions.some((it) =>
              it.annotation(external),
            );

            if (update.docChanged && !isExternal) {
              callbacks.current.onChange(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    if (focusOnMount) {
      const length = instance.state.doc.length;
      const [anchor, head] = (initialSelection ?? [length, length]).map((it) =>
        Math.min(it, length),
      );

      instance.dispatch({ selection: { anchor, head } });
      instance.focus();
    }

    setView(instance);

    return () => instance.destroy();
    // the view is created once; later prop changes are synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // value changed outside, e.g. the form was reset after submit
  useEffect(() => {
    if (!view || value === view.state.doc.toString()) {
      return;
    }

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      annotations: external.of(true),
    });
  }, [view, value]);

  useEffect(() => {
    view?.dispatch({
      effects: editableCompartment.current.reconfigure(editable(disabled)),
    });
  }, [view, disabled]);

  useEffect(() => {
    if (!view) {
      return;
    }

    callbacks.current.onFormatter?.(createViewFormatter(view));
    return () => callbacks.current.onFormatter?.(null);
  }, [view]);

  return (
    <div
      ref={root}
      className={classNames('atomic-cm-editor', styles.editor)}
      style={{ '--min-height': `${minRows * 20}px` } as CSSProperties}
    />
  );
};

export { MarkdownEditorView };
