import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { Manager, Popper, Reference } from 'react-popper';
import { useFocusEvent } from '~/utils/hooks/useFocusEvent';
import classNames from 'classnames';
import { usePopperModifiers } from '~/utils/hooks/usePopperModifiers';

interface Props {
  hasDescription: boolean;
  toggleViewDescription: () => void;
  setViewSingle: () => void;
  setViewHorizontal: () => void;
  setViewVertical: () => void;
  setViewQuadro: () => void;
}

const FlowCellMenu: FC<Props> = ({
  hasDescription,
  toggleViewDescription,
  setViewSingle,
  setViewHorizontal,
  setViewVertical,
  setViewQuadro,
}) => {
  const { onFocus, onBlur, focused } = useFocusEvent();
  const modifiers = usePopperModifiers(0, 10);

  return (
    <Manager>
      <button className={styles.button} onFocus={onFocus} onBlur={onBlur}>
        <Reference>
          {({ ref }) => (
            <div className={styles.dots} ref={ref}>
              <Icon icon="menu" size={24} />
            </div>
          )}
        </Reference>
      </button>

      <Popper placement="bottom" strategy="fixed" modifiers={modifiers}>
        {({ ref, style }) => (
          <div
            ref={ref}
            style={style}
            className={classNames(styles.dropdown, { [styles.active]: focused })}
          >
            <div className={styles.menu}>
              {hasDescription && (
                <>
                  <Icon icon="text" onMouseDown={toggleViewDescription} size={32} />
                  <div className={styles.sep} />
                </>
              )}
              <Icon icon="cell-single" onMouseDown={setViewSingle} size={32} />
              <Icon icon="cell-double-h" onMouseDown={setViewHorizontal} size={32} />
              <Icon icon="cell-double-v" onMouseDown={setViewVertical} size={32} />
              <Icon icon="cell-quadro" onMouseDown={setViewQuadro} size={32} />
            </div>
          </div>
        )}
      </Popper>
    </Manager>
  );
};

export { FlowCellMenu };
