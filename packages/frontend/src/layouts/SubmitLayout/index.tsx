import { createElement, FC, useEffect, useRef } from 'react';

import { FormikProvider } from 'formik';
import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { NODE_TYPES } from '~/constants/node';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { EditorAudioUploadButton } from '~/containers/dialogs/EditorDialog/components/EditorButtons/components/EditorActionsPanel/components/EditorAudioUploadButton';
import { EditorImageUploadButton } from '~/containers/dialogs/EditorDialog/components/EditorButtons/components/EditorActionsPanel/components/EditorImageUploadButton';
import { NODE_EDITORS } from '~/containers/dialogs/EditorDialog/constants';
import { SubmitAudioEditor } from '~/containers/submit/SubmitAudioEditor';
import { SubmitCoverEditor } from '~/containers/submit/SubmitCoverEditor';
import { SubmitFlowToggle } from '~/containers/submit/SubmitFlowToggle';
import { SubmitImageEditor } from '~/containers/submit/SubmitImageEditor';
import { SubmitTags } from '~/containers/submit/SubmitTags';
import { SubmitTextEditor } from '~/containers/submit/SubmitTextEditor';
import {
  SubmitTypeSwitch,
  SWITCHABLE_TYPES,
} from '~/containers/submit/SubmitTypeSwitch';
import { SubmitVideoEditor } from '~/containers/submit/SubmitVideoEditor';
import { useUploader } from '~/hooks/data/useUploader';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNodeFormFormik } from '~/hooks/node/useNodeFormFormik';
import { INode } from '~/types';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';
import { usePageCover } from '~/utils/providers/PageCoverProvider';

import styles from './styles.module.scss';

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

const PAGE_EDITORS = {
  ...NODE_EDITORS,
  [NODE_TYPES.IMAGE]: SubmitImageEditor,
  [NODE_TYPES.AUDIO]: SubmitAudioEditor,
  [NODE_TYPES.TEXT]: SubmitTextEditor,
  [NODE_TYPES.VIDEO]: SubmitVideoEditor,
};

/**
 * Upload buttons a type offers above its content. Photos and songs have add
 * cards in their grids instead.
 */
const UPLOAD_BUTTONS: Partial<Record<NodeType, FC[]>> = {
  [NODE_TYPES.ROOM]: [EditorAudioUploadButton, EditorImageUploadButton],
};

/** Rooms always live outside the lab, so they get no flow/lab choice. */
const HAS_FLOW_TOGGLE: NodeType[] = [
  NODE_TYPES.IMAGE,
  NODE_TYPES.TEXT,
  NODE_TYPES.VIDEO,
  NODE_TYPES.AUDIO,
];

interface Props {
  /** The node to start from: an empty one to create, a loaded one to edit. */
  initial: INode;
  /** The type shown; follows the URL when creating. */
  type: NodeType;
  onSubmit: (node: INode) => Promise<unknown>;
  /** Offers the type tabs when given. Existing posts keep their type. */
  onSwitchType?: (type: string) => void;
}

const noop = () => {};

/**
 * The node submission page, for new posts and edits alike. On desktop, the
 * content sits in the main zone and a pane beside it holds the title, cover,
 * flow/lab choice and submit button. On mobile, the title tops the main zone
 * and the rest follows the content.
 */
const SubmitLayout: FC<Props> = observer(
  ({ initial, type, onSubmit, onSwitchType }) => {
    const { isTablet } = useWindowSize();

    const { current: initialNode } = useRef(initial);

    const uploader = useUploader(
      UploadSubject.Editor,
      UploadTarget.Nodes,
      initialNode.files,
    );

    const formik = useNodeFormFormik(initialNode, uploader, noop, onSubmit);
    const { values, handleChange, handleSubmit, isSubmitting, setFieldValue } =
      formik;

    // Switching the type keeps the form: title, background, uploads and typed
    // content all survive, and the backend drops whatever the final type
    // cannot carry.
    const currentType = (values.type || type) as NodeType;

    useEffect(() => {
      if (values.type !== type) {
        setFieldValue('type', type);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    // the picked background shows behind the page, as on the node itself
    usePageCover(values.cover || undefined);

    const color = values.is_promoted ? 'flow' : 'lab';
    const uploadButtons = UPLOAD_BUTTONS[currentType] ?? [];

    const title = (
      <InputText
        title="Название"
        value={values.title}
        handler={handleChange('title')}
        autoFocus={!isTablet}
        maxLength={256}
        disabled={isSubmitting}
      />
    );

    const controls = (
      <>
        <SubmitTags />

        <div className={styles.bottom}>
          <SubmitCoverEditor />
          {HAS_FLOW_TOGGLE.includes(currentType) && <SubmitFlowToggle />}
        </div>

        <div className={styles.submit}>
          <Button
            title="Сохранить"
            iconRight="check"
            color={color}
            disabled={isSubmitting}
            type="submit"
            stretchy
          />
        </div>
      </>
    );

    return (
      <UploaderContextProvider value={uploader}>
        <FormikProvider value={formik}>
          <Container>
            <form onSubmit={handleSubmit} className={styles.wrap}>
              <div className={styles.main}>
                {isTablet && <div className={styles.title}>{title}</div>}

                <Card className={styles.content}>
                  {!!onSwitchType && SWITCHABLE_TYPES.includes(currentType) && (
                    <div className={styles.types}>
                      <SubmitTypeSwitch onChange={onSwitchType} />
                    </div>
                  )}

                  {uploadButtons.length > 0 && (
                    <div className={styles.uploads}>
                      {uploadButtons.map((button, index) =>
                        createElement(button, { key: index }),
                      )}
                    </div>
                  )}

                  {createElement(PAGE_EDITORS[currentType])}
                </Card>
              </div>

              <div className={styles.pane}>
                {!isTablet && title}
                {controls}
              </div>
            </form>
          </Container>
        </FormikProvider>
      </UploaderContextProvider>
    );
  },
);

export { SubmitLayout };
