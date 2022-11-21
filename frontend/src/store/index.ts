import { combineReducers } from '@reduxjs/toolkit';
import { all, fork } from 'redux-saga/effects';
import groupSaga, { groupSlice } from './slices/group';
import postSaga, { postSlice } from './slices/post';
import tagSaga, { tagSlice } from './slices/tag';
import userSaga, { userSlice } from './slices/user';
import workoutLogSage, { workoutLogSlice } from './slices/workout';
import chatSaga, { chatSlice } from './slices/chat';
import notificationSaga, { notificationSlice } from './slices/notification';
import informationSaga, { informationSlice } from './slices/information';

export const rootReducer = combineReducers({
  user: userSlice.reducer,
  post: postSlice.reducer,
  workout_log: workoutLogSlice.reducer,
  group: groupSlice.reducer,
  tag: tagSlice.reducer,
  info: informationSlice.reducer,
  chat: chatSlice.reducer,
  notification: notificationSlice.reducer,
});
export function* rootSaga() {
  yield all([fork(userSaga)]);
  yield all([fork(postSaga)]);
  yield all([fork(workoutLogSage)]);
  yield all([fork(groupSaga)]);
  yield all([fork(tagSaga)]);
  yield all([fork(informationSaga)]);
  yield all([fork(chatSaga)]);
  yield all([fork(notificationSaga)]);
}
