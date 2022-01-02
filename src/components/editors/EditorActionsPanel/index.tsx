import React, { createElement, FC } from 'react';
import styles from './styles.module.scss';
import { NODE_PANEL_COMPONENTS } from '~/constants/node';
import { has } from 'ramda';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

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
