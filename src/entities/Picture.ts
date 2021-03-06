import {
  Column, Entity, Index, JoinColumn, ManyToOne,
} from 'typeorm';
import { User } from './User';

@Index('picture_pk', ['fileName'], { unique: true })
@Entity('picture', { schema: 'public' })
export class Picture {
  @Column('character varying', {
    primary: true,
    name: 'file_name',
    length: 255,
  })
  fileName: string;

  @Column('bytea', { name: 'blob' })
  blob: Buffer;

  @Column('boolean', { name: 'is_avatar' })
  isAvatar: boolean;

  @ManyToOne(() => User, (user) => user.pictures, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
