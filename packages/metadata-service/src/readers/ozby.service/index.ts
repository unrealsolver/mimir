import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import cheerio from 'cheerio';
import * as _ from 'lodash';
import axios from 'axios';
import { Bundle } from '../../types';
import { DigitalSpaceService } from '../../digitalSpace/digitalSpace.service';

type Author = {
  name: string;
  referenceId: string;
};

type Publisher = {
  name: string;
  referenceId: string;
};

type CoverImage = {
  title: string;
  src: string;
};

const READER_ID = 'OZBY';

function forClass(className, extractVal: (p: any) => [string, any]) {
  return function (keyEl, valEl) {
    if (keyEl.hasClass(className)) {
      return extractVal(valEl);
    }
    return null;
  };
}

function forKey(key, extractVal: (p: any) => [string, any]) {
  return function (keyEl, valEl) {
    if (keyEl.text() === key) {
      return extractVal(valEl);
    }
    return null;
  };
}

function extractTo(destinationKey: string) {
  return function (valEl: any): [string, any] {
    return [destinationKey, valEl.text().trim()];
  };
}

function ignore(valEl) {
  return null;
}

function readCells(keyEl, valEl) {
  const key = keyEl.text();
  const matchers = [
    forKey('Название в оригинале', extractTo('originalName')),
    forKey('Год издания', extractTo('year')),
    forKey('Страниц', extractTo('numberOfPages')),
    forKey('Переплет', extractTo('coverType')),
    forKey('Формат', extractTo('dimensions')),
    forKey('Вес', extractTo('mass')),
    forKey('Возрастные ограничения', extractTo('ageRestriction')),
    forKey('Изготовитель', extractTo('manufacturer')),
    forKey('Серия', extractTo('series')),
    forKey('Назначение', extractTo('intendedFor')),
    forKey('Класс', extractTo('grade')),
    forKey('Импортер', ignore),
    forKey('Доставка', ignore),
    forKey('Все товары', ignore),
    forKey('ISBN', ignore),
    forClass('b-description__more', ignore),
  ];
  for (const matcher of matchers) {
    const result = matcher(keyEl, valEl);
    if (result) {
      return result;
    } else continue;
  }
  return null;
}

@Injectable()
export class OzbyService {
  constructor(private readonly digitalSpaceService: DigitalSpaceService) {}

  readonly rootURL = 'https://oz.by/search/';

  async readData(isbn: string) {
    try {
      const result = await axios.get(this.rootURL, { params: { q: isbn } });
      const $ = cheerio.load(result.data);

      const pic = await axios.get(
        $('.b-product-photo__picture-self img').first().attr('src'),
        { responseType: 'arraybuffer' }
      );
      return { result: result.data, image: pic.data };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  parseData(htmlContent, img): Bundle {
    const $ = cheerio.load(htmlContent);
    const publisherEl = $('[itemprop=publisher]');
    const itemsFlat = $('.b-description__sub table tr')
      .map(function () {
        const row = $(this);
        const cells = row.find('td');
        const results = readCells(cells.first(), cells.last());
        if (results === null) {
          // TODO Logging
          console.error(`Unknown attribute ${cells.first()}. Skipping`);
        }
        return results;
      })
      .get();
    const items = _(itemsFlat).chunk(2).fromPairs().value();
    const year = Number(items.year);
    delete items.year;
    console.log('img: ', img);
    const material: Prisma.MaterialCreateInput = {
      title: $('h1[itemprop=name]').text().trim(),
      yearPublishedAt: year,
      monthPublishedAt: 0,
      description: $('#truncatedBlock').text().trim(),
      cover: img,
      meta: _.merge(items, {
        sku: /\d+/.exec($('.b-product-title__art').text())[0],
        price: $('.b-product__controls .b-product-control__text_main')
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          })
          .text()
          .trim(),
        taxonomy: $('span[itemprop=name]')
          .map(function () {
            return $(this).text();
          })
          .toArray(),
      }),
    };

    const authors: Array<Prisma.AuthorCreateInput> = $('[itemprop=author]')
      .map(function () {
        return {
          name: $(this).find('.b-description__picture-name').text(),
          referenceId: READER_ID + ':' + /\d+/.exec($(this).attr('href'))[0],
          meta: {},
        };
      })
      .toArray();

    const publisher: Prisma.PublisherCreateInput = {
      name: publisherEl.text(),
      referenceId: READER_ID + ':' + /\d+/.exec(publisherEl.attr('href'))[0],
      meta: {},
    };

    return { material, authors, publisher };
  }

  async getData(isbn: string): Promise<Bundle> {
    const result = await this.readData(isbn);
    const $ = cheerio.load(result.result);
    const img = await this.digitalSpaceService.createFile({
      fileExtension: $('.b-product-photo__picture-self img')
        .first()
        .attr('src')
        .split('.')
        .pop(),
      buffer: result.image,
    });

    return this.parseData(result.result, img);
  }
}
