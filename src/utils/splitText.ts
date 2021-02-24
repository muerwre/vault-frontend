import { flatten, isEmpty } from 'ramda';

export const splitTextByYoutube = (strings: string[]): string[] =>
  flatten(
    strings.map(str =>
      str.split(/(https?:\/\/(?:www\.)(?:youtube\.com|youtu\.be)\/(?:watch)(?:\?v=)[\w\-\&\=]+)/)
    )
  );

export const splitTextOmitEmpty = (strings: string[]): string[] =>
  strings.map(el => el.trim()).filter(el => !isEmpty(el));
