import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Status } from './status.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CreateStatusInput } from '@mimir/global-types';
import { AuthGuard } from '../../auth/auth.guard';
import { Notification } from '../notifications/notification.entity';
import { Person } from '../persons/person.entity';
import { StatusService } from './status.service';
import { Material } from '../materials/material.entity';

@Resolver('Status')
export class StatusResolver {
  constructor(private readonly statusService: StatusService) {}
  @Query(() => [Status])
  @UseGuards(AuthGuard)
  async getStatusesByPerson(@Args('person_id') id: string) {
    return Status.find({ where: { person_id: id } });
  }

  @Query(() => [Status])
  @UseGuards(AuthGuard)
  async getStatusesByMaterial(@Args('material_id') id: string) {
    const statuses = await Status.find({ where: { material_id: id } });
    if (statuses.length === 0) {
      await this.createStatus({
        material_id: parseInt(id),
        person_id: 1,
        status: 'Free',
      });
      const newStatuses = await Status.find({ where: { material_id: id } });
      return newStatuses;
    } else {
      return statuses;
    }
  }

  @ResolveField(() => Person)
  async person(@Parent() status: Status) {
    const { person_id } = status;
    return Person.findOne(person_id);
  }

  @Query(() => [Status])
  async getAllStatusesIsOverdue(@Args('locations') locations: Array<number>) {
    return this.statusService.allOverdueStatuses(locations);
  }

  @Mutation(() => Status)
  @UseGuards(AuthGuard)
  async createStatus(@Args('input') createStatusInput: CreateStatusInput) {
    try {
      const status = await Status.create(createStatusInput);
      await Status.save(status);
      return status;
    } catch (e) {
      throw new BadRequestException();
    }
  }
  @ResolveField(() => Material)
  async material(@Parent() statuses: Status) {
    const { material_id } = statuses;
    return Material.findOne({ where: { id: material_id } });
  }
}
