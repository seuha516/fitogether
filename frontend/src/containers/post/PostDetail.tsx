import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useOnClickOutside } from 'usehooks-ts';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { RootState } from 'index';
import { timeAgoFormat } from 'utils/datetime';
import { funcTypeToStr, postActions } from 'store/slices/post';
import { Comment } from 'store/apis/comment';
import { LoadingWithoutMinHeight } from 'components/common/Loading';
import { BlueBigBtn, CommentGreenBtn, RedSmallBtn, GreenCommentSubmitBtn } from 'components/post/button';
import { TagBubble } from 'components/tag/tagbubble';
import {
  ColumnCenterFlex,
  ColumnFlex,
  PostContentWrapper,
  PostPageWrapper,
  RowCenterFlex,
} from 'components/post/layout';
import { UserDetailHorizontalModal, UserDetailModal } from 'components/post/UserDetailModal';
import ImageDetailModal from 'components/post/ImageDetailModal';
import { chatActions } from 'store/slices/chat';
import SearchBar from 'components/common/SearchBar';
import { ScrollShadow } from 'components/common/ScrollShadow';

export interface IPropsComment {
  isChild?: boolean;
}

export const FuncType = {
  None: 'none',
  Like: 'like',
  Dislike: 'dislike',
  Scrap: 'scrap',
};

