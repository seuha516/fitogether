/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import Router from 'react-router-dom';
import { rootReducer } from 'store';
import InformationDetail from './InformationDetail';
import { simplePosts } from 'store/slices/post.test';
import { Youtube } from 'store/apis/information';
import { act } from 'react-dom/test-utils';
import { getGroupDetailResponseType } from 'store/apis/group';
import { userType } from 'store/apis/user';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

// window.location.href mock
global.window = Object.create(window);
const url = 'http://dummy.com';
Object.defineProperty(window, 'location', {
  value: {
    href: url,
  },
  writable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
});
afterAll(() => jest.restoreAllMocks());

const simpleYoutubes: Youtube[] = [
  {
    video_id: '1',
    title: 'title1',
    thumbnail: 'thumb1',
    channel: 'wha!',
    published: 'yesterday',
  },
];

const user1: userType = {
  username: 'test',
  nickname: 'test',
  image: 'image',
};

const groupDetailResponse: getGroupDetailResponseType = {
  group_id: 1,
  group_name: 'group_name',
  number: 10,
  start_date: '2019-01-01',
  end_date: '2019-01-01',
  free: true,
  group_leader: user1,
  member_number: 3,
  description: 'test',
  goal: [],
  lat: null,
  lng: null,
  address: null,
  tags: [],
  prime_tag: undefined,
};

const getInfoSuccessResponse = {
  basic: {
    name: 'Deadlift',
  },
  posts: simplePosts,
  groups: [groupDetailResponse],
  youtubes: simpleYoutubes,
  articles: 'any',
};

const setup = () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch({
    type: 'user/setUser',
    payload: { username: 'username', nickname: 'nickname', image: 'image' },
  });
  render(
    <Provider store={store}>
      <InformationDetail />
    </Provider>,
  );
  return store;
};

test('render1', () => {
  jest.spyOn(Router, 'useParams').mockReturnValue({ name: 'Deadlift' });
  const store = setup();
  act(() => {
    store.dispatch({
      type: 'info/getInformationSuccess',
      payload: { ...getInfoSuccessResponse, groups: [] },
    });
  });
});
test('render2', () => {
  jest.spyOn(Router, 'useParams').mockReturnValue({ name: 'Deadlift' });
  const store = setup();
  act(() => {
    store.dispatch({
      type: 'info/getInformationSuccess',
      payload: {
        ...getInfoSuccessResponse,
        groups: [
          {
            group_id: 1,
            group_name: 'group_name',
            number: null,
            start_date: null,
            end_date: '2019-01-01',
            free: true,
            group_leader: user1,
            member_number: 3,
            description: 'test',
            goal: [],
            lat: null,
            lng: null,
            address: null,
            tags: [],
            prime_tag: { id: '1', name: '1', color: '1', posts: 1, calories: 1 },
          },
        ],
      },
    });
  });
});
test('render3', () => {
  jest.spyOn(Router, 'useParams').mockReturnValue({ name: 'Deadlift' });
  const store = setup();
  act(() => {
    store.dispatch({
      type: 'info/getInformationSuccess',
      payload: { ...getInfoSuccessResponse, posts: [] },
    });
  });
});

describe('[InformationDetail Page]', () => {
  test('basic rendering', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ name: 'Deadlift' });
    const store = setup();
    act(() => {
      store.dispatch({
        type: 'info/getInformationSuccess',
        payload: getInfoSuccessResponse,
      });
    });

    const youtubeItem = screen.getByText('wha!');
    fireEvent.click(youtubeItem);

    const postItem = screen.getByText('First Post');
    fireEvent.click(postItem);

    fireEvent.click(screen.getByTestId('backBtn'));
  });
  test('basic rendering when params undefined & Info error', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ name: undefined });
    const store = setup();
    act(() => {
      store.dispatch({
        type: 'info/getInformationFailure',
        payload: { ...new Error('hi'), response: { status: 404 } } as Error,
      });
    });
    act(() => {
      store.dispatch({
        type: 'info/getInformationFailure',
        payload: { ...new Error('hi'), response: { status: 403 } } as Error, //ETC
      });
    });
  });
});
