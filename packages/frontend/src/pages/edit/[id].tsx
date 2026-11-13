import { FC, useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';

import { Authorized } from '~/components/common/Authorized';
import { LoaderScreen } from '~/components/common/LoaderScreen';
import { PageTitle } from '~/components/common/PageTitle';
import { URLS } from '~/constants/urls';
import { useUsersOnly } from '~/hooks/auth/useUsersOnly';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useNodePermissions } from '~/hooks/node/useNodePermissions';
import { useSaveNodeTags } from '~/hooks/node/useSaveNodeTags';
import { useUpdateNode } from '~/hooks/node/useUpdateNode';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { NodeType, SubmitLayout } from '~/layouts/SubmitLayout';
import { INode } from '~/types';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/** Edits an existing post on the submission page. Its type stays as it is. */
const EditPage: FC = observer(() => {
  const router = useRouter();
  const canRender = useUsersOnly();

  const id = Number(router.query.id);
  const { node } = useLoadNode(id);
  const [canEdit] = useNodePermissions(node);
  const updateNode = useUpdateNode(id);
  const saveTags = useSaveNodeTags();

  const onSubmit = useCallback(
    async (values: INode) => {
      await updateNode(values);
      await saveTags(id, node.tags || [], values.tags || []);
      await router.push(URLS.NODE_URL(id));
    },
    [updateNode, saveTags, router, id, node.tags],
  );

  if (!router.isReady || !canRender) {
    return null;
  }

  if (!id) {
    return <NotFoundLayout />;
  }

  if (!node.id) {
    return <LoaderScreen />;
  }

  return (
    <Authorized>
      {canEdit ? (
        <>
          <PageTitle title={getPageTitle(node.title || 'Редактирование')} />
          <SubmitLayout
            key={node.id}
            initial={node}
            type={node.type as NodeType}
            onSubmit={onSubmit}
          />
        </>
      ) : (
        <NotFoundLayout />
      )}
    </Authorized>
  );
});

export default EditPage;
