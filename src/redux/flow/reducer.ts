import { createReducer } from "~/utils/reducer";
import { INode, IError } from "../types";
import { FLOW_HANDLERS } from "./handlers";

export type IFlowState = Readonly<{
  is_loading: boolean;
  nodes: INode[];
  heroes: Partial<INode>[];
  recent: Partial<INode>[];
  updated: Partial<INode>[];
  range: [string, string];
  error: IError;
}>;

const INITIAL_STATE: IFlowState = {
  nodes: [],
  heroes: [],
  recent: [],
  updated: [],
  range: [null, null], // drop it, we use realtime range calc
  is_loading: false,
  error: null
};

export default createReducer(INITIAL_STATE, FLOW_HANDLERS);
