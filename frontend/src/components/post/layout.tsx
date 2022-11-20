import styled from 'styled-components';

// Used in PostEditorLayout.tsx, PostDetail.tsx
export const RowCenterFlex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

// Used in PostEditorLayout.tsx, PostMain.tsx, PostDetail.tsx
export const ColumnFlex = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ColumnCenterFlex = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
`;

// Used in PostMain.tsx
export const ArticleItemGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 30fr 10fr 5fr 5fr;
  grid-template-rows: 1fr;
  place-items: center;
`;

// Used in PostMain.tsx, PostDetail.tsx
export const PostContentWrapper = styled(ColumnCenterFlex)`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  max-width: 1200px;

  @media all and (max-width: 650px) {
    width: 100%;
  }

  > div:first-child {
    /* Top Section */
    margin: 40px 0px 15px 0px;
    width: 100%;
    background-color: var(--fit-white);
  }

  > div:nth-child(2) {
    /* MainContent & Sidebar Section */
    display: grid;
    grid-template-columns: 8fr 2fr;
    row-gap: 10px;
    column-gap: 10px;
    width: 100%;
    height: 80vh;
    min-height: 640px;
    margin-bottom: 50px;

    > div:first-child {
      /* MainContent */
    }

    > div:nth:child(2) {
      /* SideBar */
      width: 100%;
    }
  }
`;
