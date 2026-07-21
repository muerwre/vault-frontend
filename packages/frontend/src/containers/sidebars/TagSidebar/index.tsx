import { useMemo, VFC } from 'react';

import { Icon } from '~/components/common/Icon';
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
}

const TagSidebar: VFC<TagSidebarProps> = ({ tag, onRequestClose }) => {
  const { nodes, hasMore, isLoading, loadMore } = useTagNodes(tag);
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
                  <Icon icon="sad" size={120} />
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
