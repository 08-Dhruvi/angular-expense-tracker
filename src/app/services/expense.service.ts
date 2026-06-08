import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {

    expenses: Expense[] = [];

    constructor() {

        const data =
            localStorage.getItem('expenses');

        if (data) {

            this.expenses =
                JSON.parse(data);

        }

    }

    getExpenses() {

        return this.expenses;

    }

    saveExpenses() {

        localStorage.setItem(
            'expenses',
            JSON.stringify(this.expenses)
        );

    }

}