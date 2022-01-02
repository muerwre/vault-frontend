import React, { FC } from 'react';
import { EditorActionsPanel } from '~/components/editors/EditorActionsPanel';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { Button } from '~/components/input/Button';
import { Padder } from '~/components/containers/Padder';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

const EditorButtons: FC = () => {
  const { values, handleChange, isSubmitting } = useNodeFormContext();

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
          disabled={isSubmitting}
        />

        <Button
          title="Сохранить"
          iconRight="check"
          color={values.is_promoted ? 'primary' : 'lab'}
          disabled={isSubmitting}
          type="submit"
        />
      </Group>
    </Padder>
  );
};

export { EditorButtons };
