import React, { FC, memo } from 'react';
import * as styles from './styles.scss';
import { createPortal } from 'react-dom';
import { selectNode } from '~/redux/node/selectors';
import { connect } from 'react-redux';
import pick from 'ramda/es/pick';
import { getURL } from '~/utils/dom';

const mapStateToProps = state => pick(['current_cover_image'], selectNode(state));

type IProps = ReturnType<typeof mapStateToProps> & {};

const PageCoverUnconnected: FC<IProps> = memo(({ current_cover_image }) =>
  current_cover_image
    ? createPortal(
        <div
          className={styles.wrap}
          style={{ backgroundImage: `url("${getURL(current_cover_image)}")` }}
        />,
        document.body
      )
    : null
);

const PageCover = connect(mapStateToProps)(PageCoverUnconnected);
export { PageCover };
