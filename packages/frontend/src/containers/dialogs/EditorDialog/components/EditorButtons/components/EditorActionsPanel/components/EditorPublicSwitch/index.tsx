import { FC, useCallback } from 'react';

import { NODE_PLACEMENT, NodePlacement } from '@vault/common/constants';
import { FlaskConicalIcon, UserIcon, WavesHorizontalIcon } from 'lucide-react';

import { Button } from '~/components/input/Button';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { IEditorComponentProps } from '~/types/node';
import { getPlacementName, PlacementName } from '~/utils/node';

import styles from './styles.module.scss';

interface Props extends IEditorComponentProps {}

const NEXT: Record<PlacementName, NodePlacement> = {
  flow: NODE_PLACEMENT.LAB,
  lab: NODE_PLACEMENT.PROFILE,
  profile: NODE_PLACEMENT.FLOW,
};

const LABELS: Record<PlacementName, string> = {
  flow: 'Доступно всем на главной странице',
  lab: 'Видно только сотрудникам в лаборатории',
  profile: 'Видно только в профиле автора',
};

/** Cycles the node through the flow, the lab and the author's profile. */
const EditorPublicSwitch: FC<Props> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placement = getPlacementName(values);

  const onChange = useCallback(
    () => setFieldValue('is_promoted', NEXT[placement]),
    [placement, setFieldValue],
  );

  return (
    <Button
      color={placement}
      type="button"
      size="giant"
      label={LABELS[placement]}
      onClick={onChange}
      className={styles.button}
      round
    >
      {placement === 'flow' && <WavesHorizontalIcon size={20} />}
      {placement === 'profile' && <UserIcon size={20} />}
      {placement === 'lab' && (
        <div className={styles.lab_wrapper}>
          <FlaskConicalIcon size={20} />
        </div>
      )}
    </Button>
  );
};

export { EditorPublicSwitch };
