import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  RelationId
} from 'typeorm';
import { User } from './user';
import { Tag } from './tag';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  userId: number;

  @Column()
  published: boolean = false;

  @ManyToOne(
    type => User,
    user => user.articles,
    {
      onDelete: 'CASCADE'
    }
  )
  user: User;

  @ManyToMany(type => Tag, { eager: true })
  @JoinTable()
  tags?: Tag[];
}
