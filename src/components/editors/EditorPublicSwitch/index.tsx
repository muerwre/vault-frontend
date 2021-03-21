import React, { FC, useCallback } from 'react';
import { IEditorComponentProps } from '~/redux/node/types';
import { Button } from '~/components/input/Button';
import { Icon } from '~/components/input/Icon';
import styles from './styles.module.scss';
import { Superpower } from '~/components/boris/Superpower';

interface IProps extends IEditorComponentProps {}

const EditorPublicSwitch: FC<IProps> = ({ data, setData }) => {
  const onChange = useCallback(() => setData({ ...data, is_promoted: !data.is_promoted }), [
    data,
    setData,
  ]);

  return (
    <Superpower>
      <Button
        color={data.is_promoted ? 'primary' : 'lab'}
        type="button"
        size="giant"
        label={
          data.is_promoted
            ? 'Доступно всем на главной странице'
            : 'Видно только сотрудникам в лаборатории'
        }
        onClick={onChange}
        className={styles.button}
        round
      >
        {data.is_promoted ? (
          <Icon icon="waves" size={24} />
        ) : (
          <div className={styles.lab_wrapper}>
            <Icon icon="lab" size={24} />
          </div>
        )}
      </Button>
    </Superpower>
  );
};

export { EditorPublicSwitch };
