import { Component, OnInit } from '@angular/core';
import { PayrollService } from '../../services/payroll.service';
import { IPayroll } from '../../../../shared/models/payroll.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { CsvUtilService } from '../../../../shared/services/csv-util.service';
import { AuthService, UserRole } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="table-card">
      <div
        class="d-flex justify-content-between align-items-center mb-3 flex-wrap"
      >
        <div class="section-title mb-0">
          <i class="fas fa-money-check-alt"></i> Payroll Review
        </div>
        <div class="d-flex gap-2">
          <button
            class="btn btn-info"
            (click)="exportPayrolls()"
            *ngIf="role === 'Admin' || role === 'HR'"
          >
            <i class="fas fa-file-export"></i> Export CSV
          </button>
          <label
            class="btn btn-info mb-0"
            *ngIf="role === 'Admin' || role === 'HR'"
          >
            <i class="fas fa-file-import"></i> Import CSV
            <input
              type="file"
              accept=".csv"
              (change)="importPayrolls($event)"
              hidden
            />
          </label>
        </div>
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
            <table class="table table-striped payroll-table mb-0">
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
                  <td>{{ payroll.employeeId }}</td>
                  <td>{{ payroll.month }}</td>
                  <td class="text-end">{{ payroll.grossSalary | currency }}</td>
                  <td class="text-end">{{ payroll.netSalary | currency }}</td>
                  <td class="text-center nowrap">
                    <div
                      class="d-flex justify-content-center align-items-center w-100 gap-2"
                    >
                      <button
                        class="btn btn-info btn-sm payroll-action-btn"
                        (click)="viewDetails(payroll.id)"
                        [attr.aria-label]="
                          'View details for employee ' + payroll.employeeId
                        "
                      >
                        <i class="fas fa-info-circle me-1"></i> Details
                      </button>
                      <button
                        class="btn btn-outline-primary btn-sm payroll-action-btn w-100"
                        (click)="viewPayslip(payroll.id)"
                        [attr.aria-label]="
                          'View payslip for employee ' + payroll.employeeId
                        "
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
                      class="btn btn-info btn-sm payroll-action-btn"
                      (click)="viewDetails(payroll.id)"
                      [attr.aria-label]="
                        'View details for employee ' + payroll.employeeId
                      "
                    >
                      <i class="fas fa-info-circle me-1"></i> Details
                    </button>
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
    <div
      *ngIf="showDetailsModal && detailsPayroll"
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.3);"
    >
      <div class="modal-dialog">
        <div class="modal-content payroll-details-modal">
          <div class="modal-header">
            <h5 class="modal-title">
              Payroll Details - Employee #{{ detailsPayroll.employeeId }}
            </h5>
            <button
              type="button"
              class="btn-close"
              (click)="closeDetailsModal()"
            ></button>
          </div>
          <div class="modal-body">
            <ul class="list-group mb-3">
              <li class="list-group-item">
                <b>Month:</b> {{ detailsPayroll.month }}
              </li>
              <li class="list-group-item">
                <b>Gross Salary:</b> {{ detailsPayroll.grossSalary | currency }}
              </li>
              <li class="list-group-item">
                <b>Net Salary:</b> {{ detailsPayroll.netSalary | currency }}
              </li>
              <li class="list-group-item">
                <b>Deductions:</b>
                <ul>
                  <li *ngFor="let d of detailsPayroll.deductions">
                    {{ d.label }}: {{ d.amount | currency }}
                  </li>
                </ul>
              </li>
              <li class="list-group-item">
                <b>Allowances:</b>
                <ul>
                  <li *ngFor="let a of detailsPayroll.allowances">
                    {{ a.label }}: {{ a.amount | currency }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeDetailsModal()"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showDetailsModal"></div>
  `,
  styles: [
    `
      .table-card {
        background: var(--surface-primary);
        border-radius: 1.3em;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        padding: 2.2em 1.5em 1.5em 1.5em;
        margin: 2.5em auto 0 auto;
        max-width: 1100px;
        color: var(--text-primary);
      }
      .table th {
        background: var(--primary-light);
        color: var(--primary-dark);
        font-weight: 800;
        font-size: 1.12em;
        border-bottom: 2px solid var(--primary);
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .table td {
        background: var(--surface-secondary);
        color: var(--text-primary);
        font-size: 1.05em;
      }
      .table-hover tbody tr:hover {
        background: var(--surface-tertiary);
      }
      .payroll-action-btn {
        background: var(--primary);
        color: #fff;
        border: none;
        border-radius: 0.8em;
        font-weight: 600;
        font-size: 1em;
        padding: 0.5em 1.2em;
        transition: background 0.2s, color 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .payroll-action-btn i {
        margin-right: 0.5em;
      }
      .payroll-action-btn:hover {
        background: var(--primary-dark);
        color: #fff;
      }
      .section-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--primary);
        margin-bottom: 0.5em;
      }
      .timeline-mobile {
        margin-top: 2em;
      }
      .timeline-step {
        background: var(--surface-primary);
        border-radius: 1.1em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
        padding: 1.1em 1em 0.7em 1em;
        margin-bottom: 1.2em;
        border: 1px solid var(--border-light);
        display: flex;
        flex-direction: column;
        gap: 0.7em;
      }
      .timeline-dot {
        width: 18px;
        height: 18px;
        background: var(--primary-light);
        border-radius: 50%;
        border: 2.5px solid var(--primary);
        left: -9px;
        top: 0.5em;
        z-index: 2;
      }
      .timeline-line {
        width: 3px;
        background: var(--primary-light);
        left: -2px;
        top: 1.5em;
        bottom: 0;
        position: absolute;
        z-index: 1;
      }
      .payroll-action-btn {
        width: 100%;
        margin-top: 0.5em;
        font-size: 1.08em;
        padding: 0.7em 0;
        border-radius: 0.8em;
      }
      .badge {
        border-radius: 1em;
        font-size: 1em;
        font-weight: 700;
        padding: 0.45em 1.2em;
        box-shadow: 0 1px 4px rgba(124, 58, 237, 0.04);
      }
      .btn-info {
        background: var(--info, #3b82f6);
        color: #fff;
        border: none;
        transition: background 0.2s, color 0.2s;
        height: 44px;
        min-width: 140px;
        padding: 0 1.25em;
        font-size: 1.08em;
        border-radius: 0.8em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        box-sizing: border-box;
      }
      .btn-info:hover {
        background: #2563eb;
        color: #fff;
      }
      .btn-info i {
        margin-right: 0.5em;
      }
      label.btn-info {
        cursor: pointer;
      }
      .payroll-details-modal {
        background: var(--surface-primary);
        color: var(--text-primary);
        border-radius: 1.2em;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.12);
      }
      .payroll-details-modal .modal-header {
        border-bottom: 1.5px solid var(--border-light);
      }
      .payroll-details-modal .modal-footer {
        border-top: 1.5px solid var(--border-light);
      }
      @media (max-width: 900px) {
        .table-card {
          padding: 1.2em 0.5em 1em 0.5em;
        }
      }
      @media (max-width: 600px) {
        .table-card {
          padding: 0.5em 0.1em 0.5em 0.1em;
        }
        .section-title {
          font-size: 1.15rem;
        }
        .timeline-step {
          padding: 0.8em 0.5em 0.6em 0.5em;
        }
        .payroll-action-btn {
          font-size: 1em;
          padding: 0.6em 0;
        }
      }
    `,
  ],
})
export class PayrollListComponent implements OnInit {
  payrolls: IPayroll[] = [];
  months: string[] = [];
  selectedMonth: string = '';
  filteredPayrolls: IPayroll[] = [];
  payslip: any = null;
  step = 1;
  role: UserRole | null = null;
  showDetailsModal = false;
  detailsPayroll: any = null;

  get progress() {
    return ((this.step - 1) * 100) / 2;
  }

  constructor(
    private payrollService: PayrollService,
    private csvUtil: CsvUtilService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.auth.getRole().subscribe((role) => {
      this.role = role;
    });
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

  exportPayrolls() {
    const csv = this.csvUtil.arrayToCsv(this.payrolls);
    this.csvUtil.downloadCsv(csv, 'payrolls.csv');
  }

  importPayrolls(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.csvUtil.readCsvFile(file).then((csv) => {
      const payrolls = this.csvUtil.csvToArray(csv);
      this.payrollService.setPayrolls(payrolls); // You may need to implement setPayrolls in PayrollService
      this.payrolls = payrolls;
      this.filterPayrolls();
    });
  }

  filterPayrolls() {
    this.filteredPayrolls = this.payrolls.filter(
      (p) => p.month === this.selectedMonth
    );
  }

  viewDetails(payrollId: number) {
    const found = this.filteredPayrolls.find((p) => p.id === payrollId);
    if (found) {
      this.detailsPayroll = found;
      this.showDetailsModal = true;
    }
  }
  closeDetailsModal() {
    this.showDetailsModal = false;
    this.detailsPayroll = null;
  }
}
