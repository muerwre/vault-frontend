import { IState } from '../store';
import { IFlowState } from './reducer';

export const selectFlow = (state: IState): IFlowState => state.flow;
export const selectFlowNodes = (state: IState) => state.flow.nodes;
