import React, { createElement, FC } from 'react';

import { NODE_PANEL_COMPONENTS } from '~/constants/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { has } from '~/utils/ramda';

import styles from './styles.module.scss';

const EditorActionsPanel: FC = () => {
  const { values } = useNodeFormContext();

  if (!values.type || !has(values.type, NODE_PANEL_COMPONENTS)) {
    return null;
  }

  return (
    <div className={styles.panel}>
      {NODE_PANEL_COMPONENTS[values.type] &&
        NODE_PANEL_COMPONENTS[values.type].map((el, key) => createElement(el, { key }))}
    </div>
  );
};

export { EditorActionsPanel };
