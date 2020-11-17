import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import styles from './styles.module.scss';
import { useHistory, useRouteMatch } from 'react-router';
import { Icon } from '~/components/input/Icon';
import { Link } from 'react-router-dom';
import { TagSidebarList } from '~/components/sidebar/TagSidebarList';
import { connect } from 'react-redux';
import { selectTagNodes } from '~/redux/tag/selectors';
import * as ACTIONS from '~/redux/tag/actions';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { InfiniteScroll } from '~/components/containers/InfiniteScroll';
import { Tag } from '~/components/tags/Tag';

const mapStateToProps = state => ({
  nodes: selectTagNodes(state),
});

const mapDispatchToProps = {
  tagLoadNodes: ACTIONS.tagLoadNodes,
  tagSetNodes: ACTIONS.tagSetNodes,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const TagSidebarUnconnected: FC<Props> = ({ nodes, tagLoadNodes, tagSetNodes }) => {
  const {
    params: { tag },
    url,
  } = useRouteMatch<{ tag: string }>();
  const history = useHistory();

  const basePath = url.replace(new RegExp(`\/tag\/${tag}$`), '');
  const onClose = useCallback(() => history.push(basePath), [basePath]);

  useEffect(() => {
    tagLoadNodes(tag);
    return () => tagSetNodes({ list: [], count: 0 });
  }, [tag]);

  const loadMore = useCallback(() => {
    if (nodes.isLoading) return;
    tagLoadNodes(tag);
  }, [tagLoadNodes, tag, nodes.isLoading]);

  const title = useMemo(() => decodeURIComponent(tag), [tag]);
  const progress = nodes.count > 0 ? `${(nodes.list.length / nodes.count) * 100}%` : '0';

  const hasMore = nodes.count > nodes.list.length;

  return (
    <SidebarWrapper onClose={onClose}>
      <div className={styles.wrap}>
        <div className={styles.content}>
          <div className={styles.head}>
            {nodes.count > 0 && (
              <div className={styles.progress}>
                <div className={styles.bar} style={{ width: progress }} />
              </div>
            )}

            <div className={styles.tag}>
              <Tag tag={{ title }} size="big" />
            </div>

            {nodes.isLoading && (
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

          {!nodes.count && !nodes.isLoading ? (
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
              <TagSidebarList nodes={nodes.list} />
            </InfiniteScroll>
          )}
        </div>
      </div>
    </SidebarWrapper>
  );
};

const TagSidebar = connect(mapStateToProps, mapDispatchToProps)(TagSidebarUnconnected);

export { TagSidebar };
