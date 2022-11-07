import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { RootState } from 'index';
import { postActions } from 'store/slices/post';
import { useNavigate, useParams } from 'react-router';
import { timeAgoFormat } from 'utils/datetime';
import { PostPageWithSearchBar, SideBarWrapper } from './PostLayout';
import { Comment } from 'store/apis/comment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { LoadingWithoutMinHeight } from 'components/common/Loading';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import 'styles/color.css';
import { BlueBigBtn, CommentGreenBtn, CommentRedBtn, GreenCommentSubmitBtn } from 'components/post/button';
import { TagBubble } from 'components/tag/tagbubble';

export interface IPropsComment {
  isChild?: boolean;
}

export const FuncBtnStatus = {
  None: 'None',
  Like: 'Like',
  Dislike: 'Dislike',
  Scrap: 'Scrap',
};
interface IPropsFuncBtn {
  color: string;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(({ user }: RootState) => user.user);
  const post = useSelector(({ post }: RootState) => post.postDetail.post);
  const postComment = useSelector(({ post }: RootState) => post.postComment.comments);
  const postDeleteStatus = useSelector(({ post }: RootState) => post.postDelete);
  const postFuncStatus = useSelector(({ post }: RootState) => post.postFunc);
  const commentFuncStatus = useSelector(({ post }: RootState) => post.postComment.commentFunc);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentReplyInput, setCommentReplyInput] = useState('');
  const [commentEditInput, setCommentEditInput] = useState('');
  const [commentNum, changeCommentNum] = useState(0);
  const [replyActivated, setReplyActivated] = useState(false);
  const [editActivated, setEditActivated] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(
        postActions.getPostDetail({
          post_id: id,
        }),
      );
    }
  }, [postFuncStatus]);
  useEffect(() => {
    if (id) {
      dispatch(
        postActions.getPostComment({
          post_id: id,
        }),
      );
    }
  }, [commentNum, commentFuncStatus]);
  useEffect(() => {
    if (postComment) setCommentList(postComment);
  }, [postComment]);
  useEffect(() => {
    if (postDeleteStatus) {
      navigate('/post');
      dispatch(postActions.stateRefresh());
    }
  }, [postDeleteStatus]);

  const postFuncLikeOnClick = () => {
    if (id) {
      dispatch(
        postActions.postFunc({
          post_id: id,
          func_type: 'like',
        }),
      );
    }
  };
  const postFuncDislikeOnClick = () => {
    if (id) {
      dispatch(
        postActions.postFunc({
          post_id: id,
          func_type: 'dislike',
        }),
      );
    }
  };
  const postFuncScrapOnClick = () => {
    if (id) {
      dispatch(
        postActions.postFunc({
          post_id: id,
          func_type: 'scrap',
        }),
      );
    }
  };
  const commentFuncLikeOnClick = (comment: Comment) => {
    if (comment.id) {
      dispatch(
        postActions.commentFunc({
          comment_id: comment.id,
          func_type: 'like',
        }),
      );
    }
  };
  const commentFuncDislikeOnClick = (comment: Comment) => {
    if (comment.id) {
      dispatch(
        postActions.commentFunc({
          comment_id: comment.id,
          func_type: 'dislike',
        }),
      );
    }
  };
  const deleteOnClick = () => {
    if (id) {
      dispatch(
        postActions.deletePost({
          post_id: id,
        }),
      );
    }
  };

  const commentCreateOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (user && id) {
      const parent_comment = e.currentTarget.getAttribute('data-parent_comment');
      dispatch(
        postActions.createComment({
          content: parent_comment ? commentReplyInput : commentInput,
          author_name: user.username,
          post_id: id,
          parent_comment: parent_comment ? parent_comment : 'none',
        }),
      );
      dispatch(
        postActions.getPostComment({
          post_id: id,
        }),
      );
      setCommentInput('');
      setCommentReplyInput('');
      changeCommentNum(Date.now());
      setReplyActivated(false);
    } else {
      console.log('user or id is not valid');
    }
  };

  const commentReplyOpenOnClick = (comment: Comment) => {
    dispatch(postActions.toggleCommentReply({ parent_comment: comment.id }));
    setReplyActivated(!replyActivated);
  };

  const commentEditOpenOnClick = (comment: Comment) => {
    dispatch(postActions.toggleCommentEdit({ comment_id: comment.id }));
    setCommentEditInput(comment.content);
    setEditActivated(true);
  };

  const commentEditConfirmOnClick = (comment: Comment) => {
    dispatch(
      postActions.editComment({
        comment_id: comment.id,
        content: commentEditInput,
      }),
    );
    dispatch(postActions.toggleCommentEdit({ comment_id: comment.id }));
    changeCommentNum(Date.now());
    setEditActivated(false);
  };

  const commentEditCancelOnClick = (comment: Comment) => {
    dispatch(postActions.toggleCommentEdit({ comment_id: comment.id }));
    setEditActivated(false);
  };

  const commentDeleteOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target_id = e.currentTarget.getAttribute('data-comment_id');
    if (target_id && id) {
      dispatch(
        postActions.deleteComment({
          comment_id: target_id,
        }),
      );
      dispatch(
        postActions.getPostComment({
          post_id: id,
        }),
      );
    }
    changeCommentNum(Date.now());
  };

  const CommentBtnComponent = (comment: Comment) => {
    if (comment.editActive) {
      return (
        <CommentFuncBtnWrapper>
          <CommentRedBtn onClick={() => commentEditCancelOnClick(comment)}>취소</CommentRedBtn>
          <CommentGreenBtn onClick={() => commentEditConfirmOnClick(comment)}>완료</CommentGreenBtn>
        </CommentFuncBtnWrapper>
      );
    } else {
      return (
        <CommentFuncBtnWrapper>
          {comment.parent_comment === null && (
            <CommentGreenBtn
              onClick={() => commentReplyOpenOnClick(comment)}
              disabled={replyActivated && !comment.replyActive}
            >
              답글
            </CommentGreenBtn>
          )}
          {user?.username == comment?.author_name && (
            <>
              <CommentGreenBtn disabled={editActivated} onClick={() => commentEditOpenOnClick(comment)}>
                수정
              </CommentGreenBtn>
              <CommentRedBtn onClick={commentDeleteOnClick} data-comment_id={comment.id}>
                삭제
              </CommentRedBtn>
            </>
          )}
        </CommentFuncBtnWrapper>
      );
    }
  };

  const CommentItemComponent = (comment: Comment) => {
    return (
      <CommentReplyWrapper key={comment.id}>
        <CommentItem isChild={comment.parent_comment !== null}>
          {/* {comment.parent_comment !== null && <FontAwesomeIcon icon={faArrowRightLong} />} */}
          <CommentWritterWrapperO1>
            <CommentWritterWrapper>
              <CommentWritterAvatar>Avatar</CommentWritterAvatar>
              <CommentWritterText> {comment.author_name} </CommentWritterText>
            </CommentWritterWrapper>
          </CommentWritterWrapperO1>
          <CommentRightWrapper>
            <CommentContentWrapper>
              {comment.editActive ? (
                <CommentEditInput
                  value={commentEditInput}
                  onChange={e => setCommentEditInput(e.target.value)}
                ></CommentEditInput>
              ) : (
                <CommentContent>
                  {/* [My ID : {comment.id} / Parent : {comment.parent_comment}] */}
                  {comment.content}
                </CommentContent>
              )}
            </CommentContentWrapper>
            <CommentFuncWrapper>
              {CommentBtnComponent(comment)}
              <CommentFuncBtn
                onClick={() => commentFuncLikeOnClick(comment)}
                color={comment.liked ? FuncBtnStatus.Like : FuncBtnStatus.None}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </CommentFuncBtn>
              <CommentFuncNumIndicator>{comment.like_num}</CommentFuncNumIndicator>
              <CommentFuncBtn
                onClick={() => commentFuncDislikeOnClick(comment)}
                color={comment.disliked ? FuncBtnStatus.Dislike : FuncBtnStatus.None}
              >
                <FontAwesomeIcon icon={faThumbsDown} />
              </CommentFuncBtn>
              <CommentFuncNumIndicator>{comment.dislike_num}</CommentFuncNumIndicator>
              <CommentFuncTimeIndicator> {timeAgoFormat(comment.created)} </CommentFuncTimeIndicator>
            </CommentFuncWrapper>
          </CommentRightWrapper>
        </CommentItem>
        <CommentReplyFormWrapper>
          {comment.replyActive === true && (
            <CommentReplyForm>
              <CommentInput
                placeholder="댓글 입력"
                value={commentReplyInput}
                onChange={e => setCommentReplyInput(e.target.value)}
              ></CommentInput>
              <GreenCommentSubmitBtn
                disabled={commentReplyInput === ''}
                onClick={commentCreateOnClick}
                data-parent_comment={comment.id}
              >
                작성
              </GreenCommentSubmitBtn>
            </CommentReplyForm>
          )}
        </CommentReplyFormWrapper>
      </CommentReplyWrapper>
    );
  };

  const PostDetailContent = (
    <ArticleDetailWrapper>
      {post ? (
        <ArticleItem>
          <ArticleBody>
            <ArticleTitleWrapper>
              <ArticleBackBtn onClick={() => navigate('/post')}>◀︎</ArticleBackBtn>
              <ArticleTitle>{post.title}</ArticleTitle>
              <PostWritterWrapper>
                <PostWritterLeftWrapper>
                  <PostWritterText> {post.author_name} </PostWritterText>
                  <PostTimeText>{timeAgoFormat(post.created)}</PostTimeText>
                </PostWritterLeftWrapper>
                <PostWritterAvatar>Avatar</PostWritterAvatar>
              </PostWritterWrapper>
            </ArticleTitleWrapper>
            <ArticleBodyContent>{post.content}</ArticleBodyContent>
            <ArticleBodyFooter>
              <CommentNumIndicator>댓글 {post.comments_num}</CommentNumIndicator>
              <CommentFuncBtn
                onClick={postFuncLikeOnClick}
                color={post.liked ? FuncBtnStatus.Like : FuncBtnStatus.None}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </CommentFuncBtn>
              <CommentFuncNumIndicator>{post.like_num}</CommentFuncNumIndicator>
              <CommentFuncBtn
                onClick={postFuncDislikeOnClick}
                color={post.disliked ? FuncBtnStatus.Dislike : FuncBtnStatus.None}
              >
                <FontAwesomeIcon icon={faThumbsDown} />
              </CommentFuncBtn>
              <CommentFuncNumIndicator>{post.dislike_num}</CommentFuncNumIndicator>
              <CommentFuncBtn
                onClick={postFuncScrapOnClick}
                color={post.scraped ? FuncBtnStatus.Scrap : FuncBtnStatus.None}
              >
                <FontAwesomeIcon icon={faStar} />
              </CommentFuncBtn>
              <CommentFuncNumIndicator>{post.scrap_num}</CommentFuncNumIndicator>

              <TagBubbleWrapper>
                {post.tags.map(tags => {
                  return (
                    <TagBubble
                      key={tags.id}
                      color={tags.color}
                      isPrime={post.prime_tag && tags.id === post.prime_tag.id}
                    >
                      {tags.name}
                    </TagBubble>
                  );
                })}
              </TagBubbleWrapper>
            </ArticleBodyFooter>
          </ArticleBody>
          <ArticleCommentWrapper>
            <CommentWrapper>{commentList.map(comment => CommentItemComponent(comment))}</CommentWrapper>
            <CommentForm>
              <CommentInput
                placeholder="댓글 입력"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
              ></CommentInput>
              <GreenCommentSubmitBtn
                disabled={commentInput === ''}
                onClick={commentCreateOnClick}
                data-parent_comment={null}
              >
                작성
              </GreenCommentSubmitBtn>
            </CommentForm>
          </ArticleCommentWrapper>
        </ArticleItem>
      ) : (
        <LoadingWithoutMinHeight />
      )}
    </ArticleDetailWrapper>
  );
  const CreateBtn = <BlueBigBtn onClick={() => navigate('/post/create')}>글 쓰기</BlueBigBtn>;
  const PostAuthorPanel =
    user?.username == post?.author_name ? (
      <PostPanelWrapper>
        {CreateBtn}
        <BlueBigBtn onClick={() => navigate(`/post/${id}/edit`)}>글 편집</BlueBigBtn>
        <BlueBigBtn onClick={deleteOnClick}>글 삭제</BlueBigBtn>
      </PostPanelWrapper>
    ) : (
      <PostPanelWrapper> {CreateBtn}</PostPanelWrapper>
    );
  const SideBar = (
    <SideBarWrapper>
      {PostAuthorPanel}
      {/* <SideBarItem>사이드바 공간2</SideBarItem> */}
    </SideBarWrapper>
  );
  return PostPageWithSearchBar(PostDetailContent, SideBar);
};

