import {
  takeLatest,
  call,
  put,
  select,
  takeLeading,
  delay
} from "redux-saga/effects";
import { REHYDRATE } from "redux-persist";
import { FLOW_ACTIONS } from "./constants";
import { getNodes } from "../node/api";
import {
  flowSetNodes,
  flowSetCellView,
  flowSetHeroes,
  flowSetRecent,
  flowSetUpdated,
  flowSetFlow
} from "./actions";
import { IResultWithStatus } from "../types";
import { selectFlowNodes } from "./selectors";
import { reqWrapper } from "../auth/sagas";
import { postCellView } from "./api";
import { IFlowState } from "./reducer";

function* onGetFlow() {
  yield put(flowSetFlow({ is_loading: true }));

  const {
    data: { nodes = [], heroes = [], recent = [], updated = [], mode }
  }: IResultWithStatus<{
    nodes: IFlowState["nodes"];
    heroes: IFlowState["heroes"];
    recent: IFlowState["recent"];
    updated: IFlowState["updated"];
    mode: string;
  }> = yield call(reqWrapper, getNodes, {});

  yield put(flowSetFlow({ is_loading: false, nodes }));

  if (heroes.length) yield put(flowSetHeroes(heroes));
  if (recent.length) yield put(flowSetRecent(recent));
  if (updated.length) yield put(flowSetUpdated(updated));

  document.getElementById("main_loader").style.display = "none";
}

function* onSetCellView({ id, flow }: ReturnType<typeof flowSetCellView>) {
  const nodes = yield select(selectFlowNodes);
  yield put(
    flowSetNodes(nodes.map(node => (node.id === id ? { ...node, flow } : node)))
  );

  const { data, error } = yield call(reqWrapper, postCellView, { id, flow });
}

function* getMore() {
  yield put(flowSetFlow({ is_loading: true }));
  const nodes: IFlowState["nodes"] = yield select(selectFlowNodes);
  const from =
    nodes && nodes[nodes.length - 1] && nodes[nodes.length - 1].created_at;

  const { error, data } = yield call(reqWrapper, getNodes, { from });

  if (error || !data || !data.nodes) return;

  yield put(
    flowSetFlow({ is_loading: false, nodes: [...nodes, ...data.nodes] })
  );

  yield delay(data.nodes.length > 0 ? 2000 : 30000);
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
  yield takeLatest(FLOW_ACTIONS.SET_CELL_VIEW, onSetCellView);
  yield takeLeading(FLOW_ACTIONS.GET_MORE, getMore);
}
