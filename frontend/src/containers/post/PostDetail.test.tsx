/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import Router from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { rootReducer } from 'store';
import PostDetail from './PostDetail';
import * as postAPI from '../../store/apis/post';
import * as commentAPI from '../../store/apis/comment';
import * as tagAPI from '../../store/apis/tag';
import userEvent from '@testing-library/user-event';

const simpleTagVisuals: tagAPI.TagVisual[] = [{ id: '1', name: 'interesting', color: '#101010' }];
const simplePosts: postAPI.Post[] = [
  {
    id: '1',
    title: 'First Post',
    author_name: 'KJY',
    content: 'Post Contents',
    created: '2022-11-11',
    updated: '2022-11-12',
    like_num: 1,
    dislike_num: 2,
    scrap_num: 3,
    comments_num: 1,
    tags: simpleTagVisuals,
    prime_tag: simpleTagVisuals[0],
    liked: true,
    disliked: true,
    scraped: true,
  },
  {
    id: '2',
    title: 'Second Post',
    author_name: 'KJY2',
    content: 'Post Contents2',
    created: '2022-11-11',
    updated: '2022-11-11',
    like_num: 11,
    dislike_num: 21,
    scrap_num: 31,
    comments_num: 11,
    tags: [],
    prime_tag: undefined,
    liked: false,
    disliked: false,
    scraped: false,
  },
];
const simpleComments: commentAPI.Comment[] = [
  {
    id: '1',
    author_name: 'KJY',
    content: 'Comment Content',
    created: '2022-11-11',
    updated: '2022-11-12',
    like_num: 1,
    dislike_num: 2,
    parent_comment: null,
    replyActive: false,
    editActive: false,
    liked: false,
    disliked: false,
    post_id: '1',
  },
  {
    id: '2',
    author_name: 'username',
    content: 'Comment Content2',
    created: '2022-11-12',
    updated: '2022-11-12',
    like_num: 12,
    dislike_num: 1,
    parent_comment: null,
    replyActive: false,
    editActive: false,
    liked: false,
    disliked: false,
    post_id: '1',
  },
  {
    id: '3',
    author_name: 'username',
    content: 'Comment Content2',
    created: '2022-11-12',
    updated: '2022-11-12',
    like_num: 12,
    dislike_num: 1,
    parent_comment: null,
    replyActive: false,
    editActive: false,
    liked: false,
    disliked: false,
    post_id: '2',
  },
  {
    id: '4',
    author_name: 'username',
    content: 'Commeent332',
    created: '2022-11-12',
    updated: '2022-11-12',
    like_num: 12,
    dislike_num: 1,
    parent_comment: 2,
    replyActive: false,
    editActive: false,
    liked: true,
    disliked: true,
    post_id: '1',
  },
];

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
beforeEach(() => jest.clearAllMocks());
afterAll(() => jest.restoreAllMocks());

const setup = () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch({
    type: 'user/setUser',
    payload: { username: 'KJY', nickname: 'nickname', image: 'image' },
  });
  render(
    <Provider store={store}>
      <PostDetail />
    </Provider>,
  );
  return store;
};

