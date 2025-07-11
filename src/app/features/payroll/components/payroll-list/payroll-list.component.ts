import { Component, OnInit } from '@angular/core';
import { PayrollService } from '../../services/payroll.service';
import { IPayroll } from '../../../../shared/models/payroll.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Payroll Review</h5>
      </div>
      <div class="card-body">
        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="progress" style="height: 1.2rem;">
            <div
              class="progress-bar bg-primary"
              role="progressbar"
              [style.width]="progress + '%'"
            >
              Step {{ step }} / 3
            </div>
          </div>
        </div>
        <!-- Step 1: Select Month -->
        <div *ngIf="step === 1">
          <label class="form-label">Select Month</label>
          <select
            class="form-select mb-4"
            [(ngModel)]="selectedMonth"
            name="month"
          >
            <option value="">-- Select Month --</option>
            <option *ngFor="let m of months" [value]="m">{{ m }}</option>
          </select>
        </div>
        <!-- Step 2: Payroll Summary -->
        <div *ngIf="step === 2">
          <ng-container *ngIf="filteredPayrolls.length > 0; else noPayroll">
            <div class="table-responsive">
              <table class="table table-striped mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Employee ID</th>
                    <th>Month</th>
                    <th>Gross Salary</th>
                    <th>Net Salary</th>
                    <th style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let payroll of filteredPayrolls">
                    <td>{{ payroll.employeeId }}</td>
                    <td>{{ payroll.month }}</td>
                    <td>{{ payroll.grossSalary | currency }}</td>
                    <td>{{ payroll.netSalary | currency }}</td>
                    <td>
                      <button
                        class="btn btn-sm btn-info"
                        (click)="viewPayslip(payroll.id)"
                      >
                        <i class="fas fa-file-invoice"></i> View Payslip
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ng-container>
          <ng-template #noPayroll>
            <div class="alert alert-info">No payroll data for this month.</div>
          </ng-template>
        </div>
        <!-- Step 3: Payslip -->
        <div *ngIf="step === 3 && payslip">
          <h6>
            Payslip for Employee #{{ payslip.employeeId }} ({{ payslip.month }})
          </h6>
          <ul class="list-group mb-3">
            <li class="list-group-item">
              <b>Gross Salary:</b> {{ payslip.grossSalary | currency }}
            </li>
            <li class="list-group-item">
              <b>Net Salary:</b> {{ payslip.netSalary | currency }}
            </li>
            <li class="list-group-item">
              <b>Deductions:</b>
              <ul>
                <li *ngFor="let d of payslip.deductions">
                  {{ d.label }}: {{ d.amount | currency }}
                </li>
              </ul>
            </li>
            <li class="list-group-item">
              <b>Allowances:</b>
              <ul>
                <li *ngFor="let a of payslip.allowances">
                  {{ a.label }}: {{ a.amount | currency }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <!-- Navigation Buttons -->
        <div class="d-flex justify-content-between mt-4">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="prevStep()"
            [disabled]="step === 1"
          >
            Back
          </button>
          <button
            *ngIf="step < 3"
            type="button"
            class="btn btn-primary"
            (click)="nextStep()"
            [disabled]="!canProceed()"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PayrollListComponent implements OnInit {
  payrolls: IPayroll[] = [];
  months: string[] = [];
  selectedMonth: string = '';
  filteredPayrolls: IPayroll[] = [];
  payslip: any = null;
  step = 1;
  get progress() {
    return ((this.step - 1) * 100) / 2;
  }

  constructor(private payrollService: PayrollService) {}

  ngOnInit() {
    this.payrollService.getPayrolls().subscribe((payrolls) => {
      this.payrolls = payrolls;
      this.months = Array.from(new Set(payrolls.map((p) => p.month)));
    });
  }

  nextStep() {
    if (this.step === 1 && !this.selectedMonth) return;
    if (this.step === 2 && this.filteredPayrolls.length === 0) return;
    this.step++;
    if (this.step === 2) {
      this.filteredPayrolls = this.payrolls.filter(
        (p) => p.month === this.selectedMonth
      );
    }
  }
  prevStep() {
    if (this.step > 1) this.step--;
    if (this.step === 2) this.payslip = null;
  }
  canProceed() {
    if (this.step === 1) return !!this.selectedMonth;
    if (this.step === 2) return this.filteredPayrolls.length > 0;
    return true;
  }
  viewPayslip(payrollId: number) {
    this.payrollService.getPayslipByPayrollId(payrollId).subscribe((p) => {
      this.payslip = p;
      this.step = 3;
    });
  }
}
