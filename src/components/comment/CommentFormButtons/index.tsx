import React, { FC, useCallback } from 'react';
import { ButtonGroup } from '~/components/input/ButtonGroup';
import { Button } from '~/components/input/Button';
import { FILE_MIMES, UPLOAD_TYPES } from '~/redux/uploads/constants';

interface IProps {
  onUpload: (files: File[]) => void;
}

const ALLOWED_TYPES = [...FILE_MIMES[UPLOAD_TYPES.IMAGE], ...FILE_MIMES[UPLOAD_TYPES.AUDIO]];

const CommentFormAttachButtons: FC<IProps> = ({ onUpload }) => {
  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      const files = Array.from(event.target?.files as File[]).filter((file: File) =>
        ALLOWED_TYPES.includes(file.type)
      );
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

export { CommentFormAttachButtons };