const TagBubbleWrapper = styled.div`
  display: flex;
  margin-left: 10px;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const ArticleBodyFooter = styled.div`
  padding: 10px 20px;
  display: flex;
  justify-content: flex-start;
  width: 100%;
  align-items: center;
`;
const ArticleDetailWrapper = styled.div`
  border: 1px solid black;
  width: 100%;
  height: 100%;
  background-color: var(--fit-white);
  position: relative;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Scroll Shadow */
  background-image: linear-gradient(to top, white, white), linear-gradient(to top, white, white),
    linear-gradient(to top, rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0)),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0));
  background-position: bottom center, top center, bottom center, top center;
  background-color: white;
  background-repeat: no-repeat;
  background-size: 100% 30px, 100% 30px, 100% 30px, 100% 30px;
  background-attachment: local, local, scroll, scroll;
`;

const SideBarItem = styled.div`
  margin-top: 15px;
  width: 100%;
  height: 40%;
`;

const ArticleBody = styled.div`
  /* padding: 10px 20px; */
  font-size: 14px;
  width: 100%;
  height: 80%;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid black;
`;

const ArticleItem = styled.div`
  /* padding: 10px 20px; */
  font-size: 14px;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// Article Title
const ArticleTitleWrapper = styled.div`
  width: 100%;
  padding: 5px 40px 0px 40px;
  background-color: var(--fit-white);
  height: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
  margin-bottom: 20px;
`;

