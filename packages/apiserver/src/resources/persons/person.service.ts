import { BadRequestException, Injectable } from '@nestjs/common';
import { Person } from './person.entity';

@Injectable()
export class PersonService {
  async getAllPersons(username: string, locations: Array<number>) {
    try {
      return await Person.createQueryBuilder('person')
        .leftJoinAndSelect('person.location', 'location')
        // .where(
        //   `person.location_id= :location ${
        //     username ? 'AND person.username ILIKE :name' : ''
        //   }`,
        //   {
        //     location: location.id,
        //     name: `%${username}%`,
        //   }
        // )
        .where('person.username ILIKE :name', { name: `%${username}%` })
        .andWhere('location.id IN (:...locations)', { locations })
        .orderBy('person.username', 'ASC')
        .getMany();
    } catch (e) {
      return new BadRequestException(e.message);
    }
  }
}
