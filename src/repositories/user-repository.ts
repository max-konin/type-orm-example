import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user';
import { Tag } from '../entity/tag';
import { Article } from '../entity/article';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByName(firstName: string, lastName: string) {
    return this.findOne({ firstName, lastName });
  }
  findByTag(tag : Tag) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.articles', 'article')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('tag.id = :tagId', { tagId: tag.id })
      .getMany();
  }
}
