import React, { FC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { EditorActionsPanel } from '~/components/editors/EditorActionsPanel';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

const EditorButtons: FC = () => {
  const { values, handleChange, isSubmitting } = useNodeFormContext();
  const { isMobile } = useWindowSize();

  return (
    <Padder style={{ position: 'relative' }}>
      <EditorActionsPanel />

      <Group horizontal>
        <Filler>
          <InputText
            title="Название"
            value={values.title}
            handler={handleChange('title')}
            autoFocus
            maxLength={256}
            disabled={isSubmitting}
          />
        </Filler>

        <Button
          title={isMobile ? undefined : 'Сохранить'}
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
