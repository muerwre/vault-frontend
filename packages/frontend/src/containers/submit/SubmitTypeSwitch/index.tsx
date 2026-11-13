import { FC } from 'react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { NODE_TYPES } from '~/constants/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

/** Types a post can switch between on the submission page. */
const TYPES = [
  { type: NODE_TYPES.IMAGE, icon: 'image', label: 'Фото' },
  { type: NODE_TYPES.TEXT, icon: 'text', label: 'Текст' },
  { type: NODE_TYPES.VIDEO, icon: 'video', label: 'Видео' },
  { type: NODE_TYPES.AUDIO, icon: 'audio', label: 'Аудио' },
];

export const SWITCHABLE_TYPES = TYPES.map((it) => it.type);

interface Props {
  onChange: (type: string) => void;
}

const SubmitTypeSwitch: FC<Props> = ({ onChange }) => {
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
          stretchy
        />
      ))}
    </HorizontalMenu>
  );
};

export { SubmitTypeSwitch };
