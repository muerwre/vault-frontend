import { createReducer } from "~/utils/reducer";

export type INodeState = {
  is_loading: boolean;
}

const HANDLERS = {

};

const INITIAL_STATE: INodeState = {
  is_loading: false,
};

export default createReducer(INITIAL_STATE, HANDLERS);