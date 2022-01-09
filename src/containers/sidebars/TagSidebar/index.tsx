import React, { useMemo, VFC } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { TagSidebarList } from '~/components/sidebar/TagSidebarList';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { InfiniteScroll } from '~/components/containers/InfiniteScroll';
import { Tag } from '~/components/tags/Tag';
import { useTagNodes } from '~/hooks/tag/useTagNodes';
import { DialogComponentProps } from '~/types/modal';

interface TagSidebarProps extends DialogComponentProps {
  tag: string;
}

const TagSidebar: VFC<TagSidebarProps> = ({ tag, onRequestClose }) => {
  const { nodes, hasMore, isLoading, loadMore } = useTagNodes(tag);
  const title = useMemo(() => decodeURIComponent(tag), [tag]);

  return (
    <SidebarWrapper onClose={onRequestClose}>
      <div className={styles.wrap}>
        <div className={styles.content}>
          <div className={styles.head}>
            <div className={styles.tag}>
              <Tag tag={{ title }} size="big" />
            </div>

            {isLoading && (
              <div className={styles.sync}>
                <LoaderCircle size={20} />
              </div>
            )}

            <div className={styles.close}>
              <button onClick={onRequestClose}>
                <Icon icon="close" size={32} />
              </button>
            </div>
          </div>

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
            <InfiniteScroll hasMore={hasMore} loadMore={loadMore} className={styles.list}>
              <TagSidebarList nodes={nodes} />
            </InfiniteScroll>
          )}
        </div>
      </div>
    </SidebarWrapper>
  );
};

export { TagSidebar };
