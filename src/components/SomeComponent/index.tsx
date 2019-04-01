import * as React from 'react';
const styles = require("./styles.scss");

interface ISomeComponentProps {}

export const SomeComponent: React.FunctionComponent<ISomeComponentProps> = (props) => {
  const { } = props;

  return (
    <div className={styles.main}>This is some component</div>
  );
};

export default SomeComponent;
