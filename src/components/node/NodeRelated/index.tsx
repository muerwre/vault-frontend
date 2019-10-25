import React, { FC } from 'react';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { INode } from '~/redux/types';
import { getURL } from '~/utils/dom';
import { withRouter, RouteComponentProps } from 'react-router';
import { URLS } from '~/constants/urls';

type IProps = RouteComponentProps & {
  title: string;
  items: Partial<INode>[];
};

const NodeRelatedUnconnected: FC<IProps> = ({ title, items, history }) => (
  <Group className={styles.wrap}>
    <div className={styles.title}>
      <div className={styles.line} />
      <div className={styles.text}>{title}</div>
      <div className={styles.line} />
    </div>
    <div className={styles.grid}>
      {items.map(item => (
        <div
          className={styles.item}
          key={item.id}
          style={{ backgroundImage: `url("${getURL({ url: item.thumbnail })}")` }}
          onClick={() => history.push(URLS.NODE_URL(item.id))}
        />
      ))}
    </div>
  </Group>
);

const NodeRelated = withRouter(NodeRelatedUnconnected);

export { NodeRelated };
