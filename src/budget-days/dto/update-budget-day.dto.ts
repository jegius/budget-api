import { PartialType } from '@nestjs/swagger';
import { CreateBudgetDayDto } from './create-budget-day.dto';

export class UpdateBudgetDayDto extends PartialType(CreateBudgetDayDto) {}