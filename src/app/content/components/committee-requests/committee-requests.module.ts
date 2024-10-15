import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PartialsModule } from '../../partials/partials.module';
import { NewCommitteeRequestsComponent } from './add-committee-requests/new-committee-requests/new-committee-requests.component';
import { NewCommitteeMemberRequestsComponent } from './new-committee-member-requests/new-committee-member-requests.component';
import { NewDeleteMemberRequestsComponent } from './new-delete-member-requests/new-delete-member-requests.component';
import { NewDeleteDocumentRequestsComponent } from './new-delete-document-requests/new-delete-document-requests.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AddCommitteeMemberDetailsComponent } from './add-committee-member-details/add-committee-member-details.component';
import { SharedModule } from '../shared/shared.module';
import { RejectAddUserRequestComponent } from './reject-add-user-request/reject-add-user-request.component';
import { DeleteCommitteeMemberDetailsComponent } from './delete-committee-member-details/delete-committee-member-details.component';
import { UnfreezeMemberRequestComponent } from './unfreeze-member-requests/unfreeze-member-request/unfreeze-member-request.component';
import { UnfreezeMemberRequestsListComponent } from './unfreeze-member-requests/unfreeze-member-requests-list/unfreeze-member-requests-list.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatIconModule } from '@angular/material/icon';
import { RejectRequestComponent } from './reject-request/reject-request.component';
import { AddCommitteeRequestDetailsComponent } from './add-committee-requests/add-committee-request-details/add-committee-request-details.component';
import { DeleteFileDetailsComponent } from './delete-file-details/delete-file-details.component';
import { UpdateCommitteeRequestsComponent } from './update-committee-requests/update-committee-requests.component';


@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		MatPaginatorModule,
		MatSortModule,
		MatProgressSpinnerModule,
		TranslateModule,
		FormsModule,
		SharedModule,
		MatTableModule,
		MatIconModule,
		FormsModule,
		NgSelectModule,
		NgbCollapseModule,
		NgbModule,
		MatCheckboxModule,
		MatTooltipModule,
	],
	declarations: [
		NewCommitteeRequestsComponent,
		NewCommitteeMemberRequestsComponent,
		NewDeleteMemberRequestsComponent,
		NewDeleteDocumentRequestsComponent,
  AddCommitteeMemberDetailsComponent,
  RejectAddUserRequestComponent,
  DeleteCommitteeMemberDetailsComponent,
		UnfreezeMemberRequestComponent,
		UnfreezeMemberRequestsListComponent,
  		RejectRequestComponent,
		AddCommitteeRequestDetailsComponent,
  DeleteFileDetailsComponent,
  UpdateCommitteeRequestsComponent,
	],
	exports: [
		NewCommitteeRequestsComponent,
		NewCommitteeMemberRequestsComponent,
		NewDeleteMemberRequestsComponent,
		NewDeleteDocumentRequestsComponent,
		AddCommitteeMemberDetailsComponent,
		RejectAddUserRequestComponent,
		DeleteCommitteeMemberDetailsComponent,
		UnfreezeMemberRequestComponent,
		UnfreezeMemberRequestsListComponent,
		RejectRequestComponent,
		AddCommitteeRequestDetailsComponent,
		DeleteFileDetailsComponent, UpdateCommitteeRequestsComponent
	],
	providers: [],
})

export class CommitteeRequestsModule { }
