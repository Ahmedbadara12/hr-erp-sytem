import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PayrollService } from '../../services/payroll.service';
import { IPayslip } from '../../../../shared/models/payroll.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="table-card" *ngIf="payslip$ | async as payslip; else loading">
      <div class="section-title mb-3"><i class="fas fa-file-invoice"></i> Payslip for Employee #{{ payslip.employeeId }} ({{ payslip.month }})</div>
      <dl class="row mb-0">
        <dt class="col-sm-4">Gross Salary</dt>
        <dd class="col-sm-8">{{ payslip.grossSalary | currency }}</dd>
        <dt class="col-sm-4">Net Salary</dt>
        <dd class="col-sm-8">{{ payslip.netSalary | currency }}</dd>
      </dl>
      <hr />
      <h6>Deductions</h6>
      <ul class="list-group mb-3">
        <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let d of payslip.deductions">
          {{ d.label }}
          <span>{{ d.amount | currency }}</span>
        </li>
      </ul>
      <h6>Allowances</h6>
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let a of payslip.allowances">
          {{ a.label }}
          <span>{{ a.amount | currency }}</span>
        </li>
      </ul>
    </div>
    <ng-template #loading>
      <app-loading-spinner></app-loading-spinner>
    </ng-template>
  `,
})
export class PayslipComponent implements OnInit {
  payslip$!: Observable<IPayslip | undefined>;

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.payslip$ = this.payrollService.getPayslipByPayrollId(+id);
      }
    });
  }
}
