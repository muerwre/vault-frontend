/**
 * Error codes, copied verbatim from the Go backend's `pkg/codes/codes.go`.
 *
 * These strings are a wire contract: the frontend's axios interceptor reads
 * `error.response.data.error` and matches against them (see
 * `packages/frontend/src/constants/errors.ts`). Never rename a value.
 */
export const ERROR_CODES = {
  NotAnEmail: 'Not_An_Email',
  NotAuthorized: 'NotAuthorized',
  UserNotFound: 'User_Not_found',
  TooShirt: 'Is_Too_Shirt',
  EmptyRequest: 'Empty_Request',
  FilesRequired: 'Files_Required',
  NodeNotFound: 'Node_Not_Found',
  TextRequired: 'Text_Required',
  UrlInvalid: 'Url_Invalid',
  FilesAudioRequired: 'Files_Audio_Required',
  NotEnoughRights: 'Not_Enough_Rights',
  IncorrectData: 'Incorrect_Data',
  ImageConversionFailed: 'Image_Conversion_Failed',
  UserExist: 'User_Exist',
  IncorrectPassword: 'Incorrect_Password',
  CodeIsInvalid: 'Code_Is_Invalid',
  Required: 'Required',
  CommentNotFound: 'Comment_Not_Found',
  IncorrectType: 'Incorrect_Node_Type',
  UnexpectedBehavior: 'Unexpected_Behavior',
  UnknownFileType: 'Unknown_File_Type',
  FilesIsTooBig: 'File_Is_Too_Big',
  OAuthCodeIsEmpty: 'OAuth_Code_Is_Empty',
  OAuthUnknownProvider: 'OAuth_Unknown_Provider',
  OAuthInvalidData: 'OAuth_Invalid_Data',
  OAuthConflict: 'OAuth_Conflict',
  UsernameIsShort: 'Username_Is_Short',
  UsernameContainsInvalidChars: 'Username_Contains_Invalid_Chars',
  PasswordIsShort: 'Password_Is_Short',
  UserExistWithEmail: 'User_Exist_With_Email',
  UserExistWithSocial: 'User_Exist_With_Social',
  UserExistWithUsername: 'User_Exist_With_Username',
  CantSaveComment: 'CantSaveComment',
  UnknownNodeType: 'UnknownNodeType',
  CantSaveNode: 'CantSaveNode',
  CantLoadUser: 'CantLoadUser',
  InputTooShirt: 'InputTooShirt',
  CantSaveUser: 'CantSaveUser',
  CantDeleteComment: 'CantDeleteComment',
  CantRestoreComment: 'CantRestoreComment',
  MessageNotFound: 'MessageNotFound',
  CommentTooLong: 'CommentTooLong',
  TagNotFound: 'TagNotFound',
  CantUpdateNotificationSettings: 'CantUpdateNotificationSettings',
  CantGetNotificationSettings: 'CantGetNotificationSettings',
  NoteNotFound: 'NoteNotFound',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
