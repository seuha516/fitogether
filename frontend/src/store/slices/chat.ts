/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { put, call, takeLatest } from 'redux-saga/effects';
import * as chatAPI from 'store/apis/chat';

interface ChatState {
  socket: WebSocket | null;
  where: string;

  create: {
    id: string | null;
    error: AxiosError | null;
  };

  chatroomList: chatAPI.chatroomType[];
  messageList: chatAPI.messageType[];
  error: AxiosError | null;
}
export const initialState: ChatState = {
  socket: null,
  where: '/',

  create: {
    id: null,
    error: null,
  },

  chatroomList: [],
  messageList: [],
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetCreate: state => {
      state.create.id = null;
      state.create.error = null;
    },
    resetChat: state => {
      state.chatroomList = [];
      state.messageList = [];
      state.error = null;
    },

    setSocket: (state, { payload }) => {
      state.socket = payload;
    },
    setWhere: (state, { payload }) => {
      state.where = payload;
    },
    addMessage: (state, { payload }) => {
      state.messageList.push(payload);
    },
    readChatroom: (state, action: PayloadAction<string>) => {
      const isTarget = (x: chatAPI.chatroomType) => {
        if (x.id.toString() === action.payload) return true;
      };
      const targetIndex = state.chatroomList.findIndex(isTarget);

      if (targetIndex >= 0) state.chatroomList[targetIndex].new = false;
    },

    getChatroomList: state => {
      state.error = null;
    },
    getChatroomListSuccess: (state, { payload }) => {
      state.chatroomList = payload;
      state.error = null;
    },
    getChatroomListFailure: (state, { payload }) => {
      state.chatroomList = [];
      state.error = payload;
      alert(payload.response?.data.message);
    },
    createChatroom: (state, action: PayloadAction<{ username: string }>) => {
      state.create.id = null;
      state.create.error = null;
    },
    createChatroomSuccess: (state, { payload }) => {
      state.create.id = payload.id;
      state.create.error = null;
    },
    createChatroomFailure: (state, { payload }) => {
      state.create.id = null;
      state.create.error = payload;
      alert(payload.response?.data.message);
    },
    getMessageList: (state, action: PayloadAction<string>) => {
      state.messageList = [];
      state.error = null;
    },
    getMessageListSuccess: (state, { payload }) => {
      state.messageList = payload;
      state.error = null;
    },
    getMessageListFailure: (state, { payload }) => {
      state.messageList = [];
      state.error = payload;
      alert(payload.response?.data.message);
    },
    getGroupMessageList: (state, action: PayloadAction<string>) => {
      state.messageList = [];
      state.error = null;
    },
    getGroupMessageListSuccess: (state, { payload }) => {
      state.messageList = payload;
      state.error = null;
    },
    getGroupMessageListFailure: (state, { payload }) => {
      state.messageList = [];
      state.error = payload;
      alert(payload.response?.data.message);
    },
  },
});
export const chatActions = chatSlice.actions;

function* getChatroomListSaga() {
  try {
    const response: AxiosResponse = yield call(chatAPI.getChatroomList);
    yield put(chatActions.getChatroomListSuccess(response));
  } catch (error) {
    yield put(chatActions.getChatroomListFailure(error));
  }
}
function* readChatroomSaga(action: PayloadAction<string>) {
  yield call(chatAPI.readChatroom, action.payload);
}
function* createChatroomSaga(action: PayloadAction<{ username: string }>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.createChatroom, action.payload);
    yield put(chatActions.createChatroomSuccess(response));
  } catch (error) {
    yield put(chatActions.createChatroomFailure(error));
  }
}
function* getMessageListSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.getMessageList, action.payload);
    yield put(chatActions.getMessageListSuccess(response));
  } catch (error) {
    yield put(chatActions.getMessageListFailure(error));
  }
}
function* getGroupMessageListSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.getGroupMessageList, action.payload);
    yield put(chatActions.getGroupMessageListSuccess(response));
  } catch (error) {
    yield put(chatActions.getGroupMessageListFailure(error));
  }
}

export default function* chatSaga() {
  yield takeLatest(chatActions.getChatroomList, getChatroomListSaga);
  yield takeLatest(chatActions.readChatroom, readChatroomSaga);
  yield takeLatest(chatActions.createChatroom, createChatroomSaga);
  yield takeLatest(chatActions.getMessageList, getMessageListSaga);
  yield takeLatest(chatActions.getGroupMessageList, getGroupMessageListSaga);
}
