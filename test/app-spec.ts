import { expect } from 'chai';
import { UserRepository } from '../src/repositories/user-repository';
import { Article } from '../src/entity/article';
import { buildConnection } from '../src/connection';
import {
  getCustomRepository,
  getRepository,
  getManager,
  Repository,
  Connection,
  EntityManager
} from 'typeorm';
import { User } from '../src/entity/user';
import { Tag } from '../src/entity/tag';

describe('App', function() {
  const firstName = 'Friedrich';
  const lastName = 'Nietzsche';
  let userRepo: UserRepository,
    articleRepo: Repository<Article>,
    conn: Connection,
    entityManager: EntityManager;
  beforeEach(async function() {
    conn = await buildConnection();
    entityManager = getManager();
    userRepo = getCustomRepository(UserRepository);
    articleRepo = getRepository(Article);

    await entityManager.delete(Article, {});
    await entityManager.delete(Tag, {});
    await entityManager.delete(User, {});
  });
  afterEach(async function() {
    await conn.close();
  });
  describe('UserRepository', function() {
    describe('#findByName', function() {
      beforeEach(async function() {
        const user = userRepo.create({ firstName, lastName });
        await userRepo.save(user);
      });

      it('returns a user by firstName and lastName', async function() {
        const user = await userRepo.findByName(firstName, lastName);
        expect(user).to.exist;
      });
    });
    describe('#findByTag', function() {
      let result : User[];
      let user: User;
      beforeEach(async function() {
        user = userRepo.create({ firstName, lastName });
        await userRepo.save(user);

        const tag = entityManager.create(Tag, { name: 'philosophy' });
        await entityManager.save(tag);

        const article = entityManager.create(Article, {
          text: 'Thus Spoke Zarathustra.',
          user,
          tags: [tag]
        });
        await articleRepo.save(article);

        const otherTag = entityManager.create(Tag, { name: 'Lebensphilosophie' });
        await entityManager.save(otherTag);

        const otherArticle = entityManager.create(Article, {
          text: 'Thus Spoke Zarathustra 2. A New Hope',
          user,
          tags: [otherTag]
        });
        await articleRepo.save(otherArticle);

        const otherUser = userRepo.create({ firstName, lastName });
        await userRepo.save(otherUser);

        result = await userRepo.findByTag(tag);
      });
      it('returns correct user', function() {
        expect(result.map(u => u.id)).to.deep.eq([user.id])
      });
    });
  });
  describe('eager association', function() {
    let result: User;
    beforeEach(async function() {
      const user = userRepo.create({ firstName, lastName });
      await userRepo.save(user);

      const artilce = articleRepo.create({
        text: 'Thus Spoke Zarathustra',
        user
      });
      await articleRepo.save(artilce);

      result = await userRepo.findOne(user.id);
    });

    it('has preloaded articles', function() {
      expect(result.articles).to.have.length(1);
    });

    it('each preloaded article has no author. BUG?', function() {
      const firstArticle: Article = result.articles[0];
      expect(firstArticle.user).to.eq(undefined);
    });
  });
  describe('many to one association', function() {
    it('updates many to one association by id', async function() {
      const user = entityManager.create(User, { firstName, lastName });
      await entityManager.save(user);
      const article = entityManager.create(Article, {
        text: 'Thus Spoke Zarathustra',
        user,
      });
      await entityManager.save(article);

      // To make it work you need add userId column into Article
      const otherUser = entityManager.create(User, { firstName, lastName });
      await entityManager.save(otherUser);
      await entityManager.update(Article, article, { userId: otherUser.id });

      const result = await entityManager.findOne(Article, article.id, { relations: ['user'] });
      expect(result.user.id).to.eq(otherUser.id);
    });
  });
  describe('many to many associations', function() {
    let result: User, article: Article;
    beforeEach(async function() {
      const user: User = entityManager.create(User, { firstName, lastName });
      await entityManager.save(user);

      const tag = entityManager.create(Tag, { name: 'philosophy' });
      await entityManager.save(tag);

      article = entityManager.create(Article, {
        text: 'Thus Spoke Zarathustra',
        user,
        tags: [tag]
      });
      await articleRepo.save(article);

      result = await userRepo.findOne(user.id);
    });

    it('returns the user with preloaded articles with preloaded tags', function() {
      expect(result.articles[0].tags[0].name).to.eq('philosophy');
    });

    describe('update many-to-many association', function() {
      it('works correctly', async function() {
        const tag = entityManager.create(Tag, { name: 'Lebensphilosophie' });
        await entityManager.save(tag);

        // I have not found a way to update the association by a list of ids
        // like:
        // article.tags_ids = [1, 2]
        // entityManager.save(article);
        article.tags = [tag];

        await entityManager.save(article);

        const result = await entityManager.findOne(Article, article.id);

        expect(result.tags.map(t => t.name)).to.deep.eq(['Lebensphilosophie']);
      });
    });
  });
  describe('check boolean fields with MySQL', function() {
    it('is boolean!!!', async function() {
      const user: User = entityManager.create(User, { firstName, lastName });
      await entityManager.save(user);

      const article = entityManager.create(Article, {
        text: 'Thus Spoke Zarathustra',
        published: true,
        user,
      });
      await entityManager.save(article);
      const result = await entityManager.findOne(Article, article.id);
      expect(result.published).to.eq(true);
    });
  });
});
