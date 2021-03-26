import React, { FC } from 'react';
import { EditorActionsPanel } from '~/components/editors/EditorActionsPanel';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';

const EditorButtons: FC = () => {
  const { values, handleChange } = useNodeFormContext();

  return (
    <Padder style={{ position: 'relative' }}>
      <EditorActionsPanel />

      <Group horizontal>
        <InputText
          title="Название"
          value={values.title}
          handler={handleChange('title')}
          autoFocus
          maxLength={256}
        />

        <Button
          title="Сохранить"
          iconRight="check"
          color={values.is_promoted ? 'primary' : 'lab'}
        />
      </Group>
    </Padder>
  );
};

export { EditorButtons };
