import { AxiosError, AxiosResponse } from 'axios';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { put, call, takeLatest } from 'redux-saga/effects';
import * as userAPI from 'store/apis/user';

interface UserState {
  user: {
    username: string;
    nickname: string;
    image: string;
  } | null;
  error: AxiosError | null;
}
const initialState: UserState = {
  user: null,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signup: (state, action: PayloadAction<userAPI.signupRequestType>) => {
      state.user = null;
      state.error = null;
    },
    signupSuccess: (state, { payload }) => {
      state.user = payload;
    },
    signupFailure: (state, { payload }) => {
      state.error = payload;
      alert(payload.response?.data.message);
    },
    login: (state, action: PayloadAction<userAPI.loginRequestType>) => {
      state.user = null;
      state.error = null;
    },
    loginSuccess: (state, { payload }) => {
      state.user = payload;
    },
    loginFailure: (state, { payload }) => {
      state.error = payload;
      alert(payload.response?.data.message);
    },
  },
});
export const userActions = userSlice.actions;

function* signupSaga(action: PayloadAction<userAPI.signupRequestType>) {
  try {
    const response: AxiosResponse = yield call(userAPI.signup, action.payload);
    yield put(userActions.signupSuccess(response));
  } catch (error) {
    yield put(userActions.signupFailure(error));
  }
}
function* loginSaga(action: PayloadAction<userAPI.loginRequestType>) {
  try {
    const response: AxiosResponse = yield call(userAPI.login, action.payload);
    yield put(userActions.loginSuccess(response));
  } catch (error) {
    yield put(userActions.loginFailure(error));
  }
}

export default function* userSaga() {
  yield takeLatest(userActions.signup, signupSaga);
  yield takeLatest(userActions.login, loginSaga);
}