import { AxiosResponse } from 'axios';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { put, call, takeLatest } from 'redux-saga/effects';
import * as tagAPI from 'store/apis/tag';
import { notificationInfo, notificationSuccess } from 'utils/sendNotification';

interface TagState {
  tagList: tagAPI.TagClass[] | null;
  popularTags: tagAPI.TagVisual[] | null;
  tagSearch: tagAPI.TagVisual[] | null;
  tagCreate: tagAPI.TagVisual | null;
  tagClassCreate: tagAPI.TagClass | null;
  error: string | null;
}
export const initialState: TagState = {
  tagList: null,
  popularTags: null,
  tagSearch: null,
  tagCreate: null,
  tagClassCreate: null,
  error: null,
};

export const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    // getTags ------------------------------------------------------------------------
    getTags: state => {
      state.error = null;
    },
    getTagsSuccess: (state, { payload }) => {
      state.tagList = payload.tags;
      state.popularTags = payload.popularTags;
    },
    getTagsFailure: (state, { payload }) => {
      state.error = payload;
      alert(payload.response?.data.message);
    },
    createTagClass: (state, action: PayloadAction<tagAPI.createTagClassRequestType>) => {
      state.tagClassCreate = null;
    },
    createTagClassSuccess: (state, { payload }) => {
      state.tagClassCreate = payload.tag_class;
      notificationSuccess('Tag', '태그 카테고리 생성에 성공했어요!');
    },
    createTagClassFailure: (state, { payload }) => {
      //create failure
    },
    createTag: (state, action: PayloadAction<tagAPI.createTagRequestType>) => {
      //create!
      state.tagCreate = null;
    },
    createTagSuccess: (state, { payload }) => {
      //create success
      state.tagCreate = payload.tags;
      notificationSuccess('Tag', '태그 생성에 성공했어요!');
    },
    createTagFailure: (state, { payload }) => {
      //create failure
    },
    searchTag: (state, action: PayloadAction<tagAPI.searchTagRequestType>) => {
      //search!
    },
    searchTagSuccess: (state, { payload }) => {
      state.tagSearch = payload.tags;
      if (state.tagSearch?.length === 0) notificationInfo('Tag', '검색 결과가 없어요.');
    },
    searchTagFailure: (state, { payload }) => {
      //search failure
    },
    // utils -------------------------------------------------------------------------------
    searchTagClear: state => {
      state.tagSearch = null;
    },
    clearTagState: state => {
      state.tagCreate = null;
      state.tagSearch = null;
    },
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
});

export const tagActions = tagSlice.actions;

function* getTagsSaga() {
  try {
    const response: AxiosResponse = yield call(tagAPI.getTags);
    yield put(tagActions.getTagsSuccess(response));
  } catch (error) {
    yield put(tagActions.getTagsFailure(error));
  }
}

function* createTagClassSaga(action: PayloadAction<tagAPI.createTagClassRequestType>) {
  try {
    const response: AxiosResponse = yield call(tagAPI.createTagClass, action.payload);
    yield put(tagActions.createTagClassSuccess(response));
  } catch (error) {
    yield put(tagActions.createTagClassFailure(error));
  }
}

function* createTagSaga(action: PayloadAction<tagAPI.createTagRequestType>) {
  try {
    const response: AxiosResponse = yield call(tagAPI.createTag, action.payload);
    yield put(tagActions.createTagSuccess(response));
  } catch (error) {
    yield put(tagActions.createTagFailure(error));
  }
}

function* searchTagSaga(action: PayloadAction<tagAPI.searchTagRequestType>) {
  try {
    const response: AxiosResponse = yield call(tagAPI.searchTag, action.payload);
    yield put(tagActions.searchTagSuccess(response));
  } catch (error) {
    yield put(tagActions.searchTagFailure(error));
  }
}

export default function* tagSaga() {
  yield takeLatest(tagActions.getTags, getTagsSaga);
  yield takeLatest(tagActions.createTag, createTagSaga);
  yield takeLatest(tagActions.createTagClass, createTagClassSaga);
  yield takeLatest(tagActions.searchTag, searchTagSaga);
}
