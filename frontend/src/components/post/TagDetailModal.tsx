import React, { Dispatch, useEffect, useState } from 'react';
import { AnyAction } from 'redux';
import { ChromePicker } from 'react-color';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { faDice, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ColumnCenterFlex } from './layout';
import { TagBubble } from 'components/tag/tagbubble';
import { TAG_CLASS_LIMIT, TAG_NAME_LIMIT } from 'components/tag/TagSelector';
import { tagActions } from 'store/slices/tag';
import { GreenBigBtn, GreenBigSpanBtn } from './button';
import { getRandomHex } from 'utils/color';
import { useSelector } from 'react-redux';
import { RootState } from 'index';
import { postActions } from 'store/slices/post';

export interface TagDetailModalIprops {
  isActive: boolean;
  onClose: () => void;
  modalRef: React.MutableRefObject<null>;
  modalAnimRef: React.MutableRefObject<null>;
  dispatch: Dispatch<AnyAction>;
}

interface IPropsCharNum {
  isFull: boolean;
}

const UNSELECTED = '#dbdbdb';
const CATEGORY = ['태그 목록', '인기있는 태그'];

const getCaloriesInfoText = (forUser: boolean, nickname: string | undefined) => {
  return (
    `운동 태그에 표시된 수치는 ` +
    (forUser ? `${nickname}님의 체중을 기준으로 계산된 kcal/min` : `kcal/min/kg`) +
    `입니다.`
  );
};

