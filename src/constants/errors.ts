export const ERRORS = {
  NOT_AN_EMAIL: 'Not_An_Email',
  TOO_SHIRT: 'Is_Too_Shirt',
  EMPTY_RESPONSE: 'Empty_Response',
  NO_COMMENTS: 'No_Comments',
  FILES_REQUIRED: 'Files_Required',
  TEXT_REQUIRED: 'Text_Required',
  UNKNOWN_NODE_TYPE: 'Unknown_Node_Type',
  UNKNOWN_FILE_TYPE: 'Unknown_File_Type',
  URL_INVALID: 'Url_Invalid',
  FILES_AUDIO_REQUIRED: 'Files_Audio_Required',
  NOT_ENOUGH_RIGHTS: 'Not_Enough_Rights',
  INCORRECT_DATA: 'Incorrect_Data',
  IMAGE_CONVERSION_FAILED: 'Image_Conversion_Failed',
  USER_NOT_FOUND: 'User_Not_found',
  USER_EXIST: 'User_Exist',
  INCORRECT_PASSWORD: 'Incorrect_Password',
  CODE_IS_INVALID: 'Code_Is_Invalid',
  DOESNT_MATCH: 'Doesnt_Match',
  REQUIRED: 'Required',
  COMMENT_NOT_FOUND: 'Comment_Not_Found',
  FILE_IS_TOO_BIG: 'File_Is_Too_Big',
  USER_EXIST_WITH_EMAIL: 'User_Exist_With_Email',
  EMPTY_REQUEST: 'Empty_Request',
  NODE_NOT_FOUND: 'Node_Not_Found',
  INCORRECT_NODE_TYPE: 'Incorrect_Node_Type',
  UNEXPECTED_BEHAVIOR: 'Unexpected_Behavior',
  FILES_IS_TOO_BIG: 'File_Is_Too_Big',
  OAUTH_CODE_IS_EMPTY: 'OAuth_Code_Is_Empty',
  OAUTH_UNKNOWN_PROVIDER: 'OAuth_Unknown_Provider',
  OAUTH_INVALID_DATA: 'OAuth_Invalid_Data',
  USERNAME_IS_SHORT: 'Username_Is_Short',
  USERNAME_CONTAINS_INVALID_CHARS: 'Username_Contains_Invalid_Chars',
  PASSWORD_IS_SHORT: 'Password_Is_Short',
  USER_EXIST_WITH_SOCIAL: 'User_Exist_With_Social',
  USER_EXIST_WITH_USERNAME: 'User_Exist_With_Username',
  CANT_SAVE_COMMENT: 'CantSaveComment',
  CANT_SAVE_NODE: 'CantSaveNode',
  INPUT_TOO_SHIRT: 'InputTooShirt',
  CANT_SAVE_USER: 'CantSaveUser',
  CANT_DELETE_COMMENT: 'CantDeleteComment',
  CANT_RESTORE_COMMENT: 'CantRestoreComment',
  MESSAGE_NOT_FOUND: 'MessageNotFound',
  COMMENT_TOO_LONG: 'CommentTooLong',
  NETWORK_ERROR: 'Network Error',
  NOTE_NOT_FOUND: 'NoteNotFound',
};

export const ERROR_LITERAL = {
  [ERRORS.NOT_AN_EMAIL]: 'Введи правильный e-mail',
  [ERRORS.TOO_SHIRT]: 'Добавь хоть что-нибудь',
  [ERRORS.NO_COMMENTS]: 'Комментариев пока нет',
  [ERRORS.EMPTY_RESPONSE]: 'Пустой ответ сервера',
  [ERRORS.FILES_REQUIRED]: 'Добавь файлы',
  [ERRORS.TEXT_REQUIRED]: 'Нужно немного текста',
  [ERRORS.UNKNOWN_NODE_TYPE]: 'Неизвестный тип поста',
  [ERRORS.URL_INVALID]: 'Неизвестный адрес',
  [ERRORS.FILES_AUDIO_REQUIRED]: 'Нужна хотя бы одна песня',
  [ERRORS.NOT_ENOUGH_RIGHTS]: 'У тебя недостаточно прав',
  [ERRORS.INCORRECT_DATA]: 'Недопустимые данные',
  [ERRORS.IMAGE_CONVERSION_FAILED]: 'Не удалось изменить изображение',
  [ERRORS.USER_NOT_FOUND]: 'Пользователь не найден',
  [ERRORS.USER_EXIST]: 'Такой пользователь уже существует',
  [ERRORS.INCORRECT_PASSWORD]: 'Неправильный пароль',
  [ERRORS.CODE_IS_INVALID]: 'Код не существует или устарел',
  [ERRORS.DOESNT_MATCH]: 'Пароли не совпадают',
  [ERRORS.REQUIRED]: 'Обязательное поле',
  [ERRORS.COMMENT_NOT_FOUND]: 'Комментарий не найден',
  [ERRORS.UNKNOWN_FILE_TYPE]: 'Запрещенный тип файла',
  [ERRORS.FILE_IS_TOO_BIG]: 'Файл слишком большой',
  [ERRORS.USER_EXIST_WITH_EMAIL]:
    'Мы не можем продолжить, потому что есть другой пользователь с этим имэйлом.',
  [ERRORS.EMPTY_REQUEST]: 'Не удалось прочитать файл',
  [ERRORS.NODE_NOT_FOUND]: 'Пост не найден',
  [ERRORS.INCORRECT_NODE_TYPE]: 'Ты пытаешься отправить пост неизвестного типа',
  [ERRORS.UNEXPECTED_BEHAVIOR]: 'Что-то пошло не так. Напишите об этом Борису',
  [ERRORS.FILES_IS_TOO_BIG]: 'Файл слишком большой',
  [ERRORS.OAUTH_CODE_IS_EMPTY]:
    'Мы не смогли получить код от социальной сети. Попробуй ещё раз.',
  [ERRORS.OAUTH_UNKNOWN_PROVIDER]:
    'Ты пытаешься войти с помощью неизвестной социальной сети',
  [ERRORS.OAUTH_INVALID_DATA]:
    'Социальная сеть вернула какую-то дичь. Попробуй ещё раз.',
  [ERRORS.USERNAME_IS_SHORT]: 'Хотя бы 2 символа',
  [ERRORS.USERNAME_CONTAINS_INVALID_CHARS]: 'Буквы, цифры и подчёркивание',
  [ERRORS.PASSWORD_IS_SHORT]: 'Хотя бы 6 символов',
  [ERRORS.USER_EXIST_WITH_SOCIAL]: 'У кого-то уже привязан этот аккаунт',
  [ERRORS.USER_EXIST_WITH_USERNAME]: 'Имя пользователя занято',
  [ERRORS.CANT_SAVE_COMMENT]: 'Не удалось сохранить коммент',
  [ERRORS.CANT_SAVE_NODE]: 'Не удалось сохранить пост',
  [ERRORS.INPUT_TOO_SHIRT]: 'Должно быть длиннее',
  [ERRORS.CANT_SAVE_USER]: 'Не удалось сохранить пользователя',
  [ERRORS.CANT_DELETE_COMMENT]: 'Не удалось удалить комментарий',
  [ERRORS.CANT_RESTORE_COMMENT]: 'Не удалось восстановить комментарий',
  [ERRORS.MESSAGE_NOT_FOUND]: 'Сообщение не найдено',
  [ERRORS.COMMENT_TOO_LONG]: 'Комментарий слишком длинный',
  [ERRORS.NETWORK_ERROR]: 'Подключение не удалось',
  [ERRORS.NOTE_NOT_FOUND]: 'Заметка не найдена',
};
