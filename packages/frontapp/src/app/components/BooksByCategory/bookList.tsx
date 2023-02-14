import React, { FC, useEffect, useState } from 'react';
import BookCard from '../BookCard';
import { WrapperList } from '../ListBooks';
import { Material, Status } from '@mimir/apollo-client';
import Tags from './tags';
import ItemsNotFound from '../ItemsNotFound';
import styled from '@emotion/styled';
import { dimensions } from '@mimir/ui-kit';
import { t } from 'i18next';

const Header = styled.h2`
  font-size: ${dimensions.xl_2};
  font-weight: 700;
  margin-bottom: ${dimensions.base};
`;

type IStatus = Omit<
  Status,
  'person' | 'material' | 'id' | 'material_id' | 'created_at'
>;
export type IMaterial = Pick<
  Material,
  'id' | 'title' | 'author' | 'type' | 'picture' | 'created_at' | 'category'
> & { currentStatus: IStatus | null };

interface IBookList {
  allData: IMaterial[];
  searchParams: URLSearchParams;
}
const BookList: FC<IBookList> = ({ allData, searchParams }) => {
  const authors = searchParams.getAll('authors');
  const availability = searchParams.getAll('availability');
  const categories = searchParams.getAll('categories');
  const items = searchParams.getAll('items');
  const sortBy = searchParams.getAll('sortby');
  const [filteredData, setFilteredData] = useState<IMaterial[]>([]);
  const [allFilters, setAllFilters] = useState<string[]>([
    ...authors,
    ...availability,
    ...categories,
    ...items,
    ...sortBy,
  ]);

  useEffect(() => {
    setAllFilters([
      ...authors,
      ...availability,
      ...categories,
      ...items,
      ...sortBy,
    ]);

    if (searchParams.toString() === '') {
      setFilteredData(allData);
      return;
    }
    let allBooks = allData;
    if (authors.length !== 0) {
      const filter = allBooks.filter(
        (book: IMaterial) => book && authors.includes(book.author)
      );
      !authors.includes('All') && (allBooks = filter);
    }
    if (categories.length !== 0) {
      const filter = allBooks.filter(
        (book: IMaterial) => book && categories.includes(book.category)
      );

      !categories.includes('All') && (allBooks = filter);
    }
    if (items.length !== 0) {
      const filter = allBooks.filter(
        (book: IMaterial) => book && items.includes(book.type)
      );
      allBooks = filter;
    }
    if (availability.length !== 0) {
      const filter = allBooks.filter((book: IMaterial) =>
        availability.includes(book.currentStatus?.status as string)
      );
      !availability.includes('All') && (allBooks = filter);
    }
    if (sortBy.length !== 0) {
      if (sortBy[0].localeCompare('By date added')) {
        const filter = allBooks.slice().sort((firstBook, secondBook) => {
          const firstDate = new Date(firstBook.created_at);
          const secondDate = new Date(secondBook.created_at);
          return firstDate.getTime() - secondDate.getTime();
        });
        allBooks = filter;
      }
    }
    setFilteredData(allBooks);
  }, [searchParams]);

  return (
    <div data-testid="bookList">
      <Header>
        {t('Readers.TitleFiltered')} - {filteredData.length}
      </Header>
      <Tags chosenTags={allFilters} />
      <WrapperList>
        {filteredData.length !== 0 ? (
          filteredData.map((material: IMaterial) => (
            <BookCard
              key={material.id}
              id={material.id}
              src={material.picture}
              title={material.title}
              author={material.author}
              category={material.category}
              returnDate={material?.currentStatus?.returnDate}
              status={material.currentStatus?.status}
              claimedUserId={material?.currentStatus?.person_id}
            />
          ))
        ) : (
          <ItemsNotFound />
        )}
      </WrapperList>
    </div>
  );
};

export default BookList;
