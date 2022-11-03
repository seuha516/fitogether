import { RootState } from 'index';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postActions } from 'store/slices/post';
import styled from 'styled-components';

interface IPropsSearchClear {
  isActive?: boolean;
}

interface IPropsBtn {
  isActive?: boolean;
  onClick?: () => void;
}

const PostPageWrapper = styled.div`
  background-color: #d7efe3;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`;

const PostContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media all and (max-width: 650px) {
    width: 100%;
  }
`;

const TopElementWrapperWithoutPadding = styled.div`
  margin: 40px 0px 15px 0px;
  border: 1px solid black;
  width: 100%;
  background-color: #ffffff;
`;

const Main_SideWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 600px;
  height: 70vh;
`;

export const PostPageLayout = (topElement: JSX.Element, mainElement: JSX.Element, sideElement: JSX.Element) => (
  <PostPageWrapper>
    <PostContentWrapper>
      <TopElementWrapperWithoutPadding>{topElement}</TopElementWrapperWithoutPadding>
      <Main_SideWrapper>
        {mainElement}
        {sideElement}
      </Main_SideWrapper>
    </PostContentWrapper>
  </PostPageWrapper>
);

const SearchForm = styled.form`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchInput = styled.input`
  width: 95%;
  padding: 15px 20px;
  border: none;
`;
const ClearSearchInput = styled.span<IPropsSearchClear>`
  width: 5%;
  text-align: center;
  cursor: pointer;
  ${({ isActive }) =>
    !isActive &&
    `
    display: none;
  `}
`;
export const SideBarWrapper = styled.div`
  /* border: 1px solid black; */
  width: 20%;
`;

export const PostPageWithSearchBar = (mainElement: JSX.Element, sideElement: JSX.Element) => {
  const postSearch = useSelector(({ post }: RootState) => post.postSearch);
  const [search, setSearch] = useState(postSearch);
  const dispatch = useDispatch();
  useEffect(() => {
    setSearch(postSearch);
  }, []);
  return (
    <PostPageWrapper>
      <PostContentWrapper>
        <TopElementWrapperWithoutPadding>
          <SearchForm
            onSubmit={e => {
              e.preventDefault();
              dispatch(
                postActions.postSearch({
                  search_keyword: search,
                }),
              );
            }}
          >
            <SearchInput
              placeholder="Search keyword"
              value={search}
              onChange={e => setSearch(e.target.value)}
            ></SearchInput>
            <ClearSearchInput isActive={search !== ''} onClick={() => setSearch('')}>
              Clear
            </ClearSearchInput>
          </SearchForm>
        </TopElementWrapperWithoutPadding>
        <Main_SideWrapper>
          {mainElement}
          {sideElement}
        </Main_SideWrapper>
      </PostContentWrapper>
    </PostPageWrapper>
  );
};

export const postEditorLayout = (
  title: string,
  setTitle: (value: React.SetStateAction<string>) => void,
  content: string,
  setContent: (value: React.SetStateAction<string>) => void,
  cancelOnClick: () => void,
  confirmOnClick: () => void,
) => {
  return (
    <PostPageWrapper>
      <PostContentWrapper>
        <TopElementWrapperWithoutPadding>
          <TitleInput type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        </TopElementWrapperWithoutPadding>
        <Main_SideWrapper>
          <ContentWrapper>
            <ContentTextArea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
            <CreateBtnWrapper>
              <CancelPostBtn onClick={cancelOnClick}>취소</CancelPostBtn>
              <CreatePostBtn
                onClick={confirmOnClick}
                isActive={title !== '' && content !== ''}
                disabled={title === '' || content === ''}
              >
                완료
              </CreatePostBtn>
            </CreateBtnWrapper>
          </ContentWrapper>
          <SideBarWrapper>
            <span>Tag TBD</span>
          </SideBarWrapper>
        </Main_SideWrapper>
      </PostContentWrapper>
    </PostPageWrapper>
  );
};

const TitleInput = styled.input`
  width: 100%;
  height: 100%;
  padding: 8px 20px;
  font-size: 28px;
`;
const ContentTextArea = styled.textarea`
  width: 100%;
  height: 90%;
  padding: 16px 30px;
  font-size: 20px;
  resize: none;
`;
const CreateBtnWrapper = styled.div`
  border: 1px solid black;
  margin-right: 15px;
  width: 100%;
  height: 10%;
  position: absolute;
  bottom: 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;
const ContentWrapper = styled.div`
  width: 80%;
  height: 100%;
  position: relative;
`;
const CreatePostBtn = styled.button<IPropsBtn>`
  padding: 0px 14px;
  width: 200px;
  height: 30px;
  border-radius: 15px;
  background-color: #dddddd;
  font-size: 15px;
  letter-spacing: 0.5px;
  margin: 5px 20px;

  ${({ isActive }) =>
    isActive &&
    `
    background: #8ee5b9;
    &:hover {
      background-color: #45d9fa;
    }
  `}
`;
const CancelPostBtn = styled.button`
  padding: 0px 14px;
  width: 200px;
  height: 30px;
  border-radius: 15px;
  background-color: #f53333;
  font-size: 15px;
  letter-spacing: 0.5px;
  margin: 5px 20px;
  &:hover {
    background-color: #ff4444;
  }
`;
