import React from 'react';
import emptyList from '../../../assets/EmptyList.png';
import styled from '@emotion/styled';
import { TitleArticle } from '../../globalUI/TextArticle';
import { TextBase } from '../../globalUI/TextBase';
import { colors, dimensions } from '@mimir/ui-kit';

const Wrapper = styled.section`
  width: 100%;
  max-height: 32.5rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: ${colors.bg_secondary};
  padding: 7.5rem 0;
  border-radius: ${dimensions.xs_1};
  margin-top: ${dimensions.xl_2};
  @media (max-width: 768px) {
    & img {
      display: none;
    }
  }
`;

const WrapperText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  margin-top: ${dimensions.base_2};
  max-width: 26rem;
  width: 100%;
`;

const StyleTitle = styled(TitleArticle)`
  font-size: ${dimensions.xl};
  margin-bottom: ${dimensions.xs_2};
`;

const StyleTextBase = styled(TextBase)`
  margin-top: ${dimensions.xs_2};
`;

const EmptyListItems = () => {
  return (
    <Wrapper>
      <img src={emptyList} alt="no items" />
      <WrapperText>
        <StyleTitle>Shelf for your books and other items</StyleTitle>
        <StyleTextBase>
          Go to the search section and choose the one that suits you
        </StyleTextBase>
      </WrapperText>
    </Wrapper>
  );
};

export default EmptyListItems;
