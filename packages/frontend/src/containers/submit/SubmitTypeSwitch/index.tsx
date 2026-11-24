import { FC } from 'react';

import {
  EighthNotesIcon,
  ImageIcon,
  RectangleLandscapePlayIcon,
  TextAlignStartIcon,
} from 'lucide-react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { NODE_TYPES } from '~/constants/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

import styles from './styles.module.scss';

const TYPES = [
  { type: NODE_TYPES.IMAGE, icon: <ImageIcon size={20} />, label: 'Фото' },
  {
    type: NODE_TYPES.TEXT,
    icon: <TextAlignStartIcon size={20} />,
    label: 'Блог',
  },
  {
    type: NODE_TYPES.VIDEO,
    icon: <RectangleLandscapePlayIcon size={20} />,
    label: 'Видео',
  },
  {
    type: NODE_TYPES.AUDIO,
    icon: <EighthNotesIcon size={20} />,
    label: 'Музыка',
  },
] as const;

export const SWITCHABLE_TYPES = TYPES.map((it) => it.type);

interface Props {
  readonly?: boolean;
  onChange: (type: string) => void;
  /** Shows each type's name beside its icon; otherwise only as a tooltip. */
  withLabels?: boolean;
}

const SubmitTypeSwitch: FC<Props> = ({ onChange, withLabels, readonly }) => {
  const { values } = useNodeFormContext();

  const selected = values.type
    ? TYPES.find((it) => it.type === values.type)
    : undefined;

  if (readonly && !selected) {
    return null;
  }

  return (
    <HorizontalMenu>
      {readonly ? (
        <HorizontalMenu.Item
          key={values.type}
          icon={selected?.icon}
          title={selected?.label}
          className={styles.item}
          stretchy
        >
          {withLabels ? selected?.label : null}
        </HorizontalMenu.Item>
      ) : (
        TYPES.map(({ type, icon, label }) => (
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
        ))
      )}
    </HorizontalMenu>
  );
};

export { SubmitTypeSwitch };
