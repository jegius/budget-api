import { Expense } from '../entities/expense.entity';
import { ExpenseViewModel } from './dto/expense-response.dto';

/**
 * Преобразует сущность Expense в ExpenseViewModel для передачи на фронтенд.
 * @param expense Сущность расхода из базы данных.
 * @returns Объект ExpenseViewModel.
 */
export function toExpenseViewModel(expense: Expense): ExpenseViewModel {
    return {
        id: expense.id,
        budgetDayId: expense.budgetDay?.id,
        category: expense.category ? {
            id: expense.category.id,
            name: expense.category.name,
            color: expense.category.color
        } : null,
        amount: expense.amount,
        description: expense.description,
        createdAt: expense.created_at
    };
}