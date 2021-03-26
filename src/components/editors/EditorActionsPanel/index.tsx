import React, { FC, createElement } from 'react';
import styles from './styles.module.scss';
import { INode } from '~/redux/types';
import { NODE_PANEL_COMPONENTS } from '~/redux/node/constants';
import { has } from 'ramda';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';

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
