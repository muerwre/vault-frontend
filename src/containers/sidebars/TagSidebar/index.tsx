import React, { useCallback, useMemo, VFC } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import styles from './styles.module.scss';
import { useHistory, useRouteMatch } from 'react-router';
import { Icon } from '~/components/input/Icon';
import { Link } from 'react-router-dom';
import { TagSidebarList } from '~/components/sidebar/TagSidebarList';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { InfiniteScroll } from '~/components/containers/InfiniteScroll';
import { Tag } from '~/components/tags/Tag';
import { useTagNodes } from '~/hooks/tag/useTagNodes';

const TagSidebar: VFC = () => {
  const {
    params: { tag },
    url,
  } = useRouteMatch<{ tag: string }>();
  const history = useHistory();

  const basePath = url.replace(new RegExp(`/tag/${tag}$`), '');
  const onClose = useCallback(() => history.push(basePath), [basePath, history]);
  const { nodes, hasMore, isLoading, loadMore } = useTagNodes(tag);
  const title = useMemo(() => decodeURIComponent(tag), [tag]);

  return (
    <SidebarWrapper onClose={onClose}>
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
              <Link to={basePath}>
                <Icon icon="close" size={32} />
              </Link>
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
