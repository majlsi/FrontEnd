import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommitteeComponent } from './committee/committee.component';
import { CommitteeListComponent } from './committee-list/committee-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddMemberComponent } from './add-memder/add-member.component';
import { TranslateModule } from '@ngx-translate/core';
import { EditMemberModalComponent } from './edit-member-modal/edit-member-modal.component';
import { CommitteeTableComponent } from './committee-table/committee-table.component';
import { DeleteMemberRequestComponent } from './delete-member-request/delete-member-request.component';
import { UnfreezeCommitteeComponent } from './unfreeze-committee/unfreeze-committee.component';
import { PermanentCommitteeComponent } from './permanent-committee/permanent-committee.component';
import { TemporaryCommitteeListComponent } from './temporary-committee/temporary-committee-list/temporary-committee-list.component';
import { WorksDoneComponent } from './works-done/works-done.component';
import { AddWorkModalComponent } from './add-work-modal/add-work-modal.component';
import { EditWorkDoneModalComponent } from './edit-work-done-modal/edit-work-done-modal.component';
import { EvaluateMemberModalComponent } from './evaluate-member-modal/evaluate-member-modal.component';
import { CommitteeRecommendationComponent } from './committee-recommendation/committee-recommendation.component';
import { AddFinalOutputFileComponent } from './add-final-output-file/add-final-output-file.component';
import { ViewCommitteeDetailsComponent } from './view-committee-details/view-committee-details.component';
import { DisclosureCommitteeUserModalComponent } from './disclosure-committee-user-modal/disclosure-committee-user-modal.component';
import { MyCommitteeListComponent } from './my-committee-list/my-committee-list.component';



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
		FormsModule,
		NgSelectModule,
		NgbCollapseModule,
		NgbModule,
		MatCheckboxModule,
		MatTooltipModule,
		TranslateModule
	],
	declarations: [
		CommitteeComponent, CommitteeListComponent, AddMemberComponent,
		EditMemberModalComponent, CommitteeTableComponent, DeleteMemberRequestComponent,
		UnfreezeCommitteeComponent, PermanentCommitteeComponent, TemporaryCommitteeListComponent,
		WorksDoneComponent, AddWorkModalComponent, EditWorkDoneModalComponent,
		EvaluateMemberModalComponent, AddFinalOutputFileComponent, CommitteeRecommendationComponent,
		ViewCommitteeDetailsComponent, DisclosureCommitteeUserModalComponent,MyCommitteeListComponent
	],
	exports: [
		CommitteeComponent, CommitteeListComponent, AddMemberComponent,
		CommitteeTableComponent, DeleteMemberRequestComponent, PermanentCommitteeComponent,
		TemporaryCommitteeListComponent, WorksDoneComponent, AddWorkModalComponent,
		EvaluateMemberModalComponent, ViewCommitteeDetailsComponent,
		DisclosureCommitteeUserModalComponent,MyCommitteeListComponent
	],
	providers: [],
})

export class CommitteesModule { }
