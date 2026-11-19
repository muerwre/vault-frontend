import {
  atomicEditorTheme,
  atomicMarkdownSyntax,
  autoCloseCodeFence,
  extendEmphasisPair,
  imageBlocks,
  inlinePreview,
  startAsteriskList,
} from '@atomic-editor/editor';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { commonmarkLanguage, markdown } from '@codemirror/lang-markdown';
import {
  HighlightStyle,
  syntaxHighlighting,
  syntaxTree,
} from '@codemirror/language';
import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  drawSelection,
  dropCursor,
  EditorView,
  highlightSpecialChars,
  keymap,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { Tag } from '@lezer/highlight';
import {
  Autolink,
  InlineContext,
  MarkdownConfig,
  Strikethrough,
  TaskList,
} from '@lezer/markdown';

const SLASH = 47;
const STAR = 42;
const COLON = 58;

const commentTag = Tag.define();

/** End of the `//` comment starting at pos, or -1 when there is none. */
const lineCommentEnd = (cx: InlineContext, pos: number): number => {
  // `://` belongs to an url
  if (cx.char(pos + 1) !== SLASH || cx.char(pos - 1) === COLON) {
    return -1;
  }

  const newline = cx.slice(pos, cx.end).indexOf('\n');
  const end = newline === -1 ? cx.end : pos + newline;

  return end > pos + 2 ? end : -1;
};

/** End of the `/* *\/` comment starting at pos, or -1 when there is none. */
const blockCommentEnd = (cx: InlineContext, pos: number): number => {
  if (cx.char(pos + 1) !== STAR) {
    return -1;
  }

  const close = cx.slice(pos + 2, cx.end).indexOf('*/');

  return close === -1 ? -1 : pos + 2 + close + 2;
};

/**
 * Grey `// comments` and `/* comments *\/`, as the renderer shows them. The
 * comment is a leaf, so markdown inside it isn't parsed and its delimiters,
 * which also look like emphasis, stay visible.
 */
const vaultComments: MarkdownConfig = {
  defineNodes: [{ name: 'VaultComment', style: commentTag }],
  parseInline: [
    {
      name: 'VaultComment',
      before: 'Emphasis',
      parse: (cx, next, pos) => {
        if (next !== SLASH) {
          return -1;
        }

        const end = Math.max(lineCommentEnd(cx, pos), blockCommentEnd(cx, pos));

        return end === -1
          ? -1
          : cx.addElement(cx.elt('VaultComment', pos, end));
      },
    },
  ],
};

/**
 * Markdown limited to what the renderer outputs: CommonMark with
 * strikethrough, task lists and autolinks. No tables, highlights, sub- and
 * superscripts.
 */
const vaultMarkdown = () =>
  markdown({
    base: commonmarkLanguage,
    extensions: [Strikethrough, TaskList, Autolink, vaultComments],
  });

const vaultHighlight = syntaxHighlighting(
  HighlightStyle.define([{ tag: commentTag, class: 'cm-vault-comment' }]),
);

const imageSourceLine = Decoration.line({ class: 'cm-vault-image-source' });

const buildImageSourceLines = (view: EditorView): DecorationSet => {
  const { doc, selection } = view.state;
  const builder = new RangeSetBuilder<Decoration>();

  const isActive = (from: number, to: number) =>
    view.hasFocus &&
    selection.ranges.some((range) => range.from <= to && range.to >= from);

  syntaxTree(view.state).iterate({
    enter: (node) => {
      if (node.name !== 'Image') {
        return;
      }

      const line = doc.lineAt(node.from);
      const isImageOnly =
        line.text.trim() === doc.sliceString(node.from, node.to);

      if (isImageOnly && !isActive(line.from, line.to)) {
        builder.add(line.from, line.from, imageSourceLine);
      }
    },
  });

  return builder.finish();
};

/**
 * Collapses the line of an image's hidden `![](url)` source, so the image
 * sits where its line is, as in the rendered post. The line opens again
 * when the caret gets on it, as other markup does.
 */
const imageSourceLines = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildImageSourceLines(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.focusChanged ||
        syntaxTree(update.startState) !== syntaxTree(update.state)
      ) {
        this.decorations = buildImageSourceLines(update.view);
      }
    }
  },
  { decorations: (it) => it.decorations },
);

export const vaultEditorExtensions = (): Extension[] => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  startAsteriskList,
  extendEmphasisPair,
  autoCloseCodeFence,
  EditorView.lineWrapping,
  vaultMarkdown(),
  atomicMarkdownSyntax,
  atomicEditorTheme,
  vaultHighlight,
  keymap.of([...historyKeymap, ...defaultKeymap]),
  imageBlocks(),
  imageSourceLines,
  inlinePreview(),
];
