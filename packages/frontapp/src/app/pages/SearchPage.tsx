import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { dimensions } from '@mimir/ui-kit';
import { ButtonGroup } from './BookPreview';
import { useGetAllMaterialsQuery } from '@mimir/apollo-client';
import { ReactComponent as ScrollButtonRight } from '../../assets/ArrowButtonRight.svg';
import { ReactComponent as ScrollButtonLeft } from '../../assets/ArrowButtonLeft.svg';
import CategoriesList from '../components/CategoriesList';
import AllBooksList from '../components/AllBooksList';
import { useAppSelector } from '../hooks/useTypedSelector';
import { getStatus } from '../models/helperFunctions/converTime';

const ContentWrapper = styled.div`
  margin: 3rem 0 ${dimensions.xl_6};
`;

const TopicNameWrapper = styled.div`
  margin-bottom: ${dimensions.xl_2};
  display: flex;
`;

const MainText = styled.h3`
  margin: 3.5rem 0 ${dimensions.xl_6};
  font-weight: 700;
  font-size: ${dimensions.xl_2};
`;

const Topics = styled.h5`
  font-weight: 700;
  flex: 1;
  font-size: ${dimensions.xl};
`;

const SearchPage = () => {
  const { location } = useAppSelector((state) => state.user);
  const [availableMaterial, setAvailableMaterial] = useState<any>([]);
  const { data, loading } = useGetAllMaterialsQuery({
    variables: { location_id: location.id },
    fetchPolicy: 'no-cache',
  });
  useEffect(() => {
    const available = data?.getAllMaterials.filter((material: any) => {
      const lastStatus = material.statuses.slice(-1)[0];
      const currentStatus = getStatus(lastStatus?.status, material?.created_at);
      return currentStatus !== 'Rejected' && currentStatus !== 'Pending';
    });
    setAvailableMaterial(available);
  }, [data]);

  const allCategories = availableMaterial?.reduce(
    (acc: any, material: any) => ({
      ...acc,
      [material?.category as string]: acc[material?.category as string]
        ? acc[material?.category as string] + 1
        : 1,
    }),
    {} as { [category: string]: number }
  );

  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <MainText>Categories</MainText>
      <CategoriesList allCategories={allCategories} />
      {allCategories &&
        Object.keys(allCategories).map((category) => {
          return (
            <ContentWrapper key={category}>
              <TopicNameWrapper>
                <Topics>{category}</Topics>
                <ButtonGroup>
                  <ScrollButtonLeft />
                  <ScrollButtonRight />
                </ButtonGroup>
              </TopicNameWrapper>
              <AllBooksList
                sortingCategory={category}
                items={availableMaterial}
              />
            </ContentWrapper>
          );
        })}
    </>
  );
};

export default SearchPage;
