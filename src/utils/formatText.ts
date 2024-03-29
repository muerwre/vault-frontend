import { marked } from 'marked';

import { stripHTMLTags } from '~/utils/stripHTMLTags';

/**
 * Cleans youtube urls
 */
export const formatTextSanitizeYoutube = (text: string): string =>
  text.replace(
    /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-&=]+)/gim,
    '\n$1\n',
  );

/**
 * Removes HTML tags
 */
export const formatTextSanitizeTags = (text: string): string =>
  stripHTMLTags(text);

/**
 * Returns clickable usernames
 */
export const formatTextClickableUsernames = (text: string): string =>
  text.replace(/~([\wа-яА-Я-]+)/giu, '<span class="username">~$1</span>');

/**
 * Makes gray comments
 */
export const formatTextComments = (text: string): string =>
  text
    .replace(/:\/\//gim, ':|--|')
    .replace(/(\/\/[^\n]+)/gim, '<span class="grey">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/gim, '<span class="grey">$1</span>')
    .replace(/:\|--\|/gim, '://');

/**
 * Highlights todos
 */
export const formatTextTodos = (text: string): string =>
  text
    .replace(
      /\/\/\s*(todo|туду):?\s*([^\n]+)/gim,
      '// <span class="todo">$1</span> $2',
    )
    .replace(
      /\/\/\s*(done|сделано|сделал|готово|fixed|пофикшено|фиксед):?\s*([^\n]+)/gim,
      '// <span class="done">$1</span> $2',
    );

/**
 * Formats !!exclamation messages with green color
 */
export const formatExclamations = (text: string): string =>
  text.replace(/(!![\s\S]*?(!!|\n|$))/gim, '<span class="green">$1$2</span>');

/**
 * Replaces -- with dash
 */
export const formatTextDash = (text: string): string =>
  text.replace(' -- ', ' — ');

/**
 * Formats with markdown
 */
export const formatTextMarkdown = (text: string): string => marked(text);