const ArticleBackBtn = styled.button`
  margin-right: 30px;
  font-size: 30px;
  background: none;
  border: none;
  cursor: pointer;
`;

const ArticleTitle = styled.h1`
  font-size: 24px;
`;

const PostWritterWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const PostWritterLeftWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 8px;
  margin-right: 8px;
`;

const PostWritterAvatar = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  font-size: 8px;
`;

const PostWritterText = styled.span`
  font-size: 16px;
  margin-bottom: 3px;
`;

const PostTimeText = styled.span`
  font-size: 13px;
  margin-bottom: 2px;
`;

const ArticleBodyContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
  min-height: 360px;
  font-size: 16px;
`;

// Article Comment List
const ArticleCommentWrapper = styled.div`
  width: 100%;
`;

export const CommentWrapper = styled.div`
  width: 100%;
  padding: 0px 20px;
`;

const CommentReplyWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentItem = styled.div<IPropsComment>`
  padding: 5px 10px;
  font-size: 14px;
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid gray;

  ${({ isChild }) =>
    isChild &&
    `
    padding-left: 40px;
  `}
`;

const CommentWritterWrapperO1 = styled.div`
  text-align: center;
  width: 40px;
  margin-right: 20px;
`;

const CommentWritterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 8px;
`;

const CommentWritterAvatar = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid black;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
`;

const CommentWritterText = styled.span`
  font-size: 12px;
