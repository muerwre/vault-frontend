import React, { FC, useCallback, useEffect, useRef } from 'react';
import { IEditorComponentProps } from '~/redux/node/types';
import { usePopper } from 'react-popper';
import { Button } from '~/components/input/Button';

interface IProps extends IEditorComponentProps {}

const EditorPublicSwitch: FC<IProps> = ({ data, setData }) => {
  const onChange = useCallback(() => setData({ ...data, is_promoted: !data.is_promoted }), [
    data,
    setData,
  ]);

  if (process.env.REACT_APP_LAB_ENABLED !== '1') {
    return null;
  }

  return (
    <Button
      color={data.is_promoted ? 'primary' : 'secondary'}
      type="button"
      iconLeft={data.is_promoted ? 'waves' : 'lab'}
      size="giant"
      label={
        data.is_promoted
          ? 'Доступно всем на главной странице'
          : 'Видно только сотрудникам в лаборатории'
      }
      onClick={onChange}
      round
    />
  );
};

export { EditorPublicSwitch };
