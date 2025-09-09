import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';
import { BudgetsModule } from '../budgets/budgets.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Profile, User]),
        BudgetsModule,
    ],
    controllers: [ProfilesController],
    providers: [ProfilesService],
    exports: [ProfilesService],
})
export class ProfilesModule {}