interface IPropsFuncBtn {
  color: string;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentReplyInput, setCommentReplyInput] = useState('');
  const [commentEditInput, setCommentEditInput] = useState('');
  const [commentNum, changeCommentNum] = useState(0);
  const [replyActivated, setReplyActivated] = useState(false);
  const [editActivated, setEditActivated] = useState(false);

  // --- Modal Configurations --------------------------------------------------------
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentModalDisable, setCommentModalDisable] = useState(false);
  const [commentModalNum, setCommentModalNum] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  const commentModalPivot = useRef<HTMLImageElement[]>([]);
  const postModalPivot = useRef<HTMLImageElement>(null);
  const postModalRef = useRef(null);
  const commentModalRef = useRef(null);
  const imageModalRef = useRef(null);
  const imageModalAnimRef = useRef(null);

  const imageModalOnClose = () => setImageModalOpen(false);
  // Disable modal when OnClickOutside
  useOnClickOutside(
    postModalRef,
    () => {
      setPostModalOpen(false);
    },
    'mousedown',
  );
  useOnClickOutside(
    commentModalRef,
    () => {
      setCommentModalOpen(false);
      setTimeout(() => setCommentModalDisable(false), 300);
    },
    'mousedown',
  );
  useOnClickOutside(imageModalRef, imageModalOnClose, 'mousedown');

  // Disable scroll when modal is active
  useEffect(() => {
    const body = document.getElementById('articleDetailWrapper');
    if (body) {
      if (postModalOpen || commentModalOpen) {
        document.body.style.overflowY = 'hidden';
        body.style.overflowY = 'hidden';
      } else {
        document.body.style.overflowY = 'unset';
        body.style.overflowY = 'auto';
      }
    }
  }, [postModalOpen, commentModalOpen]);

  // --- Modal Configurations End --------------------------------------------------------

  const user = useSelector(({ user }: RootState) => user.user);
  const { socket, post, postComment, postDeleteStatus, postFuncStatus, commentFuncStatus, chatroomId } = useSelector(
    ({ chat, post }: RootState) => ({
      socket: chat.socket,
      post: post.postDetail.post,
      postComment: post.postComment.comments,
      postDeleteStatus: post.postDelete,
      postFuncStatus: post.postFunc,
      commentFuncStatus: post.postComment.commentFunc,
      chatroomId: chat.create.id,
    }),
  );

  useEffect(() => {
    return () => {
      dispatch(postActions.resetPost());
      dispatch(chatActions.resetCreate());
    };
  }, []);
  useEffect(() => {
    if (chatroomId) {
      navigate(`/chat/${chatroomId}`);
    }
  }, [navigate, chatroomId]);
  useEffect(() => {
    if (id) {
      dispatch(
        postActions.updatePostDetail({
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
  }, [postComment]); // This looks disposable, but it makes the action smoothly.
  useEffect(() => {
    if (postDeleteStatus) {
      navigate('/post');
      dispatch(postActions.stateRefresh());
    }
  }, [postDeleteStatus]);

  // type_str : { 'like', 'dislike', 'scrap' }
  const postFuncOnClick = (type_str: string) => {
    if (id) {
      dispatch(
        postActions.postFunc({
          post_id: id,
          func_type: type_str,
        }),
      );
    }

    if (user && post && socket) {
      if (type_str === 'like' && post.liked) return;
      if (type_str === 'dislike' && post.disliked) return;
      if (type_str === 'scrap' && post.scraped) return;

      socket.send(
        JSON.stringify({
          type: 'notification',
          data: {
            category: 'postFunc',
            info: {
              me: user.username,
              post: id,
            },
            content: `${user.nickname}님이 내 글에 ${funcTypeToStr(type_str)} 눌렀습니다.`,
            image: user.image,
            link: `/post/${id}`,
          },
        }),
      );
    }
  };
  // type_str : { 'like', 'dislike' }
  const commentFuncOnClick = (comment: Comment, type_str: string) => {
    dispatch(
      postActions.commentFunc({
        comment_id: comment.comment_id,
        func_type: type_str,
      }),
    );

    if (user && socket) {
      if (type_str === 'like' && comment.liked) return;
      if (type_str === 'dislike' && comment.disliked) return;

      const pair = (x: string) => {
        if (x === 'like') return '좋아요를';
        else if (x === 'dislike') return '싫어요를';
      };
      socket.send(
        JSON.stringify({
          type: 'notification',
          data: {
            category: 'commentFunc',
            info: {
              me: user.username,
              comment: comment.comment_id,
            },
            content: `${user.nickname}님이 내 댓글에 ${pair(type_str)} 눌렀습니다.`,
            image: user.image,
            link: `/post/${id}`,
          },
        }),
      );
    }
  };

  const postDeleteOnClick = () => {
    if (id) {
      dispatch(
        postActions.deletePost({
          post_id: id,
        }),
      );
    }
  };

  const commentCreateOnClick = (parent_comment: string | null) => {
    if (user && id) {
      dispatch(
        postActions.createComment({
          content: parent_comment ? commentReplyInput : commentInput,
          author_name: user.username,
          post_id: id,
          parent_comment: parent_comment ? parent_comment : 'none',
        }),
      );

      if (socket) {
        socket.send(
          JSON.stringify({
            type: 'notification',
            data: {
              category: 'comment',
              info: {
                me: user.username,
                post: id,
                comment: parent_comment,
              },
              content: `${user.nickname}님이 ${parent_comment ? '답글' : '댓글'}을 남겼습니다. "${
                parent_comment ? commentReplyInput : commentInput
              }"`,
              image: user.image,
              link: `/post/${id}`,
            },
          }),
        );
      }

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
      // console.log('user or id is not valid');
    }
  };

  const commentReplyOpenOnClick = (comment: Comment) => {
    dispatch(postActions.toggleCommentReply({ parent_comment: comment.comment_id }));
    setReplyActivated(!replyActivated);
  };

  const commentEditOpenOnClick = (comment: Comment) => {
    dispatch(postActions.toggleCommentEdit({ comment_id: comment.comment_id }));
    setCommentEditInput(comment.content);
    setEditActivated(true);
  };

  const commentEditConfirmOnClick = (comment: Comment) => {
    dispatch(
      postActions.editComment({
        comment_id: comment.comment_id,
        content: commentEditInput,
      }),
    );
    dispatch(postActions.toggleCommentEdit({ comment_id: comment.comment_id }));
    changeCommentNum(Date.now());
    setEditActivated(false);
  };

  const commentEditCancelOnClick = (comment: Comment) => {
    dispatch(postActions.toggleCommentEdit({ comment_id: comment.comment_id }));
    setEditActivated(false);
  };

  const commentDeleteOnClick = (target_id: string) => {
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
        <FuncBtnWrapper>
          <RedSmallBtn onClick={() => commentEditCancelOnClick(comment)}>취소</RedSmallBtn>
          <CommentGreenBtn disabled={commentEditInput == ''} onClick={() => commentEditConfirmOnClick(comment)}>
            완료
          </CommentGreenBtn>
        </FuncBtnWrapper>
      );
    } else {
      return (
        <FuncBtnWrapper>
          {comment.parent_comment === null && (
            <CommentGreenBtn
              onClick={() => commentReplyOpenOnClick(comment)}
              disabled={replyActivated && !comment.replyActive}
            >
              답글
            </CommentGreenBtn>
          )}
          {user?.username == comment?.author.username && (
            <>
              <CommentGreenBtn disabled={editActivated} onClick={() => commentEditOpenOnClick(comment)}>
                수정
              </CommentGreenBtn>
              <RedSmallBtn onClick={() => commentDeleteOnClick(comment.comment_id)}>삭제</RedSmallBtn>
            </>
          )}
        </FuncBtnWrapper>
      );
    }
  };

  const CommentItemComponent = (comment: Comment) => {
    return (
      <CommentReplyWrapper key={comment.comment_id}>
        <CommentItem isChild={comment.parent_comment !== null}>
          {/* {comment.parent_comment !== null && <FontAwesomeIcon icon={faArrowRightLong} />} */}

          <CommentWritterWrapper>
            <CommentWritterAvatar>
              <UserAvatar
                ref={el => (commentModalPivot.current[Number.parseInt(comment.comment_id)] = el as HTMLImageElement)}
                src={process.env.REACT_APP_API_IMAGE + comment.author.avatar}
                onClick={() => {
                  if (!commentModalOpen && !commentModalDisable) {
                    setCommentModalNum(comment.comment_id);
                    setCommentModalOpen(true);
                    setCommentModalDisable(true);
                  }
                }}
                alt={`commentAvatar${comment.comment_id}`}
              />
              {UserDetailHorizontalModal({
                isActive: commentModalOpen && commentModalNum === comment.comment_id,
                modalRef: commentModalRef,
                pivotRef: commentModalPivot.current[Number.parseInt(comment.comment_id)],
                userInfo: comment.author,
                navigate,
                username: user ? user.username : '',
                clickedChat: () => dispatch(chatActions.createChatroom({ username: comment.author.username })),
              })}
            </CommentWritterAvatar>
            <CommentWritterText> {comment.author.nickname} </CommentWritterText>
          </CommentWritterWrapper>
          <CommentRightWrapper>
            <CommentContentWrapper>
              {comment.editActive ? (
                <CommentEditInput
                  data-testid="commentEditInput"
                  value={commentEditInput}
                  onChange={e => setCommentEditInput(e.target.value)}
                ></CommentEditInput>
              ) : (
                <CommentContent>{comment.content}</CommentContent>
              )}
            </CommentContentWrapper>
            <CommentFuncWrapper>
              {CommentBtnComponent(comment)}
              <FuncBtn
                data-testid="commentFuncLike"
                onClick={() => commentFuncOnClick(comment, FuncType.Like)}
                color={comment.liked ? FuncType.Like : FuncType.None}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </FuncBtn>
              <CommentFuncNumIndicator>{comment.like_num}</CommentFuncNumIndicator>
              <FuncBtn
                data-testid="commentFuncDislike"
                onClick={() => commentFuncOnClick(comment, FuncType.Dislike)}
                color={comment.disliked ? FuncType.Dislike : FuncType.None}
              >
                <FontAwesomeIcon icon={faThumbsDown} />
              </FuncBtn>
              <CommentFuncNumIndicator>{comment.dislike_num}</CommentFuncNumIndicator>
              <CommentFuncTimeIndicator>
                {timeAgoFormat(new Date(), new Date(comment.created))}
              </CommentFuncTimeIndicator>
            </CommentFuncWrapper>
          </CommentRightWrapper>
        </CommentItem>
        <div>
          {comment.replyActive === true && (
            <CommentReplyForm onSubmit={e => e.preventDefault()}>
              <CommentInput
                placeholder="답글 입력"
                value={commentReplyInput}
                onChange={e => setCommentReplyInput(e.target.value)}
              ></CommentInput>
              <GreenCommentSubmitBtn
                data-testid="commentReplySubmitBtn"
                disabled={commentReplyInput === ''}
                onClick={() => commentCreateOnClick(comment.comment_id)}
              >
                작성
              </GreenCommentSubmitBtn>
            </CommentReplyForm>
          )}
        </div>
      </CommentReplyWrapper>
    );
  };

  const CreateBtn = <BlueBigBtn onClick={() => navigate('/post/create')}>글 쓰기</BlueBigBtn>;
  const PostAuthorPanel =
    user?.username == post?.author.username ? (
      <PostPanelWrapper>
        {CreateBtn}
        <BlueBigBtn onClick={() => navigate(`/post/${id}/edit`)}>글 편집</BlueBigBtn>
        <BlueBigBtn onClick={postDeleteOnClick}>글 삭제</BlueBigBtn>
      </PostPanelWrapper>
    ) : (
      <PostPanelWrapper>{CreateBtn}</PostPanelWrapper>
    );

  const postSearch = useSelector(({ post }: RootState) => post.postSearch);
  const [search, setSearch] = useState(postSearch);

  useEffect(() => {
    setSearch(postSearch);
  }, []);
  return (
    <PostPageWrapper>
      <PostContentWrapper>
        <div>
          <SearchBar
            onSubmit={e => {
              e.preventDefault();
              navigate(`/post`);
              dispatch(
                postActions.postSearch({
                  search_keyword: search,
                }),
              );
            }}
            onClear={() => {
              setSearch('');
              dispatch(
                postActions.postSearch({
                  search_keyword: '',
                }),
              );
            }}
            search={search}
            setSearch={setSearch}
          />
        </div>
        <div>
          <ArticleDetailWrapper id="articleDetailWrapper">
            {post ? (
              <ArticleItem>
                <div>
                  <ArticleTitleWrapper>
                    <ArticleBackBtn onClick={() => navigate('/post')}>◀︎</ArticleBackBtn>
                    <ArticleTitle>{post.title}</ArticleTitle>
                    <PostWritterWrapper>
                      <PostWritterLeftWrapper>
                        <PostWritterText> {post.author.nickname} </PostWritterText>
                        <PostTimeText>{timeAgoFormat(new Date(), new Date(post.created))}</PostTimeText>
                      </PostWritterLeftWrapper>
                      <PostWritterAvatar>
                        <UserAvatar
                          ref={postModalPivot}
                          src={process.env.REACT_APP_API_IMAGE + post.author.avatar}
                          onClick={() => setPostModalOpen(true)}
                          alt="postAvatar"
                        />
                        {UserDetailModal({
                          isActive: postModalOpen,
                          modalRef: postModalRef,
                          pivotRef: postModalPivot,
                          userInfo: post.author,
                          navigate,
                          username: user ? user.username : '',
                          clickedChat: () => dispatch(chatActions.createChatroom({ username: post.author.username })),
                        })}
                      </PostWritterAvatar>
                    </PostWritterWrapper>
                  </ArticleTitleWrapper>
                  <ArticleBodyContent>{post.content}</ArticleBodyContent>
                  <ContentImageSection>
                    {post.images?.map((img, index) => (
                      <PostUploadedImageWrapper key={index}>
                        <img
                          src={process.env.REACT_APP_API_IMAGE + img}
                          onClick={() => {
                            setActiveImage(img);
                            setImageModalOpen(true);
                          }}
                          data-testid="postImage"
                        />
                      </PostUploadedImageWrapper>
                    ))}
                  </ContentImageSection>
                  <ArticleBodyFooter>
                    <CommentNumIndicator>댓글 {post.comments_num}</CommentNumIndicator>
                    <FuncBtn
                      data-testid="postFuncLike"
                      onClick={() => postFuncOnClick(FuncType.Like)}
                      color={post.liked ? FuncType.Like : FuncType.None}
                    >
                      <FontAwesomeIcon icon={faThumbsUp} />
                    </FuncBtn>
                    <CommentFuncNumIndicator>{post.like_num}</CommentFuncNumIndicator>
                    <FuncBtn
                      data-testid="postFuncDislike"
                      onClick={() => postFuncOnClick(FuncType.Dislike)}
                      color={post.disliked ? FuncType.Dislike : FuncType.None}
                    >
                      <FontAwesomeIcon icon={faThumbsDown} />
                    </FuncBtn>
                    <CommentFuncNumIndicator>{post.dislike_num}</CommentFuncNumIndicator>
                    <FuncBtn
                      data-testid="postFuncScrap"
                      onClick={() => postFuncOnClick(FuncType.Scrap)}
                      color={post.scraped ? FuncType.Scrap : FuncType.None}
                    >
                      <FontAwesomeIcon icon={faStar} />
                    </FuncBtn>
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
                </div>
                <div>
                  <CommentWrapper>{commentList.map(comment => CommentItemComponent(comment))}</CommentWrapper>
                  <CommentForm onSubmit={e => e.preventDefault()}>
                    <CommentInput
                      placeholder="댓글 입력"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                    ></CommentInput>
                    <GreenCommentSubmitBtn disabled={commentInput === ''} onClick={() => commentCreateOnClick(null)}>
                      작성
                    </GreenCommentSubmitBtn>
                  </CommentForm>
                </div>
              </ArticleItem>
            ) : (
              <LoadingWithoutMinHeight />
            )}
          </ArticleDetailWrapper>
          <div>{PostAuthorPanel}</div>
        </div>
      </PostContentWrapper>
      {ImageDetailModal({
        isActive: imageModalOpen,
        onClose: imageModalOnClose,
        modalRef: imageModalRef,
        modalAnimRef: imageModalAnimRef,
        activeImage,
      })}
    </PostPageWrapper>
  );
};

export const TagBubbleWrapper = styled.div`
  display: flex;
  margin-left: 10px;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ArticleBodyFooter = styled.div`
  padding: 10px 20px;
  display: flex;
  justify-content: flex-start;
  width: 100%;
  align-items: center;
`;

export const ArticleDetailWrapper = styled(ScrollShadow)`
  width: 100%;
  height: 100%;
  background-color: var(--fit-white);
  overflow-y: auto;
  border-radius: 15px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ArticleItem = styled.div`
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
  > div:first-child {
    /* Article Body : Post, PostFunc */
    font-size: 14px;
    width: 100%;
    height: 80%;
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid var(--fit-support-gray-bright);
    margin-bottom: 8px;
  }
  > div:nth-child(2) {
    /* Comment Wrapper */
    width: 100%;
  }
`;

// Article Title
export const ArticleTitleWrapper = styled.div`
  width: 100%;
  padding: 5px 30px 0px 30px;
  background-color: var(--fit-white);
  height: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--fit-support-gray-bright);
  margin-bottom: 20px;
`;

export const ArticleBackBtn = styled.button`
  margin-right: 30px;
  font-size: 30px;
  background: none;
  border: none;
  cursor: pointer;
`;

export const ArticleTitle = styled.h1`
  width: fit-content;
  font-size: 24px;
  word-wrap: break-word;
  word-break: break-all;
`;

export const PostWritterWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const PostWritterLeftWrapper = styled.div`
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 8px;
  margin-right: 8px;
`;

export const PostWritterAvatar = styled(RowCenterFlex)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 5px;
  font-size: 8px;
`;

export const PostWritterText = styled.span`
  width: 100%;
  font-size: 16px;
  margin-bottom: 3px;
`;

export const PostTimeText = styled.span`
  font-size: 13px;
  margin-bottom: 2px;
`;

export const ArticleBodyContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
  min-height: 360px;
  font-size: 16px;
  word-wrap: break-word;
  word-break: break-all;
`;

// Article Comment List
export const ArticleCommentWrapper = styled.div``;

export const CommentWrapper = styled.div`
  width: 100%;
  padding: 0px 20px;
`;

export const CommentReplyWrapper = styled(ColumnFlex)``;

export const CommentItem = styled.div<IPropsComment>`
  padding: 5px 10px;
  font-size: 14px;
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--fit-support-gray-bright);

  ${({ isChild }) =>
    isChild &&
    `
    padding-left: 40px;
  `}
`;

export const CommentWritterWrapper = styled(ColumnFlex)`
  align-items: center;
  font-size: 8px;
  text-align: center;
  width: fit-content;
  margin-right: 20px;
`;

export const CommentWritterAvatar = styled(RowCenterFlex)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 5px;
`;

export const UserAvatar = styled.img`
  border: 1px solid black;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
`;

export const CommentWritterText = styled.span`
  font-size: 12px;
  width: fit-content;
  white-space: nowrap;
`;

export const CommentRightWrapper = styled(ColumnFlex)`
  width: 100%;
  height: 100%;
  min-height: 50px;
  justify-content: space-between;
`;

export const CommentFuncWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const handleFuncBtnColor = (color: string) => {
  switch (color) {
    case FuncType.Like:
      return '#ff0000';
    case FuncType.Dislike:
      return '#0000ff';
    case FuncType.Scrap:
      return '#dddd00';
    default:
      return '#dddddd';
  }
};
export const FuncBtn = styled.div<IPropsFuncBtn>`
  color: ${({ color }) => handleFuncBtnColor(color)};
  cursor: pointer;
  margin-left: 8px;
`;

export const FuncBtnWrapper = styled.div`
  margin-left: 12px;
`;

export const CommentFuncTimeIndicator = styled.span`
  font-size: 12px;
  text-align: right;
  margin-left: 12px;
  min-width: 48px;
`;

export const CommentNumIndicator = styled.span`
  font-size: 15px;
  width: 50px;
  margin-right: 5px;
  white-space: nowrap;
`;
export const CommentFuncNumIndicator = styled.span`
  font-size: 12px;
  margin-left: 8px;
  min-width: 15px;
`;

export const CommentContentWrapper = styled.div`
  width: 100%;
  margin-top: 5px;
  text-align: left;
`;

export const CommentEditInput = styled.input`
  text-align: left;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
`;

export const CommentContent = styled.span`
  text-align: left;
`;

// Comment Writing Form
export const CommentForm = styled.form`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 20px;
`;

export const CommentReplyForm = styled.form`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-left: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid gray;
`;

export const CommentInput = styled.input`
  width: 90%;
  padding: 10px 12px;
`;

export const PostPanelWrapper = styled(ColumnCenterFlex)`
  width: 100%;
`;

// Image Content Section
export const ContentImageSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  height: fit-content;
  position: relative;
  background-color: var(--fit-white);
  padding: 8px 10px;
`;

export const PostUploadedImageWrapper = styled.div`
  width: 130px;
  height: 130px;
  border-radius: 15px;
  margin: 5px 5px;
  position: relative;

  img {
    width: 130px;
    height: 130px;
    background-color: var(--fit-disabled-gray);
    border-radius: 15px;
    object-fit: cover;
    cursor: pointer;
  }
`;

export default PostDetail;
