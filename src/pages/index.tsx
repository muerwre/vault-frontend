import React, { FC } from "react";
import { FlowLayout } from "~/layouts/FlowLayout";
import { useFlow } from "~/hooks/flow/useFlow";
import { FlowContextProvider } from "~/utils/context/FlowContextProvider";
import { observer } from "mobx-react";

interface Props {}

const FlowPage: FC<Props> = observer(() => {
  const { updates, nodes, heroes, recent, isFluid, toggleLayout, onChangeCellView } = useFlow();

  return (
    <FlowContextProvider
      updates={updates}
      recent={recent}
      heroes={heroes}
      nodes={nodes}
      onChangeCellView={onChangeCellView}
    >
      <FlowLayout isFluid={isFluid} onToggleLayout={toggleLayout} />
    </FlowContextProvider>
  );
});

export default FlowPage;
