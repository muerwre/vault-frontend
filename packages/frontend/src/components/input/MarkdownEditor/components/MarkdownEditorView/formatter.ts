import { EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

import { MarkdownFormatter } from '../../types';
import { getHeadingChange } from '../../utils';

export const createViewFormatter = (view: EditorView): MarkdownFormatter => ({
  wrap: (prefix, suffix = '') => {
    view.dispatch(
      view.state.changeByRange((range) => ({
        changes: {
          from: range.from,
          to: range.to,
          insert: prefix + view.state.sliceDoc(range.from, range.to) + suffix,
        },
        range: EditorSelection.range(
          range.from + prefix.length,
          range.to + prefix.length,
        ),
      })),
      { scrollIntoView: true, userEvent: 'input' },
    );
    view.focus();
  },

  setHeading: (level) => {
    const { doc, selection } = view.state;
    const lines = new Set<number>();

    selection.ranges.forEach(({ from, to }) => {
      for (let n = doc.lineAt(from).number; n <= doc.lineAt(to).number; n++) {
        lines.add(n);
      }
    });

    const changes = Array.from(lines).map((n) => {
      const line = doc.line(n);
      const { length, insert } = getHeadingChange(line.text, level);

      return { from: line.from, to: line.from + length, insert };
    });

    view.dispatch({ changes, scrollIntoView: true, userEvent: 'input' });
    view.focus();
  },

  focus: () => view.focus(),
});
