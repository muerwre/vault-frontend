import { FC } from "react";

import { observer } from "mobx-react-lite";

import { BorisSuperpowers } from "~/components/boris/BorisSuperpowers";
import { useAuth } from "~/hooks/auth/useAuth";
import { useSuperPowers } from "~/hooks/auth/useSuperPowers";

interface SuperPowersToggleProps {}

const SuperPowersToggle: FC<SuperPowersToggleProps> = observer(() => {
  const { isUser } = useAuth();
  const { isTester, setIsTester } = useSuperPowers();

  if (!isUser) {
    return null;
  }

  return <BorisSuperpowers active={isTester} onChange={setIsTester} />;
});

export { SuperPowersToggle };
