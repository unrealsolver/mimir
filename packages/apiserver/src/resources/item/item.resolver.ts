import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';
import { ClaimBookInput, Error } from '@mimir/global-types';
import { ItemService } from './item.service';
import { Status } from '../statuses/status.entity';

@Resolver('ClaimBookUnionResult')
export class ItemResolver {
  constructor(private itemService: ItemService) {}

  @ResolveField()
  __resolveType(value) {
    if (value.status) {
      return 'Status';
    }
    if (value.message) {
      return 'Error';
    }
    return null;
  }

  @Mutation(() => Status)
  async claimBook(@Args('input') claimBookInput: ClaimBookInput) {
    return this.itemService.claim(claimBookInput);
    return this.itemService.claim(claimBookInput);
  }

  @Query(() => [StatusType])
  async getAllTakenItems(@Args('person_id') person_id: number) {
    return this.itemService.getAllTakenItems(person_id);
  }
}
