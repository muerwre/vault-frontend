import React, { FC, useCallback } from 'react';
import { ButtonGroup } from '~/components/input/ButtonGroup';
import { Button } from '~/components/input/Button';

interface IProps {
  onUpload: (files: File[]) => void;
}

const CommentFormButtons: FC<IProps> = ({ onUpload }) => {
  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      const files: File[] = Array.from(event.target?.files);

      if (!files || !files.length) return;

      onUpload(files);
    },
    [onUpload]
  );

  return (
    <ButtonGroup>
      <Button iconLeft="photo" size="small" color="gray" iconOnly>
        <input type="file" onInput={onInputChange} multiple accept="image/*" />
      </Button>

      <Button iconRight="audio" size="small" color="gray" iconOnly>
        <input type="file" onInput={onInputChange} multiple accept="audio/*" />
      </Button>
    </ButtonGroup>
  );
};

export { CommentFormButtons };
