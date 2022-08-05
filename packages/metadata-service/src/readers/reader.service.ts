import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';
import { OzbyService } from './ozby.service';
import { LabirintService } from './labirint.service';
import { ChitaiGorodService } from './chitai-gorod.service';

@Injectable()
export class ReaderService {
  constructor(
    private db: DbService,
    private ozbyReader: OzbyService,
    private labirintService: LabirintService,
    private chitaiGorodService: ChitaiGorodService
  ) {}

  async lookup(isbn: string) {
    const existing = await this.findExistingMaterial(isbn);
    if (existing) return existing;

    const startedAt = new Date();
    const result = await this.getDataFromServices(isbn);
    if (result) {
      await this.db.syncMaterial(isbn, result, startedAt);
    } else {
      if (!existing) {
        this.db.saveMissingISBN(isbn, startedAt);
      }
    }
    return result;
  }

  private async getDataFromServices(isbn: string) {
    try {
      const result = await Promise.any([
        this.chitaiGorodService.getData(isbn),
        this.ozbyReader.getData(isbn),
        this.labirintService.getData(isbn),
      ]);
      return result;
    } catch (e) {
      console.error(`Identifier "${isbn}" not found!`);
    }
  }

  private async findExistingMaterial(isbn: string) {
    const existing = await this.db.findMaterial(isbn);
    if (existing) {
      this.db.logAccess(existing.id);

      if (!existing.material) {
        console.log('The identifier was previously requested, but not found!');
        return;
      } else {
        console.log('Matched!');
        return existing;
      }
    }
  }
}
