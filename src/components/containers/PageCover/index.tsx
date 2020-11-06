import React, { FC, memo } from 'react';
import styles from './styles.module.scss';
import { createPortal } from 'react-dom';
import { selectNode } from '~/redux/node/selectors';
import { connect } from 'react-redux';
import { pick } from 'ramda';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';

const mapStateToProps = state => pick(['current_cover_image'], selectNode(state));

type IProps = ReturnType<typeof mapStateToProps> & {};

const PageCoverUnconnected: FC<IProps> = memo(({ current_cover_image }) =>
  current_cover_image
    ? createPortal(
        <div
          className={styles.wrap}
          style={{ backgroundImage: `url("${getURL(current_cover_image, PRESETS.cover)}")` }}
        />,
        document.body
      )
    : null
);

const PageCover = connect(mapStateToProps)(PageCoverUnconnected);
export { PageCover };
