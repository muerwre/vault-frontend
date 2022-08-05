import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { isNil } from "~/utils/ramda";

import styles from "./styles.module.scss";

interface SidebarStackProps extends PropsWithChildren<{}> {
  tab?: number;
  onTabChange?: (index?: number) => void;
}

interface SidebarStackContextValue {
  activeTab?: number;
  setActiveTab: (val: number) => void;
  closeAllTabs: () => void;
}

const SidebarStackContext = createContext<SidebarStackContextValue>({
  activeTab: undefined,
  setActiveTab: () => {},
  closeAllTabs: () => {},
});

const SidebarCards: FC = ({ children }) => {
  const { activeTab } = useStackContext();

  const nonEmptyChildren = useMemo(() => {
    if (!children) {
      return [];
    }

    return Array.isArray(children) ? children.filter(it => it) : [children];
  }, [children]);

  if (isNil(activeTab) || !nonEmptyChildren[activeTab]) {
    return null;
  }

  return <div className={styles.card}>{nonEmptyChildren[activeTab]}</div>;
};

const SidebarStack = function({
  children,
  tab,
  onTabChange,
}: SidebarStackProps) {
  const [activeTab, setActiveTab] = useState<number | undefined>(tab);

  const closeAllTabs = useCallback(() => {
    setActiveTab(undefined);
    onTabChange?.(undefined);
  }, []);

  const onChangeTab = useCallback(
    (index: number) => {
      onTabChange?.(index);
      setActiveTab(index);
    },
    [onTabChange],
  );

  useEffect(() => setActiveTab(tab), [tab]);

  return (
    <SidebarStackContext.Provider
      value={{ activeTab, setActiveTab: onChangeTab, closeAllTabs }}
    >
      <div className={styles.stack}>{children}</div>
    </SidebarStackContext.Provider>
  );
};

SidebarStack.Cards = SidebarCards;

const useStackContext = () => useContext(SidebarStackContext);

export { SidebarStack, useStackContext };
