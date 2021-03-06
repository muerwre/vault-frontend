import marked from 'marked';
import { stripHTMLTags } from '~/utils/stripHTMLTags';
import Typograf from 'typograf';

const typograf = new Typograf({ locale: ['ru', 'en-US'] });

/**
 * Cleans youtube urls
 */
export const formatTextSanitizeYoutube = (text: string): string =>
  text.replace(
    /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-\&\=]+)/gim,
    '\n$1\n'
  );

/**
 * Removes HTML tags
 */
export const formatTextSanitizeTags = (text: string): string => stripHTMLTags(text);

/**
 * Returns clickable usernames
 */
export const formatTextClickableUsernames = (text: string): string =>
  text.replace(
    /~([\wа-яА-Я-]+)/giu,
    '<span class="username" onClick="window.postMessage({ type: \'username\', username: \'$1\'});">~$1</span>'
  );

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
    .replace(/\/\/\s*(todo|туду):?\s*([^\n]+)/gim, '// <span class="todo">$1</span> $2')
    .replace(
      /\/\/\s*(done|сделано|сделал|готово|fixed|пофикшено|фиксед):?\s*([^\n]+)/gim,
      '// <span class="done">$1</span> $2'
    );

/**
 * Formats !!exclamation messages with green color
 */
export const formatExclamations = (text: string): string =>
  text.replace(/(\!\![\s\S]*?(\!\!|\n|$))/gim, '<span class="green">$1$2</span>');

/**
 * Formats links
 */
export const formatLinks = (text: string): string =>
  text.replace(
    /(\b(https?|ftp|file):\/\/([-A-Z0-9+&@#%?=~_|!:,.;]*)([-A-Z0-9+&@#%?\/=~_|!:,.;]*)[-A-Z0-9+&@#\/%=~_|])/gi,
    '<a href="$1" target="blank" rel="nofollow">$1</a>'
  );

/**
 * Replaces -- with dash
 */
export const formatTextDash = (text: string): string => text.replace(' -- ', ' — ');

/**
 * Formats with markdown
 */
export const formatTextMarkdown = (text: string): string => marked(text);

/**
 * Uses typograf.js to prettify text
 */
export const formatTextTypograf = (text: string): string => typograf.execute(text);
