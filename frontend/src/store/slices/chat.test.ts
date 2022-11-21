import { configureStore } from '@reduxjs/toolkit';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';
import { rootReducer } from '../index';
import * as chatAPI from '../apis/chat';
import chatSaga, { initialState, chatSlice, chatActions } from './chat';

const simpleError = new Error('error!');

jest.spyOn(global, 'alert').mockImplementation(msg => msg);

describe('slices - chat', () => {
  test.each([
    [chatActions.resetCreate(), initialState],
    [chatActions.resetChat(), initialState],
    [chatActions.setSocket('socket'), { ...initialState, socket: 'socket' }],
    [chatActions.setWhere('where'), { ...initialState, where: 'where' }],
    [chatActions.addMessage('message'), { ...initialState, messageList: ['message'] }],
    [chatActions.getChatroomList(), initialState],
    [chatActions.getChatroomListSuccess('data'), { ...initialState, chatroomList: 'data' }],
    [chatActions.getChatroomListFailure('error'), { ...initialState, error: 'error' }],
    [chatActions.readChatroom('1234'), initialState],
    [chatActions.createChatroom({ username: '11111111' }), initialState],
    [
      chatActions.createChatroomSuccess({ id: '1234' }),
      { ...initialState, create: { ...initialState.create, id: '1234' } },
    ],
    [
      chatActions.createChatroomFailure('error'),
      { ...initialState, create: { ...initialState.create, error: 'error' } },
    ],
    [chatActions.getMessageList('11111111'), initialState],
    [chatActions.getMessageListSuccess('data'), { ...initialState, messageList: 'data' }],
    [chatActions.getMessageListFailure('error'), { ...initialState, error: 'error' }],
    [chatActions.getGroupMessageList('11111111'), initialState],
    [chatActions.getGroupMessageListSuccess('data'), { ...initialState, messageList: 'data' }],
    [chatActions.getGroupMessageListFailure('error'), { ...initialState, error: 'error' }],
  ])('reducer', (action, state) => {
    const store = configureStore({
      reducer: rootReducer,
    });
    store.dispatch(action);
    expect(store.getState().chat).toEqual(state);
  });

  test('readChatroom', () => {
    const store = configureStore({
      reducer: rootReducer,
    });
    store.dispatch(
      chatActions.getChatroomListSuccess([
        { id: 1, new: true },
        { id: 2, new: true },
      ]),
    );
    store.dispatch(chatActions.readChatroom('1'));
    expect(store.getState().chat).toEqual({
      ...initialState,
      chatroomList: [
        { id: 1, new: false },
        { id: 2, new: true },
      ],
    });
  });

  describe('saga success', () => {
    test('getChatroomList', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.getChatroomList), 'data']])
        .put({ type: 'chat/getChatroomListSuccess', payload: 'data' })
        .dispatch({ type: 'chat/getChatroomList' })
        .hasFinalState({ ...initialState, chatroomList: 'data' })
        .silentRun();
    });
    test('readChatroom', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.readChatroom, '1234'), undefined]])
        .dispatch({ type: 'chat/readChatroom', payload: '1234' })
        .hasFinalState(initialState)
        .silentRun();
    });
    test('createChatroom', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.createChatroom, { username: '1234' }), { id: 'id' }]])
        .put({ type: 'chat/createChatroomSuccess', payload: { id: 'id' } })
        .dispatch({ type: 'chat/createChatroom', payload: { username: '1234' } })
        .hasFinalState({ ...initialState, create: { ...initialState.create, id: 'id' } })
        .silentRun();
    });
    test('getMessageList', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.getMessageList, '11111111'), 'data']])
        .put({ type: 'chat/getMessageListSuccess', payload: 'data' })
        .dispatch({ type: 'chat/getMessageList', payload: '11111111' })
        .hasFinalState({ ...initialState, messageList: 'data' })
        .silentRun();
    });
    test('getGroupMessageList', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.getGroupMessageList, '11111111'), 'data']])
        .put({ type: 'chat/getGroupMessageListSuccess', payload: 'data' })
        .dispatch({ type: 'chat/getGroupMessageList', payload: '11111111' })
        .hasFinalState({ ...initialState, messageList: 'data' })
        .silentRun();
    });
  });

  describe('saga failure', () => {
    test('getChatroomList', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.getChatroomList), throwError(simpleError)]])
        .put({ type: 'chat/getChatroomListFailure', payload: simpleError })
        .dispatch({ type: 'chat/getChatroomList' })
        .hasFinalState({ ...initialState, error: simpleError })
        .silentRun();
    });
    test('createChatroom', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.createChatroom, { username: '1234' }), throwError(simpleError)]])
        .put({ type: 'chat/createChatroomFailure', payload: simpleError })
        .dispatch({ type: 'chat/createChatroom', payload: { username: '1234' } })
        .hasFinalState({ ...initialState, create: { ...initialState.create, error: simpleError } })
        .silentRun();
    });
    test('getMessageList', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.getMessageList, '11111111'), throwError(simpleError)]])
        .put({ type: 'chat/getMessageListFailure', payload: simpleError })
        .dispatch({ type: 'chat/getMessageList', payload: '11111111' })
        .hasFinalState({ ...initialState, error: simpleError })
        .silentRun();
    });
    test('getGroupMessageList', () => {
      return expectSaga(chatSaga)
        .withReducer(chatSlice.reducer)
        .provide([[call(chatAPI.getGroupMessageList, '11111111'), throwError(simpleError)]])
        .put({ type: 'chat/getGroupMessageListFailure', payload: simpleError })
        .dispatch({ type: 'chat/getGroupMessageList', payload: '11111111' })
        .hasFinalState({ ...initialState, error: simpleError })
        .silentRun();
    });
  });
});
