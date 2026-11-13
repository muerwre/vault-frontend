import { FC } from 'react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { NODE_TYPES } from '~/constants/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

import styles from './styles.module.scss';

/** Types a post can switch between on the submission page. */
const TYPES = [
  { type: NODE_TYPES.IMAGE, icon: 'image', label: 'Фото' },
  { type: NODE_TYPES.TEXT, icon: 'text', label: 'Пост' },
  { type: NODE_TYPES.VIDEO, icon: 'video', label: 'Видео' },
  { type: NODE_TYPES.AUDIO, icon: 'audio', label: 'Музыка' },
];

export const SWITCHABLE_TYPES = TYPES.map((it) => it.type);

interface Props {
  onChange: (type: string) => void;
  /** Shows each type's name beside its icon; otherwise only as a tooltip. */
  withLabels?: boolean;
}

const SubmitTypeSwitch: FC<Props> = ({ onChange, withLabels }) => {
  const { values } = useNodeFormContext();

  return (
    <HorizontalMenu>
      {TYPES.map(({ type, icon, label }) => (
        <HorizontalMenu.Item
          key={type}
          icon={icon}
          active={values.type === type}
          onClick={() => onChange(type)}
          title={label}
          className={styles.item}
          stretchy
        >
          {withLabels ? label : null}
        </HorizontalMenu.Item>
      ))}
    </HorizontalMenu>
  );
};

export { SubmitTypeSwitch };
