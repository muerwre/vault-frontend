import React, { FC } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { Toggle } from '~/components/input/Toggle';
import { FlowDisplayVariant } from '~/types';

import styles from './styles.module.scss';

interface Props {
  onClose: () => void;
  currentView: FlowDisplayVariant;
  descriptionEnabled: boolean;
  hasDescription: boolean;
  toggleViewDescription: () => void;
  setViewSingle: () => void;
  setViewHorizontal: () => void;
  setViewVertical: () => void;
  setViewQuadro: () => void;
}

const FlowCellMenu: FC<Props> = ({
  onClose,
  hasDescription,
  toggleViewDescription,
  descriptionEnabled,
  setViewSingle,
  setViewHorizontal,
  setViewVertical,
  setViewQuadro,
}) => {
  return (
    <div className={classNames(styles.dropdown)}>
      {onClose && (
        <button className={styles.close} onClick={onClose} type="button">
          <Icon icon="close" size={24} />
        </button>
      )}

      <div className={styles.menu}>
        <div className={styles.display}>
          <Icon icon="cell-single" onMouseDown={setViewSingle} size={48} />
          <Icon
            icon={descriptionEnabled ? 'cell-double-h-text' : 'cell-double-h'}
            onMouseDown={setViewHorizontal}
            size={48}
          />
          <Icon
            icon={descriptionEnabled ? 'cell-double-v-text' : 'cell-double-v'}
            onMouseDown={setViewVertical}
            size={48}
          />
          <Icon
            icon={descriptionEnabled ? 'cell-quadro-text' : 'cell-quadro'}
            onMouseDown={setViewQuadro}
            size={48}
          />
        </div>

        {hasDescription && (
          <Group className={styles.description} horizontal onClick={toggleViewDescription}>
            <Toggle color="white" value={descriptionEnabled} />
            <span>Текст</span>
          </Group>
        )}
      </div>
    </div>
  );
};

export { FlowCellMenu };
