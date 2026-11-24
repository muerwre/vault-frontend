import { useMemo, VFC } from 'react';

import { FrownIcon } from 'lucide-react';

import { InfiniteScroll } from '~/components/common/InfiniteScroll';
import { SidebarStack } from '~/components/sidebar/SidebarStack';
import { SidebarStackCard } from '~/components/sidebar/SidebarStackCard';
import { SidebarWrapper } from '~/components/sidebar/SidebarWrapper';
import { TagSidebarList } from '~/components/sidebar/TagSidebarList';
import { Tag } from '~/components/tags/Tag';
import { SidebarName } from '~/constants/sidebar';
import { useTagNodes } from '~/hooks/tag/useTagNodes';
import { SidebarComponentProps } from '~/types/sidebar';

import styles from './styles.module.scss';

interface TagSidebarProps extends SidebarComponentProps<SidebarName.Tag> {
  tag: string;
  /** `'lab'` when opened from the lab: lists only lab nodes. */
  feature?: string;
}

const TagSidebar: VFC<TagSidebarProps> = ({ tag, feature, onRequestClose }) => {
  const { nodes, hasMore, isLoading, loadMore } = useTagNodes(
    tag,
    feature === 'lab',
  );
  const title = useMemo(() => decodeURIComponent(tag), [tag]);

  return (
    <SidebarWrapper onClose={onRequestClose}>
      <SidebarStack>
        <SidebarStackCard
          headerFeature="close"
          title={<Tag tag={{ title }} />}
          onBackPress={onRequestClose}
        >
          <div className={styles.wrap}>
            <div className={styles.content}>
              {!nodes.length && !isLoading ? (
                <div className={styles.none}>
                  <FrownIcon size={120} />
                  <div>
                    У этого тэга нет постов
                    <br />
                    <br />
                    Такие дела
                  </div>
                </div>
              ) : (
                <InfiniteScroll
                  hasMore={hasMore}
                  loadMore={loadMore}
                  className={styles.list}
                >
                  <TagSidebarList nodes={nodes} />
                </InfiniteScroll>
              )}
            </div>
          </div>
        </SidebarStackCard>
      </SidebarStack>
    </SidebarWrapper>
  );
};

export { TagSidebar };
