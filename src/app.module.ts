import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatisticsModule } from 'src/statistics/statistics.module';

// Entities
import { User } from './entities/user.entity';
import { Currency } from './entities/currency.entity';
import { Profile } from './entities/profile.entity';
import { Category } from './entities/category.entity';
import { Budget } from './entities/budget.entity';
import { BudgetDay } from './entities/budget-day.entity';
import { Expense } from './entities/expense.entity';
import { PublicBudget } from './entities/public-budget.entity';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetsModule } from './budgets/budgets.module';
import { BudgetDaysModule } from './budget-days/budget-days.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PublicBudgetsModule } from './public-budgets/public-budgets.module';

@Module({
  imports: [
    // глобальная конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
    }),

    // асинхронная конфигурация TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get<string>('POSTGRES_USER', 'budget'),
        password: config.get<string>('POSTGRES_PASSWORD', 'budgetpass'),
        database: config.get<string>('POSTGRES_DB', 'budgetdb'),
        entities: [
          User,
          Currency,
          Profile,
          Category,
          Budget,
          BudgetDay,
          Expense,
          PublicBudget,
        ],
        synchronize: config.get<boolean>('TYPEORM_SYNC', true),
      }),
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    CurrenciesModule,
    CategoriesModule,
    BudgetsModule,
    BudgetDaysModule,
    ExpensesModule,
    PublicBudgetsModule,
    ProfilesModule,
    StatisticsModule,
  ],
})
export class AppModule {}