const TagDetailModal = ({ isActive, onClose, modalRef, modalAnimRef, dispatch }: TagDetailModalIprops) => {
  const { tagList, popularTags, weight, nickname, tagClassCreate, tagCreate, selected } = useSelector(
    ({ tag, user, post }: RootState) => ({
      tagList: tag.tagList,
      popularTags: tag.popularTags,
      tagClassCreate: tag.tagClassCreate,
      tagCreate: tag.tagCreate,
      weight: user.profile?.weight,
      nickname: user.user?.nickname,
      selected: post.filterTag,
    }),
  );
  const [type, setType] = useState(0);
  const [createCategory, setCreateCategory] = useState<number>(-1);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [newTagCalories, setNewTagCalories] = useState<number>();
  const [caloriesOfUser, setCaloriesOfUser] = useState<boolean>(true);

  const [newCategoryColor, setNewCategoryColor] = useState<string>('#000000');
  const [newCategoryMode, setNewCategoryMode] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');

  useEffect(() => {
    dispatch(tagActions.getTags());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagClassCreate, tagCreate]);
  useEffect(() => {
    setCreateCategory(-1);
  }, [isActive]);
  const closeHandler = () => {
    onClose?.();
  };

  const Modal = (
    <CSSTransition in={isActive} nodeRef={modalAnimRef} timeout={110} classNames="modal" unmountOnExit>
      <ModalOverlay ref={modalAnimRef}>
        <ModalContent className="modal" ref={modalRef}>
          <Divdiv>
            <CategoryWrapper>
              {CATEGORY.map((x, idx) => (
                <Category key={idx} active={type === idx} onClick={() => setType(idx)}>
                  {x}
                </Category>
              ))}
              <ModalExitWrapper>
                <ModalCloseBtn onClick={closeHandler} data-testid="tagModalCloseBtn">
                  <FontAwesomeIcon icon={faX} />
                </ModalCloseBtn>
              </ModalExitWrapper>
            </CategoryWrapper>
            <TagModalContent>
              {
                {
                  0: (
                    <ColumnCenterFlex>
                      <ModalDescriptionSection>
                        <span>{`아래 태그를 클릭하여 태그로 필터링할 수 있습니다.`}</span>
                        <div>
                          <span>{getCaloriesInfoText(caloriesOfUser, nickname)}</span>
                          <GreenBigBtn
                            onClick={() => {
                              setCaloriesOfUser(state => !state);
                            }}
                          >
                            모드 전환
                          </GreenBigBtn>
                          <GreenBigBtn onClick={() => setNewCategoryMode(state => !state)}>새로운 카테고리</GreenBigBtn>
                        </div>
                      </ModalDescriptionSection>
                      {newCategoryMode && (
                        <TagClassSection>
                          <div>
                            <h1>{newCategoryInput === '' ? '새로운 카테고리' : newCategoryInput}</h1>
                            <div
                              style={{
                                backgroundColor: newCategoryColor,
                              }}
                            ></div>
                          </div>
                          <NewCategoryForm
                            onSubmit={async e => {
                              e.preventDefault();
                              dispatch(
                                tagActions.createTagClass({
                                  name: newCategoryInput,
                                  color: newCategoryColor,
                                }),
                              );
                              setNewCategoryInput('');
                            }}
                          >
                            <ChromePicker color={newCategoryColor} onChange={color => setNewCategoryColor(color.hex)} />
                            <div>
                              <GreenBigSpanBtn onClick={() => setNewCategoryColor(getRandomHex())}>
                                랜덤 색상 <FontAwesomeIcon icon={faDice} />
                              </GreenBigSpanBtn>
                              <div>
                                <input
                                  placeholder="새로운 카테고리 이름"
                                  value={newCategoryInput}
                                  onChange={e => {
                                    const charInput = e.target.value;
                                    if (charInput.length <= TAG_CLASS_LIMIT) setNewCategoryInput(charInput);
                                  }}
                                />
                                <TagCharNum isFull={newCategoryInput.length >= TAG_CLASS_LIMIT}>
                                  {newCategoryInput.length} / {TAG_CLASS_LIMIT}
                                </TagCharNum>
                              </div>
                              <GreenBigBtn disabled={newCategoryInput === ''} data-testid="tagModalCategoryCreate">
                                생성
                              </GreenBigBtn>
                            </div>
                          </NewCategoryForm>
                        </TagClassSection>
                      )}

                      {tagList?.map(tagClass => (
                        <TagClassSection key={tagClass.id}>
                          <div>
                            <h1>{tagClass.class_name}</h1>
                            <div
                              style={{
                                backgroundColor: tagClass.color,
                              }}
                            ></div>
                          </div>
                          <div>
                            {tagClass.tags.map(tag => (
                              <TagBubble
                                key={tag.id}
                                color={
                                  selected.length > 0 && selected.filter(item => item.id === tag.id).length === 0
                                    ? UNSELECTED
                                    : tag.color
                                }
                                style={{ cursor: 'pointer' }}
                                onClick={() => dispatch(postActions.toggleFilterTag(tag))}
                              >
                                {tagClass.class_type === 'workout'
                                  ? weight &&
                                    tag.calories &&
                                    (caloriesOfUser
                                      ? `${tag.name} | ${(tag.calories * weight).toFixed(2)}`
                                      : `${tag.name} | ${tag.calories.toFixed(4)}`)
                                  : `${tag.name}`}
                              </TagBubble>
                            ))}
                            {selected.length === 0 && createCategory !== tagClass.id && (
                              <TagBubble
                                color={tagClass.color}
                                onClick={() => {
                                  setNewTagInput('');
                                  setCreateCategory(tagClass.id);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                눌러서 추가
                              </TagBubble>
                            )}
                          </div>
                          {selected.length === 0 && createCategory === tagClass.id && (
                            <NewTagFormDiv>
                              <div>
                                <input
                                  placeholder="새로운 태그 이름"
                                  value={newTagInput}
                                  onChange={e => {
                                    const charInput = e.target.value;
                                    if (charInput.length <= TAG_NAME_LIMIT) setNewTagInput(charInput);
                                  }}
                                />
                                <TagCharNum isFull={newTagInput.length >= TAG_NAME_LIMIT}>
                                  {newTagInput.length} / {TAG_NAME_LIMIT}
                                </TagCharNum>
                              </div>
                              {tagClass.class_type === 'workout' && (
                                <input
                                  placeholder="운동 칼로리(kcal/min/kg)"
                                  value={newTagCalories ? newTagCalories : ''}
                                  type="number"
                                  onChange={e => {
                                    setNewTagCalories(Number.parseFloat(e.target.value));
                                  }}
                                />
                              )}
                              <GreenBigBtn
                                onClick={() => {
                                  setCreateCategory(-1);
                                }}
                              >
                                취소
                              </GreenBigBtn>
                              <GreenBigBtn
                                disabled={newTagInput === ''}
                                onClick={() => {
                                  dispatch(
                                    tagActions.createTag({
                                      name: newTagInput,
                                      classId: tagClass.id,
                                      calories: newTagCalories,
                                    }),
                                  );
                                  setNewTagInput('');
                                  setNewTagCalories(undefined);
                                }}
                                data-testid="tagModalTagCreate"
                              >
                                생성
                              </GreenBigBtn>
                            </NewTagFormDiv>
                          )}
                        </TagClassSection>
                      ))}
                    </ColumnCenterFlex>
                  ),
                  1: (
                    <ColumnCenterFlex>
                      <ModalDescriptionSection>
                        <span>태그로 설정한 글의 개수 순위입니다.</span>
                      </ModalDescriptionSection>
                      <TagRankingSection>
                        {popularTags?.map((tag, index) => (
                          <TagRankingItem key={index}>
                            <span>{index + 1} 위</span>
                            <div>
                              <TagBubble
                                key={tag.id}
                                color={tag.color}
                                onClick={() => dispatch(postActions.toggleFilterTag(tag))}
                                style={{ cursor: 'pointer' }}
                              >
                                {tag.name} | 글 {tag.posts} 개
                              </TagBubble>
                            </div>
                          </TagRankingItem>
                        ))}
                      </TagRankingSection>
                    </ColumnCenterFlex>
                  ),
                }[type]
              }
            </TagModalContent>
          </Divdiv>
        </ModalContent>
      </ModalOverlay>
    </CSSTransition>
  );
  return Modal;
};

const NewCategoryForm = styled.form`
  display: flex;
  > div:nth-child(2) {
    margin: 5px 10px;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;

    > div {
      display: flex;
      flex-direction: column;
      input {
        width: auto;
        padding: 7px 6px;
        border: 1px solid green;
        border-radius: 10px;
        margin-top: 10px;
      }
      span {
        width: 100%;
        text-align: right;
        margin-top: 5px;
        padding-right: 6px;
        margin-bottom: 5px;
      }
    }
    > span {
      width: 100%;
      margin-bottom: 10px;
      text-align: center;
    }
    > button {
      width: 100%;
    }
  }
`;

const NewTagFormDiv = styled.div`
  display: flex;
  align-items: flex-start;
  input {
    font-size: 12px;
    width: 170px;
    overflow-x: visible;
    background: none;
    padding: 5px 6px;
    border: 1px solid green;
    border-radius: 10px;
    margin-right: 5px;
  }
  > div {
    display: flex;
    flex-direction: column;
    > span {
      width: 100%;
      text-align: right;
      padding-top: 3px;
      padding-right: 8px;
    }
  }
`;

const TagCharNum = styled.span<IPropsCharNum>`
  margin-left: 5px;
  text-align: right;
  font-size: 12px;
  color: var(--fit-support-gray);
  ${({ isFull }) =>
    isFull &&
    `
      color: var(--fit-red-neg-hover);
    `}
`;

export const ModalOverlay = styled.div`
  width: 100%;
  height: 100%;

  position: fixed;
  top: 0px;
  left: 0;
  bottom: 0;
  right: 0;

  background-color: var(--fit-modal-background);
`;

const ModalDescriptionSection = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-top: 5px;
  padding: 0px 20px 10px 20px;

  span {
    font-size: 15px;
    text-align: left;
  }
`;

const TagClassSection = styled.div`
  display: flex;
  width: 1000px;
  overflow-x: auto;
  flex-direction: column;

  padding: 10px 20px;
  > div:first-child {
    display: flex;
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    > h1 {
      /* Title */
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 5px;
    }
    > div:nth-child(2) {
      width: 15px;
      height: 15px;
      margin-left: 5px;
      border-radius: 20px;
    }
  }
  > div:nth-child(2) {
    display: flex;
    width: 100%;
    min-height: 40px;
    flex-direction: row;
    overflow-x: auto;
  }
`;

const TagRankingSection = styled.div`
  display: flex;
  width: 1000px;
  flex-direction: column;
  align-items: flex-start;
  > div:first-child {
    border-top: 0.2px solid var(--fit-support-gray-bright);
  }
`;
const TagRankingItem = styled.div`
  display: grid;
  grid-template-columns: 10fr 80fr;
  align-items: center;
  justify-content: space-around;
  border-bottom: 0.2px solid var(--fit-support-gray-bright);
  width: 100%;
  padding: 15px 10px 15px 100px;
  > span:first-child {
    font-size: 16px;
    font-weight: 600;
  }
  > div:last-child {
    width: 100%;
    display: flex;
    justify-content: center;
  }
`;

const ModalContent = styled.div`
  width: fit-content;
  height: fit-content;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 15px;
  /* Modal Shadow */
  -webkit-box-shadow: 0 10px 12px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 0 10px 12px rgba(0, 0, 0, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  -webkit-background-clip: padding-box;
  -moz-background-clip: padding-box;
  background-clip: padding-box;
`;

const ModalExitWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 20px;
  color: var(--fit-red-neg);
`;

const Divdiv = styled.div`
  width: 1000px;
  height: 600px;
  background-color: var(--fit-white);
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  border-radius: inherit;
`;

const ModalCloseBtn = styled.div`
  width: fit-content;
  cursor: pointer;
`;

const CategoryWrapper = styled.div`
  position: fixed;
  display: flex;
  width: 100%;
  align-items: center;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: var(--fit-white);

  div:nth-child(2) {
    border-left: 1px solid black;
  }
`;
const Category = styled.div<{ active: boolean }>`
  width: 100%;
  height: 40px;
  padding: 10px 0px;
  text-align: center;
  color: ${props => (props.active ? '#198331' : '#000000')};
  font-size: 18px;
  font-weight: ${props => (props.active ? '600' : '400')};
  font-family: NanumSquareR;
  border-bottom: 1px solid black;

  cursor: pointer;
  &:hover {
    font-weight: 600;
  }

  @media all and (max-width: 500px) {
    font-size: 17px;
  }
  @media all and (max-width: 360px) {
    font-size: 15px;
    font-family: 'Noto Sans KR', sans-serif;
  }
`;
const TagModalContent = styled.div`
  margin-top: 40px;
  width: 1000px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export default TagDetailModal;
