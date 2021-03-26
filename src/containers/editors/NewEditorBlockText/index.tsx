import React, { FC, useCallback } from 'react';
import { BlockType, IBlockComponentProps } from '~/redux/types';
import { InputText } from '~/components/input/InputText';

const NewEditorBlockText: FC<IBlockComponentProps> = ({ block, handler }) => {
  const onChange = useCallback((text: string) => handler({ type: BlockType.text, text }), [
    handler,
  ]);

  return (
    <div>
      <InputText handler={onChange} value={block.text} />
    </div>
  );
};

export { NewEditorBlockText };
