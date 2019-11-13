import { useMemo } from 'react';

export const PHRASES = {
  BORIS_TITLE: ['Снова вместе', 'Я видел это во сне', 'Что тут у нас?'],
  NOTHING_HERE: [
    'Тут пусто и одиноко',
    'Совсем ничего',
    'Хм... Где все?',
    'Тут будут наши с тобой сообщения',
  ],
};

export const getRandomPhrase = (key: keyof typeof PHRASES) =>
  useMemo(() => PHRASES[key][Math.floor(Math.random() * PHRASES[key].length)], []);
