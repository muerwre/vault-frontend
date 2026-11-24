import { FC } from 'react';

import { NODE_PLACEMENT, NodePlacement } from '@vault/common/constants';
import { FlaskConicalIcon, UserIcon, WavesHorizontalIcon } from 'lucide-react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { getPlacementName, PlacementName } from '~/utils/node';

import styles from './styles.module.scss';

const HINTS: Record<PlacementName, string> = {
  flow: 'Пост показывается на главной странице и виден всем, даже незнакомцам',
  lab: 'Пост попадёт в раздел Лаб и будет виден только авторизованному персоналу',
  profile:
    'Пост не попадёт ни во флоу, ни в лабораторию: его будет видно только в твоём профиле',
};

/**
 * Picks where the node is listed: the flow on the main page, the lab, or only
 * the author's profile. A card below explains who will see it.
 */
const SubmitFlowToggle: FC = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const placement = getPlacementName(values);

  const select = (next: NodePlacement) => () =>
    setFieldValue('is_promoted', next);

  return (
    <div className={styles.wrap}>
      <HorizontalMenu>
        <HorizontalMenu.Item
          color="flow"
          icon={<WavesHorizontalIcon size={20} />}
          active={placement === 'flow'}
          onClick={select(NODE_PLACEMENT.FLOW)}
          stretchy
        >
          Флоу
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="lab"
          icon={<FlaskConicalIcon size={20} />}
          active={placement === 'lab'}
          onClick={select(NODE_PLACEMENT.LAB)}
          stretchy
        >
          Лаб
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="profile"
          icon={<UserIcon size={20} />}
          active={placement === 'profile'}
          onClick={select(NODE_PLACEMENT.PROFILE)}
          stretchy
        >
          Профиль
        </HorizontalMenu.Item>
      </HorizontalMenu>

      <div className={styles.hint}>{HINTS[placement]}</div>
    </div>
  );
};

export { SubmitFlowToggle };
