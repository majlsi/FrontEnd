import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApprovalPageComponent } from "./approval-page/approval-page.component";
import { ApprovalListPageComponent } from "./approval-list-page/approval-list-page.component";
import { Routes, RouterModule } from "@angular/router";
import { Right } from "../../../core/models/enums/rights";
import { ApprovalsPageComponent } from "./approvals-page.component";
import { ApprovalsModule } from "../../components/approvals/approvals.module";
import {
	NgbCollapseModule,
	NgbModule,
	NgbNavModule,
} from "@ng-bootstrap/ng-bootstrap";
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../partials/partials.module";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { JoyrideModule } from "ngx-joyride";
import { ApprovalDetailsPageComponent } from './approval-details-page/approval-details-page.component';

const routes: Routes = [
	{
		path: "",
		component: ApprovalsPageComponent,
		children: [
			{
				path: "",
				component: ApprovalListPageComponent,
				data: {
					right: Right.Approvals,
				},
			},
			
			{
				path: "add",
				component: ApprovalPageComponent,
				data: {
					right: Right.addApproval,
				},
			},
			{
				path: "edit/:id",
				component: ApprovalPageComponent,
				data: {
					right: Right.addApproval,
				},
			},
			{
				path: "details/:id",
				component: ApprovalDetailsPageComponent,
				data: {
					right: Right.showApproval,
				},
			},
		],
	},
];
@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		NgbNavModule,
		MatTabsModule,
		ApprovalsModule,
		FormsModule,
		TranslateModule,
		NgbCollapseModule,
		PartialsModule,
		NgSelectModule,
		NgbModule,
		JoyrideModule
	],
	declarations: [
		ApprovalsPageComponent,
		ApprovalPageComponent,
		ApprovalListPageComponent,
  		ApprovalDetailsPageComponent,
	],
})
export class ApprovalsPageModule {}
