import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApprovalComponent } from "./approval/approval.component";
import { ApprovalListComponent } from "./approval-list/approval-list.component";
import { FormsModule } from "@angular/forms";
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from "@angular/router";
import {
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../partials/partials.module";
import { CoreModule } from "../../../core/core.module";
import { JoyrideModule } from "ngx-joyride";
import { ApprovalStepTwoComponent } from './approval-step-two/approval-step-two.component';
import { Step3ApprovalSummaryComponent } from './step3-approval-summary/step3-approval-summary.component';
import { ApprovalDetailsComponent } from './approval-details/approval-details.component';

@NgModule({
  imports: [
    CommonModule,
    PartialsModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    NgbModule,
    FormsModule,
    NgbAccordionModule,
    NgbCollapseModule,
    TranslateModule.forChild(),
    NgSelectModule,
    NgbDatepickerModule,
    MatTooltipModule,
    CoreModule,
    JoyrideModule
  ],
  declarations: [ApprovalComponent, ApprovalListComponent, ApprovalStepTwoComponent, Step3ApprovalSummaryComponent, ApprovalDetailsComponent],
  exports: [ApprovalComponent, ApprovalListComponent, ApprovalStepTwoComponent, Step3ApprovalSummaryComponent, ApprovalDetailsComponent],
})
export class ApprovalsModule { }
