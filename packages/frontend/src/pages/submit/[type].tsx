import { FC, useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';

import { Authorized } from '~/components/common/Authorized';
import { PageTitle } from '~/components/common/PageTitle';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { URLS } from '~/constants/urls';
import { useUsersOnly } from '~/hooks/auth/useUsersOnly';
import { useCreateNode } from '~/hooks/node/useCreateNode';
import { useSaveNodeTags } from '~/hooks/node/useSaveNodeTags';
import { NotFoundLayout } from '~/layouts/NotFoundLayout';
import { NodeType, SubmitLayout } from '~/layouts/SubmitLayout';
import { INode } from '~/types';
import { values } from '~/utils/ramda';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

/** A new post. The URL names its type, and the type tabs change the URL. */
const SubmitPage: FC = observer(() => {
  const router = useRouter();
  const canRender = useUsersOnly();
  const createNode = useCreateNode();
  const saveTags = useSaveNodeTags();

  const type = String(router.query.type ?? '') as NodeType;
  const isInLab = router.query.lab === '1';

  const onSubmit = useCallback(
    async (node: INode) => {
      const created = await createNode(node);
      await saveTags(created.id!, [], node.tags || []);
      await router.push(URLS.NODE_URL(created.id));
    },
    [createNode, saveTags, router],
  );

  const onSwitchType = useCallback(
    (next: string) =>
      router.replace(URLS.SUBMIT(next, isInLab), undefined, { shallow: true }),
    [router, isInLab],
  );

  if (!router.isReady || !canRender) {
    return null;
  }

  if (!values(NODE_TYPES).includes(type)) {
    return <NotFoundLayout />;
  }

  return (
    <Authorized>
      <PageTitle title={getPageTitle('Новый пост')} />
      <SubmitLayout
        key={String(isInLab)}
        // read once: switching the type later keeps the form
        initial={{ ...EMPTY_NODE, type, is_promoted: !isInLab }}
        type={type}
        onSubmit={onSubmit}
        onSwitchType={onSwitchType}
      />
    </Authorized>
  );
});

export default SubmitPage;
