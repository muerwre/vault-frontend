import React, { FC } from 'react';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Padder } from '~/components/common/Padder';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';

import { EditorActionsPanel } from './components/EditorActionsPanel';

const EditorButtons: FC = () => {
  const { values, handleChange, isSubmitting } = useNodeFormContext();
  const { isTablet } = useWindowSize();

  return (
    <Padder style={{ position: 'relative' }}>
      <EditorActionsPanel />

      <Group horizontal>
        <Filler>
          <InputText
            title="Название"
            value={values.title}
            handler={handleChange('title')}
            autoFocus={!isTablet}
            maxLength={256}
            disabled={isSubmitting}
          />
        </Filler>

        <Button
          title={isTablet ? undefined : 'Сохранить'}
          iconRight="check"
          color={values.is_promoted ? 'flow' : 'lab'}
          disabled={isSubmitting}
          type="submit"
        />
      </Group>
    </Padder>
  );
};

export { EditorButtons };
