/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_URL: string;
    readonly REACT_APP_REMOTE_CURRENT: string;
    readonly REACT_APP_LAB_ENABLED: string;
  }
}