`;

const CommentRightWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 50px;
  flex-direction: column;
  justify-content: space-between;
`;

export const CommentFuncWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const handleFuncBtnColor = (color: string) => {
  switch (color) {
    case FuncBtnStatus.Like:
      return '#ff0000';
    case FuncBtnStatus.Dislike:
      return '#0000ff';
    case FuncBtnStatus.Scrap:
      return '#dddd00';
    default:
      return '#dddddd';
  }
};
export const CommentFuncBtn = styled.div<IPropsFuncBtn>`
  color: ${({ color }) => handleFuncBtnColor(color)};
  cursor: pointer;
  margin-left: 8px;
`;

const CommentFuncBtnWrapper = styled.div`
  margin-left: 12px;
`;

export const CommentFuncTimeIndicator = styled.span`
  font-size: 12px;
  text-align: right;
  margin-left: 12px;
  min-width: 48px;
`;

const CommentNumIndicator = styled.span`
  font-size: 15px;
  width: 50px;
  margin-right: 5px;
  white-space: nowrap;
  /* margin: 0px 5px; */
`;
export const CommentFuncNumIndicator = styled.span`
  font-size: 12px;
  margin-left: 8px;
  min-width: 15px;
  /* margin: 0px 5px; */
`;

export const CommentContentWrapper = styled.div`
  width: 100%;
  margin-top: 5px;
  text-align: left;
`;

const CommentEditInput = styled.input`
  text-align: left;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
`;

export const CommentContent = styled.span`
  text-align: left;
`;

// Comment Writing Form
const CommentForm = styled.div`
  width: 100%;
  background-color: var(--fit-white);
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 20px;
`;

const CommentReplyForm = styled.div`
  width: 100%;
  background-color: var(--fit-white);
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-left: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid gray;
`;

const CommentReplyFormWrapper = styled.div``;

const CommentInput = styled.input`
  width: 90%;
  padding: 10px 12px;
`;

const PostPanelWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default PostDetail;
