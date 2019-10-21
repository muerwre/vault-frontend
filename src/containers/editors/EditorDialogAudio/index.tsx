import React, { FC } from 'react';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { IDialogProps } from '~/redux/types';
import { NODE_TYPES } from '~/redux/node/constants';

type IProps = IDialogProps & {};

const EditorDialogAudio: FC<IProps> = props => <EditorDialog type={NODE_TYPES.AUDIO} {...props} />;

export { EditorDialogAudio };
