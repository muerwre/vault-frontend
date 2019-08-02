import React, { FC } from "react";
import { ScrollDialog } from "../ScrollDialog";

interface IProps {}

const ExampleDialog: FC<IProps> = ({}) => {
  const title = <div>title</div>;
  const buttons = <div>buttons</div>;
  return (
    <ScrollDialog buttons={buttons} width={720}>
      <div style={{ height: 1400 }}>test</div>
    </ScrollDialog>
  );
};

export { ExampleDialog };
