import React, { FC, useCallback, useEffect, useRef } from 'react';
import { IEditorComponentProps } from '~/redux/node/types';
import { usePopper } from 'react-popper';
import { Button } from '~/components/input/Button';

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
