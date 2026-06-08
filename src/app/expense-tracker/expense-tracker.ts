import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';

import { Expense } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BaseChartDirective
  ],
  templateUrl: './expense-tracker.html',
  styleUrl: './expense-tracker.css'
})
export class ExpenseTracker implements OnInit {

  expenses: Expense[] = [];

  total = 0;

  editingIndex: number | null = null;

  searchText = '';

  selectedCategory = 'All';

  sortOption = 'none';

  categories = [
    'All',
    'Food',
    'Travel',
    'Shopping',
    'Bills'
  ];

  pieChartLabels: string[] = [];

  pieChartData: number[] = [];

  expenseForm = new FormGroup({

    category: new FormControl(
      '',
      Validators.required
    ),

    amount: new FormControl<number | null>(
      null,
      Validators.required
    ),

    date: new FormControl(
      '',
      Validators.required
    )

  });

  constructor(
    private expenseService: ExpenseService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {

    this.expenses =
      this.expenseService.getExpenses();

    this.calculateTotal();

    this.updatePieChart();

  }

  calculateTotal() {

    this.total = 0;

    for (let expense of this.expenses) {

      this.total += expense.amount;

    }

  }

  getFilteredExpenses() {

    let filteredExpenses = this.expenses.filter(expense => {

      const matchesSearch =
        expense.category
          .toLowerCase()
          .includes(
            this.searchText.toLowerCase()
          );

      const matchesCategory =
        this.selectedCategory === 'All' ||

        expense.category.toLowerCase() ===
        this.selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;

    });

    if (this.sortOption === 'amount-high') {

      filteredExpenses.sort(
        (a, b) => b.amount - a.amount
      );

    }

    else if (this.sortOption === 'amount-low') {

      filteredExpenses.sort(
        (a, b) => a.amount - b.amount
      );

    }

    else if (this.sortOption === 'newest') {

      filteredExpenses.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

    }

    else if (this.sortOption === 'oldest') {

      filteredExpenses.sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );

    }

    return filteredExpenses;

  }

  addExpense() {

    if (this.expenseForm.invalid) {

      this.expenseForm.markAllAsTouched();

      return;

    }

    const newExpense: Expense = {

      category:
        this.expenseForm.value.category || '',

      amount:
        Number(this.expenseForm.value.amount),

      date:
        this.expenseForm.value.date || ''

    };

    if (this.editingIndex !== null) {

      this.expenses[this.editingIndex] =
        newExpense;

      this.editingIndex = null;

    } else {

      this.expenses.push(newExpense);

    }

    this.expenseService.saveExpenses();

    this.calculateTotal();

    this.expenseForm.reset();

    this.updatePieChart();

  }

  deleteExpense(index: number) {

    this.expenses.splice(index, 1);

    this.expenseService.saveExpenses();

    this.calculateTotal();

    this.updatePieChart();

  }

  editExpense(index: number) {

    const expense = this.expenses[index];

    this.expenseForm.patchValue({

      category: expense.category,

      amount: expense.amount,

      date: expense.date

    });

    this.editingIndex = index;

  }

  getCurrentMonthTotal() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this.expenses
      .filter((expense: Expense) => {
        const expenseDate = new Date(expense.date);

        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce(
        (total: number, expense: Expense) =>
          total + expense.amount,
        0
      );
  }
  updatePieChart() {

    const categoryTotals: any = {};

    for (let expense of this.expenses) {

      if (categoryTotals[expense.category]) {

        categoryTotals[expense.category] += expense.amount;

      } else {

        categoryTotals[expense.category] = expense.amount;

      }

    }

    this.pieChartLabels =
      Object.keys(categoryTotals);

    this.pieChartData =
      Object.values(categoryTotals);
  }

  exportToExcel() {

    const worksheet = XLSX.utils.json_to_sheet(
      this.expenses
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Expenses'
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: 'xlsx',
        type: 'array'
      }
    );

    const file = new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      }
    );

    saveAs(file, 'expenses.xlsx');
  }
}