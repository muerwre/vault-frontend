export const ERRORS = {
  NOT_AN_EMAIL: "Not_An_Email",
  TOO_SHIRT: "Is_Too_Shirt",
  EMPTY_RESPONSE: "Empty_Response",
  NO_COMMENTS: "No_Comments",
  FILES_REQUIRED: "Files_Required",
  TEXT_REQUIRED: "Text_Required",
  UNKNOWN_NODE_TYPE: "Unknown_Node_Type",
  URL_INVALID: "Url_Invalid",
  FILES_AUDIO_REQUIRED: "Files_Audio_Required",
  NOT_ENOUGH_RIGHTS: "Not_Enough_Rights",
  INCORRECT_DATA: "Incorrect_Data",
  IMAGE_CONVERSION_FAILED: "Image_Conversion_Failed",
  USER_NOT_FOUND: "User_Not_found",
  USER_EXIST: "User_Exist",
  INCORRECT_PASSWORD: "Incorrect_Password"
};

export const ERROR_LITERAL = {
  [ERRORS.NOT_AN_EMAIL]: "Введите правильный e-mail",
  [ERRORS.TOO_SHIRT]: "Слишком короткий",
  [ERRORS.NO_COMMENTS]: "Комментариев пока нет",
  [ERRORS.EMPTY_RESPONSE]: "Пустой ответ сервера",
  [ERRORS.FILES_REQUIRED]: "Добавьте файлы",
  [ERRORS.TEXT_REQUIRED]: "Нужно немного текста",
  [ERRORS.UNKNOWN_NODE_TYPE]: "Неизвестный тип поста",
  [ERRORS.URL_INVALID]: "Неизвестный адрес",
  [ERRORS.FILES_AUDIO_REQUIRED]: "Нужна хотя бы одна песня",
  [ERRORS.NOT_ENOUGH_RIGHTS]: "У вас недостаточно прав",
  [ERRORS.INCORRECT_DATA]: "Недопустимые данные",
  [ERRORS.IMAGE_CONVERSION_FAILED]: "Не удалось изменить изображение",
  [ERRORS.USER_NOT_FOUND]: "Пользователь не найден",
  [ERRORS.USER_EXIST]: "Такой пользователь уже существует",
  [ERRORS.INCORRECT_PASSWORD]: "Неправильный пароль"
};
