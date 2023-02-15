import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Message } from './message.entity';
import { CreateMessageInput } from '@mimir/global-types';
import { Person } from '../persons/person.entity';
import { GraphQLError } from 'graphql';
import { In } from 'typeorm';
import { UseGuards } from '@nestjs/common';
import { ManagerGuard } from '../../auth/manager.guard';
import { CurrentUser } from '../../auth/current-user';
import { checkIsResourceOwnerOrManager } from '../../auth/auth-util';

@Resolver('Message')
export class MessageResolver {
  @Query(() => [Message])
  async getMessagesByPerson(
    @Args('person_id') id: string,
    @CurrentUser() currentUser: Person
  ) {
    checkIsResourceOwnerOrManager(currentUser, +id);
    return Message.find({ where: { person_id: id } });
  }

  @Query(() => [Message])
  @UseGuards(ManagerGuard)
  async getAllMessages(@Args('location_id') location_id: Array<number>) {
    return Message.find({ where: { location_id: In(location_id) } });
  }

  @ResolveField(() => Person)
  async person(@Parent() message: Message) {
    const { person_id } = message;
    return Person.findOne({ where: { id: person_id } });
  }

  @Mutation(() => Message)
  async createMessageForManager(
    @Args('input') createMessageInput: CreateMessageInput
  ) {
    try {
      const message = Message.create(createMessageInput);
      return Message.save(message);
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }
}
