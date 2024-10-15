import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Right } from '../../../core/models/enums/rights';
import { CommitteeRequestsComponent } from './committee-requests/committee-requests.component';
import { CommitteeRequestsPageComponent } from './committee-requests-page.component';
import { NgbAccordionModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { CommitteeRequestsModule } from '../../components/committee-requests/committee-requests.module';
import { JoyrideModule } from 'ngx-joyride';
import { AddCommitteeMemberRequestPageComponent } from './add-committee-member-request-page/add-committee-member-request-page.component';
import { DeleteCommitteeMemberRequestPageComponent } from './delete-committee-member-request-page/delete-committee-member-request-page.component';
import { UnfreezeMemberRequestPageComponent } from './unfreeze-member-request-page/unfreeze-member-request-page.component';
import { AddCommitteeRequestPageComponent } from './add-committee-request-page/add-committee-request-page.component';
import { DeleteFileRequestPageComponent } from './delete-file-request-page/delete-file-request-page.component';

const routes: Routes = [
	{
		path: '',
		component:  CommitteeRequestsPageComponent,
		children: [
			{
				path: '',
				component:  CommitteeRequestsComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},
			{
				path: 'add-member/:id',
				component: AddCommitteeMemberRequestPageComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},
			{
				path: 'delete-member/:id',
				component: DeleteCommitteeMemberRequestPageComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},
			{
				path: 'unfreeze-requests/:id',
				component:  UnfreezeMemberRequestPageComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},
			{
				path: 'add-committee-requests/:id',
				component:  AddCommitteeRequestPageComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},
			{
				path: 'delete-file/:id',
				component: DeleteFileRequestPageComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},
			{
				path: 'update-committee-requests/:id',
				component: AddCommitteeRequestPageComponent,
				data: {
					right: Right.CommitteeRequests
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		NgbNavModule,
		MatTabsModule,
		NgbAccordionModule,
		TranslateModule,
		NgSelectModule,
		NgbModule,
		CommitteeRequestsModule,
		JoyrideModule,
	],
	declarations: [
        CommitteeRequestsComponent,CommitteeRequestsPageComponent, AddCommitteeMemberRequestPageComponent, DeleteCommitteeMemberRequestPageComponent,UnfreezeMemberRequestPageComponent,AddCommitteeRequestPageComponent, DeleteFileRequestPageComponent
    ],
    providers: []
})

export class CommitteeRequestsPageModule { }
