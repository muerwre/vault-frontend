import { TAG_ACTIONS } from '~/redux/tag/constants';
import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { tagLoadAutocomplete, tagLoadNodes, tagSetAutocomplete, tagSetNodes, } from '~/redux/tag/actions';
import { reqWrapper } from '~/redux/auth/sagas';
import { selectTagNodes } from '~/redux/tag/selectors';
import { getTagAutocomplete, getTagNodes } from '~/redux/tag/api';
import { Unwrap } from '~/redux/types';

function* loadTagNodes({ tag }: ReturnType<typeof tagLoadNodes>) {
  yield put(tagSetNodes({ isLoading: true }));

  try {
    const { list }: ReturnType<typeof selectTagNodes> = yield select(selectTagNodes);
    const { data, error }: Unwrap<ReturnType<typeof getTagNodes>> = yield call(
      reqWrapper,
      getTagNodes,
      { tag, limit: 18, offset: list.length }
    );

    if (error) throw new Error(error);

    yield put(tagSetNodes({ isLoading: false, list: [...list, ...data.nodes], count: data.count }));
  } catch (e) {
    console.log(e);
    yield put(tagSetNodes({ isLoading: false }));
  }
}

function* loadAutocomplete({ search, exclude }: ReturnType<typeof tagLoadAutocomplete>) {
  if (search.length < 3) return;

  try {
    yield put(tagSetAutocomplete({ isLoading: true }));
    yield delay(100);

    const { data, error }: Unwrap<ReturnType<typeof getTagAutocomplete>> = yield call(
      reqWrapper,
      getTagAutocomplete,
      { search, exclude }
    );

    if (error) throw new Error(error);

    yield put(tagSetAutocomplete({ options: data.tags, isLoading: false }));
  } catch (e) {
    yield put(tagSetAutocomplete({ isLoading: false }));
  }
}

export default function* tagSaga() {
  yield takeLatest(TAG_ACTIONS.LOAD_NODES, loadTagNodes);
  yield takeLatest(TAG_ACTIONS.LOAD_AUTOCOMPLETE, loadAutocomplete);
}
