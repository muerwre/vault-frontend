import { FC } from 'react';

import { Filler } from '~/components/common/Filler';
import { IEditorComponentProps } from '~/types/node';

import styles from './styles.module.scss';

type Props = IEditorComponentProps & {};

const EditorFiller: FC<Props> = () => <Filler className={styles.filler} />;

export { EditorFiller };
