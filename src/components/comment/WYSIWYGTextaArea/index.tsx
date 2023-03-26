import React, { FC, useState } from 'react';

import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewOptionsCtx,
} from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { commonmark } from '@milkdown/preset-commonmark';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';

import styles from './styles.module.scss';

interface MilkdownEditorProps {
  value?: string;
  onChange?: (val: string) => void;
}

const MilkdownEditor: FC<MilkdownEditorProps> = ({ value = '', onChange }) => {
  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, value);
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            onChange?.(markdown);
          });

          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            attributes: {
              class: styles.editor,
              spellcheck: 'false',
            },
          }));
        })
        .use(commonmark)
        .use(listener),
    [onChange, value],
  );

  return <Milkdown />;
};

const WYSIWYGTextaArea: FC<MilkdownEditorProps> = ({ value, onChange }) => (
  <MilkdownProvider>
    <MilkdownEditor value={value} onChange={onChange} />
  </MilkdownProvider>
);
export { WYSIWYGTextaArea };
