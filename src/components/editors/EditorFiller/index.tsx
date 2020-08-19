import React, { FC } from 'react';
import { Filler } from '~/components/containers/Filler';
import { IEditorComponentProps } from '~/redux/node/types';

type IProps = IEditorComponentProps & {};

const EditorFiller: FC<IProps> = () => <Filler />;

export { EditorFiller };
