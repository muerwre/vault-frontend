import React, { FC, useCallback, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { IEditorComponentProps } from '~/redux/node/types';
import classNames from 'classnames';
import { usePopper } from 'react-popper';

interface IProps extends IEditorComponentProps {}

const EditorPublicSwitch: FC<IProps> = ({ data, setData }) => {
  const tooltip = useRef<HTMLDivElement>(null);
  const onChange = useCallback(() => setData({ ...data, is_promoted: !data.is_promoted }), [
    data,
    setData,
  ]);

  const pop = usePopper(tooltip?.current?.parentElement, tooltip.current, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  });

  useEffect(() => console.log(pop), [pop]);

  return (
    <div
      className={classNames(styles.wrap, { [styles.promoted]: data.is_promoted })}
      onClick={onChange}
    >
      <div className={styles.tooltip} ref={tooltip}>
        {data.is_promoted
          ? 'Доступно всем на главной странице'
          : 'Видно только сотрудникам в лаборатории'}
      </div>

      <div className={styles.icon}>
        {data.is_promoted ? <Icon size={24} icon="waves" /> : <Icon size={24} icon="lab" />}
      </div>
    </div>
  );
};

export { EditorPublicSwitch };
