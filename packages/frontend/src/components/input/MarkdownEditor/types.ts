/**
 * Formatting commands a toolbar sends to whatever input is currently mounted:
 * the plain textarea while the editor loads, the markdown editor after.
 */
export interface MarkdownFormatter {
  /** Wraps the selection, or puts the caret between prefix and suffix. */
  wrap: (prefix: string, suffix?: string) => void;
  /** Makes the caret's lines headings of the level, or plain text at 0. */
  setHeading: (level: number) => void;
  focus: () => void;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Minimal height, in rows of text. */
  minRows?: number;
  disabled?: boolean;
  className?: string;
  /** Ctrl+Enter / Cmd+Enter. */
  onSubmit?: () => void;
  onPaste?: (event: ClipboardEvent) => void;
  /** Receives the formatter of the mounted input, null on unmount. */
  onFormatter?: (formatter: MarkdownFormatter | null) => void;
}
