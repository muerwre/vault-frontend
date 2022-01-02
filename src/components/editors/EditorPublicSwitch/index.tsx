import React, { FC, useCallback } from 'react';
import { IEditorComponentProps } from '~/redux/node/types';
import { Button } from '~/components/input/Button';
import { Icon } from '~/components/input/Icon';
import styles from './styles.module.scss';
import { useNodeFormContext } from '~/utils/hooks/node/useNodeFormFormik';

interface IProps extends IEditorComponentProps {}

const EditorPublicSwitch: FC<IProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();

  const onChange = useCallback(() => setFieldValue('is_promoted', !values.is_promoted), [
    values.is_promoted,
    setFieldValue,
  ]);

  return (
    <Button
      color={values.is_promoted ? 'primary' : 'lab'}
      type="button"
      size="giant"
      label={
        values.is_promoted
          ? 'Доступно всем на главной странице'
          : 'Видно только сотрудникам в лаборатории'
      }
      onClick={onChange}
      className={styles.button}
      round
    >
      {values.is_promoted ? (
        <Icon icon="waves" size={24} />
      ) : (
        <div className={styles.lab_wrapper}>
          <Icon icon="lab" size={24} />
        </div>
      )}
    </Button>
  );
};

export { EditorPublicSwitch };
