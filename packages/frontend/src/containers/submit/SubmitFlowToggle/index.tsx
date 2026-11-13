import { FC } from 'react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

import styles from './styles.module.scss';

/**
 * Picks where the node goes: the flow on the main page, or the lab. A card
 * below explains who will see it.
 */
const SubmitFlowToggle: FC = () => {
  const { values, setFieldValue } = useNodeFormContext();

  return (
    <div className={styles.wrap}>
      <HorizontalMenu>
        <HorizontalMenu.Item
          color="flow"
          icon="waves"
          active={!!values.is_promoted}
          onClick={() => setFieldValue('is_promoted', true)}
          stretchy
        >
          Флоу
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="lab"
          icon="lab"
          active={!values.is_promoted}
          onClick={() => setFieldValue('is_promoted', false)}
          stretchy
        >
          Лаб
        </HorizontalMenu.Item>
      </HorizontalMenu>

      <div className={styles.hint}>
        {values.is_promoted
          ? 'Пост показывается на главной странице и виден всем, даже незнакомцам.'
          : 'Пост виден только в разделе Лаб и виден только жителям Убежища.'}
      </div>
    </div>
  );
};

export { SubmitFlowToggle };
