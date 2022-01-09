import React, { FC } from 'react';
import { Filler } from '~/components/containers/Filler';
import { IEditorComponentProps } from '~/types/node';
import styles from './styles.module.scss';

type IProps = IEditorComponentProps & {};

const EditorFiller: FC<IProps> = () => <Filler className={styles.filler} />;

export { EditorFiller };
