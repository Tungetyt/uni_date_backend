/* eslint-disable no-unused-vars */

import { IUser } from '@interfaces/IUser';
import { IUniversity } from '@interfaces/IUniversity';
import { getConnection, getRepository } from 'typeorm';
import { University } from '@entities/University';
import { User } from '@entities/User';
import { UserDto } from '@dto/UserDto';
import { City } from '@entities/City';

export interface IUserDao {
  getOne: (email: string) => Promise<IUser | null>;
  getAll: () => Promise<IUser[]>;
  add: (user: IUser) => Promise<IUser>;
  // update: (newUserPart: IUser, id: string, newCity: City, newUniversity: University) => Promise<void>;
  delete: (id: number) => Promise<void>;
  findOneByEmail: (email: string) => Promise<IUser | undefined>;
  findOneById: (id: string) => Promise<IUser | undefined>;
  getUserViewDataByUserId: (id: string) => Promise<any>
  login: (email: string) => Promise<any>
  register: (email: string) => Promise<any>
}

class UserDao implements IUserDao {
  user = [
    'user.userName',
    'user.gender',
    'user.description',
    'user.email',
    'user.maxSearchDistanceFilter',
    'user.ageFromFilter',
    'user.ageToFilter',
    'user.isGraduated',
    'user.fieldOfStudy',
    'picture.fileName',
    'picture.isAvatar',
  ]

  /**
   * @param email
   */
  public findOneByEmail(email: string): Promise<IUser | undefined> {
    return getConnection()
      .createEntityManager()
      .findOne(User, { where: { email } });
  }

  /**
   * @param id
   */
  public findOneById(id: string): Promise<IUser | undefined> {
    return getConnection()
      .createEntityManager()
      .findOne(User, { where: { id } });
  }

  /**
   * @param id
   */
  public getUserViewDataByUserId(id: string): Promise<any> {
    return getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.pictures', 'picture')
      .where({ id })
      .select(this.user)
      .getOne();
  }

  /**
   * @param email
   */
  public login(email: string): Promise<any> {
    return getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.pictures', 'picture')

      .where({ email })
      .select([
        ...this.user,
        'user.id',
        'user.passwordHash',
      ])
      .getOne();
  }

  /**
   * @param email
   */
  public register(email: string): Promise<any> {
    return getRepository(User)
      .createQueryBuilder('user')
      .where({ email })
      .select([
        'user.id',
      ])
      .getOne();
  }

  /**
   * @param email
   */
  public getOne(email: string): Promise<IUser | null> {
    // TODO
    return Promise.resolve(null);
  }

  /**
   *
   */
  public getAll(): Promise<IUser[]> {
    // TODO
    return Promise.resolve([]);
  }

  /**
   *
   * @param user
   */
  public async add(user: IUser): Promise<IUser> {
    return getConnection()
      .createEntityManager()
      .save(user);
  }

  /**
   *
   * @param newUserPart
   */
  public async update(newUserPart: IUser, newCity : City | null = null, newUniversity: University | null = null): Promise<void> {
    await getConnection().transaction(async (entityManager) => {
      if (newCity) {
        // const foundCityId = await entityManager
        //   .createQueryBuilder()
        //   .select([
        //     'city.cityName',
        //   ])
        //   .from(City, 'city')
        //   .where('name = :name', { name: newCity.cityName })
        //   .getOne();
        await entityManager.save(City, newCity);
      }
      if (newUniversity) {
        await entityManager.save(University, newUniversity);
      }
      await entityManager.save(newUserPart);
      // await entityManager
      //   .createQueryBuilder()
      //   .update(User)
      //   .set(
      //     newUserPart,
      //   )
      //   .where('id = :id', { id: newUserPart })
      //   .execute();
    });
  }

  /**
   *
   * @param id
   */
  public async delete(id: number): Promise<void> {
    // TODO
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id })
      .execute();
  }
}

export default UserDao;
