
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeetingComponent } from './meeting/meeting.component';
import { ParticipantsComponent } from './participants/participants.component';
import { AgendaComponent } from './agenda/agenda.component';
import { OrganisersComponent } from './organisers/organisers.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { AddVoteComponent } from './vote/vote.component';
import { MOMComponent } from './mom/mom.component';
import { ProposalComponent } from './proposal/proposal.component';
import { MeetingListComponent } from './meeting-list/meeting-list.component';

import { PartialsModule } from '../../../content/partials/partials.module';
import { NgbModalModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { AddMemberComponent } from './organisers/add-memder/add-member.component';
import { TranslateModule } from '@ngx-translate/core';
import { DlDateTimeDateModule } from 'angular-bootstrap-datetimepicker';
import { AddParticipantComponent } from './participants/add-participant/add-participant.component';
import { AddAttachmentComponent } from './agenda/add-attachment/add-attachment.component';
import { AddMomAttachmentComponent } from './mom/add-attachment/add-attachment.component';
import { ParticipantConflictComponent } from './participants/participant-conflict/participant-conflict.component';
/* Import Dropzone */
import { DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { dropzone } from '../../../core/config/dropzone';
import { CustomFormsModule } from 'ngx-custom-validators';
import { AgmCoreModule } from '@agm/core';
import { MeetingLocationComponent } from './meeting/meeting-location/meeting-location.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { DragulaModule } from 'ng2-dragula';

import { StartMeetingComponent } from './start-meeting/start-meeting.component';
import { MOMTemplateChangeComponent } from './mom-template-change/mom-template-change.component';
import { ChatsModule } from '../chats/chats.module';
import { JoditAngularModule } from 'jodit-angular';
import { ParticipantsAttendanceComponent } from './participants/participants-attendance/participants-attendance.component';
import { SharedModule } from '../shared/shared.module';
import { JoyrideModule } from 'ngx-joyride';
import { AddGuestModalComponent } from './add-guest-modal/add-guest-modal.component';
import { MeetingApprovalTabComponent } from './meeting-approval-tab/meeting-approval-tab.component';
import { AddApprovalModalComponent } from './add-approval-modal/add-approval-modal.component';
import { ApprovalsModule } from '../approvals/approvals.module';
import { MeetingRecommendationComponent } from './meeting-recommendation/meeting-recommendation.component';

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
		NgbModule,
		NgbCollapseModule,
		NgbNavModule,
		MatTabsModule,
		MatCheckboxModule,
		MatTooltipModule,
		TranslateModule.forChild(),
		DlDateTimeDateModule,
		DropzoneModule,
		CustomFormsModule,
		AgmCoreModule,
		GooglePlaceModule,
		DragulaModule,
		ChatsModule,
		JoditAngularModule,
		SharedModule,
		NgbModalModule,
		JoyrideModule
	],
	declarations: [
		MeetingComponent,
		ParticipantsComponent,
		AgendaComponent,
		OrganisersComponent,
		MeetingListComponent,
		AddMemberComponent,
		AddParticipantComponent,
		AttachmentsComponent,
		AddVoteComponent,
		MOMComponent,
		ProposalComponent,
		AddAttachmentComponent,
		AddMomAttachmentComponent,
		ParticipantConflictComponent,
		MeetingLocationComponent,
		StartMeetingComponent,
		MOMTemplateChangeComponent,
		ParticipantsAttendanceComponent,
		AddGuestModalComponent,
		MeetingApprovalTabComponent,
  AddApprovalModalComponent,
  MeetingRecommendationComponent,
	],
	exports: [
		MeetingComponent,
		ParticipantsComponent,
		AgendaComponent,
		OrganisersComponent,
		MeetingListComponent,
		AddMemberComponent,
		AddParticipantComponent,
		AttachmentsComponent,
		AddVoteComponent,
		MOMComponent,
		ProposalComponent,
		AddAttachmentComponent,
		AddMomAttachmentComponent,
		ParticipantConflictComponent,
		MeetingLocationComponent,
		StartMeetingComponent,
		MOMTemplateChangeComponent,
		ParticipantsAttendanceComponent,
		MeetingApprovalTabComponent,
		ApprovalsModule,
		MeetingRecommendationComponent,
	],
	providers: [
		{
			provide: DROPZONE_CONFIG,
			useValue: dropzone
		}
	]
})

export class MeetingsModule { }
