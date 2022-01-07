import React, { FC } from "react";
import styles from "./styles.module.scss";
import { LabHeadItem } from "~/components/lab/LabHeadItem";

interface IProps {
  isLoading?: boolean;
}

const LabHead: FC<IProps> = ({ isLoading }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.group}>
        <LabHeadItem icon="recent" active isLoading={isLoading}>
          Свежие
        </LabHeadItem>

        <LabHeadItem icon="hot" isLoading={isLoading}>
          Популярные
        </LabHeadItem>

        <LabHeadItem icon="star_full" isLoading={isLoading}>
          Важные
        </LabHeadItem>
      </div>
    </div>
  );
};

export { LabHead };
