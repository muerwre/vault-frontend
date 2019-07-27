import React, {FC, HTMLAttributes} from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';
import classNames = require("classnames");
import {ParagraphPlaceholder} from "~/components/placeholders/ParagraphPlaceholder";

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
}

const Comment: FC<IProps> = ({
  is_empty,
  is_loading,
  className,
  ...props
}) => (
    <Card
      className={classNames(styles.wrap, className, { is_empty, is_loading })}
      {...props}
    >
      <div className={styles.thumb}>
        <div className={styles.thumb_image} />
      </div>

      <div className={styles.text}>
        {
          is_empty && <ParagraphPlaceholder />
        }
      </div>
    </Card>
);

export { Comment };
