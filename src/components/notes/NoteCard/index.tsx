import React, { VFC } from "react";

import { Card } from "~/components/containers/Card";
import { Markdown } from "~/components/containers/Markdown";
import { Padder } from "~/components/containers/Padder";
import { NoteMenu } from "~/components/notes/NoteMenu";
import { formatText, getPrettyDate } from "~/utils/dom";

import styles from "./styles.module.scss";

interface NoteCardProps {
  content: string;
  createdAt: string;
}

const NoteCard: VFC<NoteCardProps> = ({ content, createdAt }) => (
  <Card className={styles.note}>
    <Padder>
      <NoteMenu onEdit={console.log} onDelete={console.log} />
      <Markdown
        className={styles.wrap}
        dangerouslySetInnerHTML={{ __html: formatText(content) }}
      />
    </Padder>

    <Padder className={styles.footer}>{getPrettyDate(createdAt)}</Padder>
  </Card>
);

export { NoteCard };
