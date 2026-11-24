import { FC } from 'react';

import classNames from 'classnames';
import { XIcon } from 'lucide-react';

import { Group } from '~/components/common/Group';
import {
  CellDoubleHIcon,
  CellDoubleHTextIcon,
  CellDoubleVIcon,
  CellDoubleVTextIcon,
  CellQuadroIcon,
  CellQuadroTextIcon,
  CellSingleIcon,
} from '~/components/icons';
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
  currentView,
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
          <XIcon size={24} />
        </button>
      )}

      <div className={styles.menu}>
        <div className={styles.display}>
          <CellSingleIcon onMouseDown={setViewSingle} size={48} />
          {descriptionEnabled ? (
            <CellDoubleHTextIcon onMouseDown={setViewHorizontal} size={48} />
          ) : (
            <CellDoubleHIcon onMouseDown={setViewHorizontal} size={48} />
          )}
          {descriptionEnabled ? (
            <CellDoubleVTextIcon onMouseDown={setViewVertical} size={48} />
          ) : (
            <CellDoubleVIcon onMouseDown={setViewVertical} size={48} />
          )}
          {descriptionEnabled ? (
            <CellQuadroTextIcon onMouseDown={setViewQuadro} size={48} />
          ) : (
            <CellQuadroIcon onMouseDown={setViewQuadro} size={48} />
          )}
        </div>

        {hasDescription && currentView !== 'single' && (
          <Group
            className={styles.description}
            horizontal
            onClick={toggleViewDescription}
          >
            <Toggle color="white" value={descriptionEnabled} />
            <span>Текст</span>
          </Group>
        )}
      </div>
    </div>
  );
};

export { FlowCellMenu };
