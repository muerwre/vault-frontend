import { FC, useCallback } from "react";

import { useRouter } from "next/router";

import { Group } from "~/components/containers/Group";
import { Button } from "~/components/input/Button";
import { SidebarName } from "~/constants/sidebar";
import { URLS } from "~/constants/urls";
import { useSidebar } from "~/utils/providers/SidebarProvider";

import styles from "./styles.module.scss";

export interface BorisSuperpowersProps {}

const BorisSuperpowers: FC<BorisSuperpowersProps> = () => {
  const { open } = useSidebar();
  const openProfileSidebar = useCallback(() => {
    open(SidebarName.Settings, { page: "profile" });
  }, [open]);
  const { push } = useRouter();

  return (
    <Group>
      <h2>Штучи, находящиеся в разработке</h2>

      <div className={styles.grid}>
        <Button size="mini" onClick={() => openProfileSidebar()}>
          Открыть
        </Button>
        <div className={styles.label}>Профиль в сайдбаре</div>

        <Button size="mini" onClick={() => push(URLS.SETTINGS.BASE)}>
          Открыть
        </Button>
        <div className={styles.label}>Профиль на отдельной странице</div>
      </div>
    </Group>
  );
};

export { BorisSuperpowers };