describe('[PostDetail Page]', () => {
  test('basic rendering my comment', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
    const store = setup();
    expect(mockDispatch).toBeCalledTimes(2); // resetPost, updatePostDetail
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/updatePostDetail' });
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/getPostComment' });

    act(() => {
      store.dispatch({
        type: 'post/updatePostDetailSuccess',
        payload: simplePosts[0],
      });
      store.dispatch({
        type: 'post/getPostCommentSuccess',
        payload: { comments: [simpleComments[0]] },
      });
    });

    const firstComment = screen.getByText('Comment Content');
    expect(firstComment).toBeValid();

    // Edit
    const commentEditBtn = screen.getByText('수정');
    expect(commentEditBtn).not.toBeDisabled();
    fireEvent.click(commentEditBtn);
    expect(commentEditBtn).toBeDisabled();

    expect(mockDispatch).toBeCalledWith({ payload: { comment_id: '1' }, type: 'post/toggleCommentEdit' });
    act(() => {
      store.dispatch({
        type: 'post/toggleCommentEdit',
        payload: { comment_id: '1' },
      });
    });

    const commentEditInput = screen.getByTestId('commentEditInput');
    expect(commentEditInput).toHaveValue('Comment Content');

    // Cancel Comment Edit
    const commentEditCancelBtn = screen.getByText('취소');
    fireEvent.click(commentEditCancelBtn);

    // Re-activate Comment Edit
    fireEvent.click(commentEditBtn);
    userEvent.type(commentEditInput, 'MODIF');

    const commentEditConfirmBtn = screen.getByText('완료');
    fireEvent.click(commentEditConfirmBtn);

    expect(mockDispatch).toBeCalledWith({
      payload: { comment_id: '1', content: 'Comment ContentMODIF' },
      type: 'post/editComment',
    });

    act(() => {
      store.dispatch({
        type: 'post/toggleCommentEdit',
        payload: { comment_id: '1' },
      });
    });

    const commentDeleteBtn = screen.getByText('삭제');
    fireEvent.click(commentDeleteBtn);

    expect(mockDispatch).toBeCalledWith({
      payload: { comment_id: '1' },
      type: 'post/deleteComment',
    });

    const backToMainBtn = screen.getByText('◀︎');
    fireEvent.click(backToMainBtn);
    expect(mockNavigate).toBeCalledWith('/post');
  });

  test('basic rendering not my comment', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
    const store = setup();

    expect(mockDispatch).toBeCalledTimes(2); // resetPost, updatePostDetail
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/updatePostDetail' });
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/getPostComment' });

    act(() => {
      store.dispatch({
        type: 'post/updatePostDetailSuccess',
        payload: simplePosts[0],
      });
      store.dispatch({
        type: 'post/getPostCommentSuccess',
        payload: { comments: [simpleComments[1]] },
      });
    });

    const secondComment = screen.getByText('Comment Content2');
    expect(secondComment).toBeValid();

    // Like, Dislike
    const commentFuncLike = screen.getByTestId('commentFuncLike');
    fireEvent.click(commentFuncLike);
    expect(mockDispatch).toBeCalledWith({
      payload: { comment_id: simpleComments[1].id, func_type: 'like' },
      type: 'post/commentFunc',
    });

    const commentFuncDislike = screen.getByTestId('commentFuncDislike');
    fireEvent.click(commentFuncDislike);
    expect(mockDispatch).toBeCalledWith({
      payload: { comment_id: simpleComments[1].id, func_type: 'dislike' },
      type: 'post/commentFunc',
    });

    // Reply Open
    const commentReplyOpenBtn = screen.getByText('답글');
    fireEvent.click(commentReplyOpenBtn);

    expect(mockDispatch).toBeCalledWith({
      payload: { parent_comment: simpleComments[1].id },
      type: 'post/toggleCommentReply',
    });
    act(() => {
      store.dispatch({
        type: 'post/toggleCommentReply',
        payload: { parent_comment: '2' },
      });
    });

    // Reply Input
    const commentReplyInput = screen.getByPlaceholderText('답글 입력');
    userEvent.type(commentReplyInput, 'REPLREPL');

    const commentReplySubmitBtn = screen.getByTestId('commentReplySubmitBtn');
    fireEvent.click(commentReplySubmitBtn);
  });

  test('basic rendering my post - edit, delete', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
    const store = setup();

    act(() => {
      store.dispatch({
        type: 'post/updatePostDetailSuccess',
        payload: simplePosts[0],
      });
      store.dispatch({
        type: 'post/getPostCommentSuccess',
        payload: { comments: [simpleComments[0]] },
      });
    });

    const postCreateBtn = screen.getByText('글 쓰기');
    fireEvent.click(postCreateBtn);
    expect(mockNavigate).toBeCalledWith(`/post/create`);

    const postEditBtn = screen.getByText('글 편집');
    fireEvent.click(postEditBtn);
    expect(mockNavigate).toBeCalledWith(`/post/${simplePosts[0].id}/edit`);

    const postDeleteBtn = screen.getByText('글 삭제');
    fireEvent.click(postDeleteBtn);
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/deletePost' });

    act(() => {
      store.dispatch({
        type: 'post/deletePostSuccess',
        payload: { post_id: '1' },
      });
    });

    expect(mockNavigate).toBeCalledWith('/post');
  });

  test('basic rendering not my post', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: '2' });
    const store = setup();

    act(() => {
      store.dispatch({
        type: 'post/updatePostDetailSuccess',
        payload: simplePosts[1],
      });
      store.dispatch({
        type: 'post/getPostCommentSuccess',
        payload: { comments: [simpleComments[2]] },
      });
    });

    // Like, Dislike, Scrap
    const postFuncLike = screen.getByTestId('postFuncLike');
    fireEvent.click(postFuncLike);
    expect(mockDispatch).toBeCalledWith({
      payload: { post_id: simplePosts[1].id, func_type: 'like' },
      type: 'post/postFunc',
    });

    const postFuncDislike = screen.getByTestId('postFuncDislike');
    fireEvent.click(postFuncDislike);
    expect(mockDispatch).toBeCalledWith({
      payload: { post_id: simplePosts[1].id, func_type: 'dislike' },
      type: 'post/postFunc',
    });

    const postFuncScrap = screen.getByTestId('postFuncScrap');
    fireEvent.click(postFuncScrap);
    expect(mockDispatch).toBeCalledWith({
      payload: { post_id: simplePosts[1].id, func_type: 'scrap' },
      type: 'post/postFunc',
    });

    // Create
    const commentCreateBtn = screen.getByText('작성');
    expect(commentCreateBtn).toBeDisabled();

    const commentInput = screen.getByPlaceholderText('댓글 입력');
    userEvent.type(commentInput, 'NEWCOMM');

    expect(commentCreateBtn).not.toBeDisabled();
    fireEvent.click(commentCreateBtn);

    expect(mockDispatch).toBeCalledWith({
      payload: { content: 'NEWCOMM', author_name: 'KJY', post_id: '2', parent_comment: 'none' },
      type: 'post/createComment',
    });
  });
  test('basic rendering with invalid id', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: undefined });
    const store = setup();

    act(() => {
      store.dispatch({
        type: 'post/updatePostDetailSuccess',
        payload: simplePosts[0],
      });
      store.dispatch({
        type: 'post/getPostCommentSuccess',
        payload: { comments: [simpleComments[0]] },
      });
    });

    // Create
    const commentCreateBtn = screen.getByText('작성');
    expect(commentCreateBtn).toBeDisabled();

    const commentInput = screen.getByPlaceholderText('댓글 입력');
    userEvent.type(commentInput, 'NEWCOMM');

    expect(commentCreateBtn).not.toBeDisabled();
    fireEvent.click(commentCreateBtn);

    // PostFunc
    const postFuncLike = screen.getByTestId('postFuncLike');
    fireEvent.click(postFuncLike);

    // PostDelete
    const postDeleteBtn = screen.getByText('글 삭제');
    fireEvent.click(postDeleteBtn);

    // CommentDelete
    const commentDeleteBtn = screen.getByText('삭제');
    fireEvent.click(commentDeleteBtn);
  });

  test('multiple comment', () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
    const store = setup();

    expect(mockDispatch).toBeCalledTimes(2); // resetPost, updatePostDetail
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/updatePostDetail' });
    expect(mockDispatch).toBeCalledWith({ payload: { post_id: '1' }, type: 'post/getPostComment' });

    act(() => {
      store.dispatch({
        type: 'post/updatePostDetailSuccess',
        payload: simplePosts[0],
      });
      store.dispatch({
        type: 'post/getPostCommentSuccess',
        payload: { comments: [simpleComments[1], simpleComments[3]] },
      });
    });
  });
});