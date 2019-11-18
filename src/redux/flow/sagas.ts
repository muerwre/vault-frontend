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
import { getNodeDiff } from "../node/api";
import {
  flowSetNodes,
  flowSetCellView,
  flowSetHeroes,
  flowSetRecent,
  flowSetUpdated,
  flowSetFlow
} from "./actions";
import { IResultWithStatus, INode } from "../types";
import { selectFlowNodes } from "./selectors";
import { reqWrapper } from "../auth/sagas";
import { postCellView } from "./api";
import { IFlowState } from "./reducer";
import uniq from "ramda/es/uniq";

function hideLoader() {
  document.getElementById("main_loader").style.display = "none";
}

function* onGetFlow() {
  const {
    flow: { _persist }
  } = yield select();

  if (!_persist.rehydrated) return;

  const stored: IFlowState["nodes"] = yield select(selectFlowNodes);

  if (stored.length) {
    hideLoader();
  }

  const start =
    (stored && stored[0] && stored[0].created_at) || new Date().toISOString();

  const end =
    (stored &&
      stored[stored.length - 1] &&
      stored[stored.length - 1].created_at) ||
    new Date().toISOString();

  yield put(flowSetFlow({ is_loading: true }));

  const {
    data: {
      before = [],
      after = [],
      heroes = [],
      recent = [],
      updated = [],
      valid = null
    }
  }: IResultWithStatus<{
    before: IFlowState["nodes"];
    after: IFlowState["nodes"];
    heroes: IFlowState["heroes"];
    recent: IFlowState["recent"];
    updated: IFlowState["updated"];
    valid: INode["id"][];
  }> = yield call(reqWrapper, getNodeDiff, {
    start,
    end,
    with_heroes: true,
    with_updated: true,
    with_recent: true,
    with_valid: true
  });

  const result = uniq([
    ...(before || []),
    ...(valid ? stored.filter(node => valid.includes(node.id)) : stored),
    ...(after || [])
  ]);

  yield put(flowSetFlow({ is_loading: false, nodes: result }));

  if (heroes.length) yield put(flowSetHeroes(heroes));
  if (recent.length) yield put(flowSetRecent(recent));
  if (updated.length) yield put(flowSetUpdated(updated));

  if (!stored.length) hideLoader();
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

  const start = nodes && nodes[0] && nodes[0].created_at;
  const end =
    nodes && nodes[nodes.length - 1] && nodes[nodes.length - 1].created_at;

  const { error, data } = yield call(reqWrapper, getNodeDiff, {
    start,
    end,
    with_heroes: false,
    with_updated: true,
    with_recent: true,
    with_valid: true
  });

  if (error || !data) return;

  const result = uniq([
    ...(data.before || []),
    ...(data.valid
      ? nodes.filter(node => data.valid.includes(node.id))
      : nodes),
    ...(data.after || [])
  ]);

  yield put(
    flowSetFlow({
      is_loading: false,
      nodes: result,
      ...(data.recent ? { recent: data.recent } : {}),
      ...(data.updated ? { updated: data.updated } : {})
    })
  );

  yield delay(1000);
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
  yield takeLatest(FLOW_ACTIONS.SET_CELL_VIEW, onSetCellView);
  yield takeLeading(FLOW_ACTIONS.GET_MORE, getMore);
}
