import { TAG_ACTIONS } from '~/redux/tag/constants';
import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import {
  tagLoadAutocomplete,
  tagLoadNodes,
  tagSetAutocomplete,
  tagSetNodes,
} from '~/redux/tag/actions';
import { selectTagNodes } from '~/redux/tag/selectors';
import { apiGetTagSuggestions, apiGetNodesOfTag } from '~/redux/tag/api';
import { Unwrap } from '~/redux/types';

function* loadTagNodes({ tag }: ReturnType<typeof tagLoadNodes>) {
  yield put(tagSetNodes({ isLoading: true, list: [] }));

  try {
    const { list }: ReturnType<typeof selectTagNodes> = yield select(selectTagNodes);
    const data: Unwrap<typeof apiGetNodesOfTag> = yield call(apiGetNodesOfTag, {
      tag,
      limit: 18,
      offset: list.length,
    });

    yield put(tagSetNodes({ list: [...list, ...data.nodes], count: data.count }));
  } catch {
  } finally {
    yield put(tagSetNodes({ isLoading: false }));
  }
}

function* loadAutocomplete({ search, exclude }: ReturnType<typeof tagLoadAutocomplete>) {
  if (search.length < 2) return;

  try {
    yield put(tagSetAutocomplete({ isLoading: true }));
    yield delay(200);

    const data: Unwrap<typeof apiGetTagSuggestions> = yield call(apiGetTagSuggestions, {
      search,
      exclude,
    });

    yield put(tagSetAutocomplete({ options: data.tags }));
  } catch {
  } finally {
    yield put(tagSetAutocomplete({ isLoading: false }));
  }
}

export default function* tagSaga() {
  yield takeLatest(TAG_ACTIONS.LOAD_NODES, loadTagNodes);
  yield takeLatest(TAG_ACTIONS.LOAD_AUTOCOMPLETE, loadAutocomplete);
}
