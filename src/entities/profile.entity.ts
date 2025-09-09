import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn() user_id: number; // PK=FK

    @OneToOne(() => User, (u) => u.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true }) full_name?: string;
    @Column({ nullable: true }) avatar_url?: string;
    @Column({ type: 'text', nullable: true }) bio?: string;
}
