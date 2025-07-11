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
    <div class="table-card">
      <div class="section-title mb-3">
        <i class="fas fa-money-check-alt"></i> Payroll Review
      </div>
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
          <div class="table-responsive d-none d-sm-block">
            <table
              class="table table-striped table-responsive payroll-table payroll-table-narrow mb-0 align-middle"
            >
              <thead class="table-light">
                <tr>
                  <th class="nowrap">Employee ID</th>
                  <th class="nowrap">Month</th>
                  <th class="text-end nowrap">Gross Salary</th>
                  <th class="text-end nowrap">Net Salary</th>
                  <th class="text-center nowrap" style="width: 110px;">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let payroll of filteredPayrolls">
                  <td class="fw-semibold nowrap">{{ payroll.employeeId }}</td>
                  <td class="nowrap">
                    <span class="badge bg-primary">{{ payroll.month }}</span>
                  </td>
                  <td class="text-end nowrap">
                    {{ payroll.grossSalary | currency }}
                  </td>
                  <td class="text-end nowrap">
                    {{ payroll.netSalary | currency }}
                  </td>
                  <td class="text-center nowrap" style="width: 110px;">
                    <div
                      class="d-flex justify-content-center align-items-center w-100"
                    >
                      <button
                        class="btn btn-outline-primary btn-sm payroll-action-btn w-100"
                        (click)="viewPayslip(payroll.id)"
                        [attr.aria-label]="
                          'View payslip for employee ' + payroll.employeeId
                        "
                        style="white-space: nowrap; min-width: 0;"
                      >
                        <i class="fas fa-file-invoice me-1"></i> Payslip
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Mobile Timeline Layout -->
          <div class="timeline-mobile d-block d-sm-none">
            <div
              *ngFor="let payroll of filteredPayrolls; let i = index"
              class="timeline-step position-relative mb-4"
            >
              <div
                class="timeline-dot position-absolute top-0 start-0 translate-middle"
              ></div>
              <div
                class="timeline-line position-absolute start-0"
                *ngIf="i < filteredPayrolls.length - 1"
              ></div>
              <div class="ms-4 ps-2 pb-2">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="fw-bold text-primary" style="font-size:1.1em;"
                    >Employee #{{ payroll.employeeId }}</span
                  >
                  <span
                    class="badge bg-primary"
                    style="font-size:0.98em; padding:0.4em 1em;"
                    >{{ payroll.month }}</span
                  >
                </div>
                <div class="small text-muted mb-1">
                  <i class="fas fa-money-bill-wave me-1"></i>
                  Gross:
                  <span class="fw-semibold">{{
                    payroll.grossSalary | currency
                  }}</span>
                </div>
                <div class="small text-muted mb-1">
                  <i class="fas fa-wallet me-1"></i>
                  Net:
                  <span class="fw-semibold">{{
                    payroll.netSalary | currency
                  }}</span>
                </div>
                <div class="d-flex flex-column gap-2 mt-2">
                  <div
                    class="d-flex flex-wrap justify-content-center align-items-center gap-2 payroll-action-group"
                  >
                    <button
                      class="btn btn-outline-primary btn-sm payroll-action-btn"
                      (click)="viewPayslip(payroll.id)"
                      [attr.aria-label]="
                        'View payslip for employee ' + payroll.employeeId
                      "
                    >
                      <i class="fas fa-file-invoice me-1"></i> Payslip
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
