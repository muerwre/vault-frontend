import { FC } from 'react';

import classNames from 'classnames';
import Link from 'next/link';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { VerticalMenu } from '~/components/menu/VerticalMenu';
import { ADMIN_SECTIONS, AdminSectionKey } from '~/containers/admin/sections';

import styles from './styles.module.scss';

interface Props {
  active: AdminSectionKey;
}

/**
 * The admin page: sections in a sidebar on the left, the open one in the main
 * area beside it. On mobile the sidebar sits above.
 */
const AdminLayout: FC<Props> = ({ active, children }) => (
  <Container>
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        <div className={styles.heading}>Управление</div>

        <VerticalMenu appearance="flat">
          {ADMIN_SECTIONS.map((section) => (
            <Link key={section.key} href={section.url} passHref>
              <VerticalMenu.Item
                className={classNames({
                  [styles.active]: section.key === active,
                })}
              >
                {section.title}
              </VerticalMenu.Item>
            </Link>
          ))}
        </VerticalMenu>
      </aside>

      <Card className={styles.main}>{children}</Card>
    </div>
  </Container>
);

export { AdminLayout };
