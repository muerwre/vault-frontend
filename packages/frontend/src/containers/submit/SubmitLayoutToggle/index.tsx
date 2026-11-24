import { FC, useEffect } from 'react';

import { PanelsRightBottomIcon, SquareSparklesIcon } from 'lucide-react';

import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { NODE_LAYOUTS, NodeLayout } from '~/constants/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import styles from './styles.module.scss';

/**
 * Picks how a song node's page looks: a regular post, or an aura with the
 * photos sliding behind it. Aura needs at least one photo, and falls back to
 * a post when the last one is removed.
 */
const SubmitLayoutToggle: FC = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const { filesImages } = useUploaderContext()!;

  const hasImages = filesImages.length > 0;
  const isAura = values.settings?.layout === NODE_LAYOUTS.AURA;

  const setLayout = (layout: NodeLayout) =>
    setFieldValue('settings', { ...values.settings, layout });

  useEffect(() => {
    if (isAura && !hasImages) {
      setFieldValue('settings', {
        ...values.settings,
        layout: NODE_LAYOUTS.POST,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAura, hasImages]);

  return (
    <div className={styles.wrap}>
      <HorizontalMenu>
        <HorizontalMenu.Item
          icon={<PanelsRightBottomIcon size={20} />}
          active={!isAura}
          onClick={() => setLayout(NODE_LAYOUTS.POST)}
          stretchy
          vertical
        >
          Пост
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          icon={<SquareSparklesIcon size={20} />}
          active={isAura}
          disabled={!hasImages}
          onClick={() => setLayout(NODE_LAYOUTS.AURA)}
          title={hasImages ? undefined : 'Сначала добавьте обложку'}
          stretchy
          vertical
        >
          Аура
        </HorizontalMenu.Item>
      </HorizontalMenu>

      <div className={styles.hint}>
        {!hasImages
          ? 'Для ауры нужна хотя бы одна обложка'
          : isAura
            ? 'Обложки сменяют друг друга на фоне страницы, а песни и комментарии лежат поверх'
            : 'Обычный пост: обложка сверху, песни и комментарии под ней'}
      </div>
    </div>
  );
};

export { SubmitLayoutToggle };
