import React, { createContext, FC, VFC, useContext, useState, useMemo } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

interface TabProps {
  items: string[];
}

const TabContext = createContext({
  activeTab: 0,
  setActiveTab: (activeTab: number) => {},
});

const List: VFC<TabProps> = ({ items }) => {
  const { activeTab, setActiveTab } = useContext(TabContext);

  return (
    <div className={styles.tabs}>
      {items.map((it, index) => (
        <div
          className={classNames(styles.tab, { [styles.active]: activeTab === index })}
          onClick={() => setActiveTab(index)}
          key={it}
        >
          {it}
        </div>
      ))}
    </div>
  );
};

const Content: FC<any> = ({ children }) => {
  const { activeTab } = useContext(TabContext);
  const notEmptyChildren = useMemo(() => {
    if (!Array.isArray(children)) {
      return [children];
    }

    return children.filter(it => it);
  }, [children]);

  if (Array.isArray(notEmptyChildren) && notEmptyChildren.length - 1 < activeTab) {
    return notEmptyChildren[notEmptyChildren.length - 1];
  }

  return notEmptyChildren[activeTab];
};

const Tabs = function({ children }) {
  const [activeTab, setActiveTab] = useState(0);

  return <TabContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabContext.Provider>;
};

Tabs.List = List;
Tabs.Content = Content;

export { Tabs };
