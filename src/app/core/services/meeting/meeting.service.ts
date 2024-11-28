
import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';


@Injectable()
export class MeetingService {
	constructor(private _requestService: RequestService) { }

	getMeetingOrganisersForMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-organisers', null, null);
	}

	setMeetingOrganisersForMeeting<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-organisers', data, null);
	}

	getMeetingParticipantsForMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-participants', null, null);
	}

	getMeetingParticipants<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participants', null, null);
	}

	setMeetingParticipantsForMeeting<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-participants', data, null);
	}

	publishMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/publish-meeting',
			{ 'id': meetingId }, null);
	}

	publishAgenda<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/publish-agenda-meeting',
			{ 'id': meetingId }, null);
	}

	startMeeting<T extends BaseModel>(meetingId: number, attachmenId: number = null): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/start-meeting',
			{ 'id': meetingId, 'attachmentId': attachmenId }, null);
	}

	endMeeting<T extends BaseModel>(meetingId: number, data): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/end-meeting',
			data, null);
	}

	cancelMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/cancel-meeting',
			{ 'id': meetingId }, null);
	}

	getAttachmentsForMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments', null, null);
	}

	setAttachmentsForMeeting<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments', data, null);
	}

	getMeetingAgendasForMeeting<T extends BaseModel>(meetingId: number): Observable<T[]> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-agendas', null, null);
	}

	getAgendaForMeeting(meetingId: number, meetingAgendaId: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-agendas/' + meetingAgendaId, null, null);
	}

	setMeetingAgendasForMeeting<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-agendas', data, null);
	}

	deleteMeetingAgenda<T extends BaseModel>(meetingId: number, agendaId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-agendas/' + agendaId, null, null);
	}

	getMeetingVotes<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-votes', null, null);
	}

	getVoteResults<T extends BaseModel>(meetingId: number, voteId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/meeting-votes/' + voteId + '/results', null, null);
	}

	setMeetingVotes<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-votes', data, null);
	}

	deleteMeetingVote<T extends BaseModel>(meetingId: number, voteId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-votes/' + voteId, null, null);
	}

	getMeetingMom<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/moms', null, null);
	}

	setMeetingMom<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/moms', data, null);
	}

	deleteMeetingMom<T extends BaseModel>(meetingId: number, momId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/moms/' + momId, null, null);
	}

	deleteMomAttachment<T extends BaseModel>(meetingId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/moms/attachments/' + attachmentId, null, null);
	}
	deleteAgendaAttachment<T extends BaseModel>(meetingId: number, agendaId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-agendas/' + agendaId + '/attachments/' + attachmentId, null, null);
	}

	getCurrentMeetingsPaginatedList<T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize = environment.pageSize;
		return this._requestService.SendRequest('POST', environment.apiBaseURL +
			'admin/meetings/current', filterObject, null);
	}

	checkScheduleConflict<T extends BaseModel>(meetingId: number, data: Object): Observable<T[]> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId +
			'/check-schedule-conflict', data, null);

	}

	redraftMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/undo-cancel-meeting',
			{ 'id': meetingId }, null);
	}

	getMeetingProposals<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-proposals', null, null);
	}

	getMeetingAllData<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/meeting-all-data', null, null);
	}

	getMeetingData<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-all-data', null, null);
	}

	getMeetingAllDataForPresentation<T extends BaseModel>(meetingId: number, attachmentId: number = null): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/meeting-all-data/' + attachmentId, null, null);
	}

	changeAttendStatus<T extends BaseModel>(data: object, meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/change-participant-status', data, null);
	}

	changeVoteStatus<T extends BaseModel>(data: object, meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/change-vote-status', data, null);
	}

	getComingMeetingsPaginatedList<T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize = environment.pageSize;
		return this._requestService.SendRequest('POST', environment.apiBaseURL +
			'admin/meetings/upcoming', filterObject, null);
	}

	getPreviousMeetingsPaginatedList<T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize = environment.pageSize;
		return this._requestService.SendRequest('POST', environment.apiBaseURL +
			'admin/meetings/previous', filterObject, null);
	}

	getMeetingUserComment<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL
			+ 'admin/meetings/' + meetingId + '/user-comment', null, null);
	}

	addOrUpdateUserComment<T extends BaseModel>(meetingId: number, data): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL
			+ 'admin/meetings/' + meetingId + '/user-comment', data, null);
	}


	sendEmailAfterEndMeeting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/send-email-after-end-meeting',
			{ 'id': meetingId }, null);
	}

	attendMeenting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/attend-attendance-status', null, null);
	}

	absentMeenting<T extends BaseModel>(meetingId: number, data): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/absent-attendance-status', data, null);
	}

	mayAttendMeenting<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/mayattend-attendance-status', null, null);
	}


	changeVoteResultToYes<T extends BaseModel>(voteId: number, meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/meeting-votes/' + voteId + '/yes', null, null);
	}

	changeVoteResultToNo<T extends BaseModel>(voteId: number, meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/meeting-votes/' + voteId + '/no', null, null);
	}

	changeVoteResultToAbstained<T extends BaseModel>(voteId: number, meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/meeting-votes/' + voteId + '/abstained', null, null);
	}

	getParticipantMeetingStatistics() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'participant/statistics/meeting-statistics'
			, null, null);
	}

	presentMeetingAttachment<T extends BaseModel>(meetingId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments/' + attachmentId + '/present', null, null);
	}

	takeParticipantAttendance<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/participant-attendance', null, null);
	}

	getPresentationSlides(attachmenId) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'meeting-attachments/' + attachmenId
			, null, null);
	}

	broadCastPresentationSlideNotes(attachmenId, data) {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'meeting-attachments/' + attachmenId + '/slide-notes'
			, data, null);
	}

	getAttachment(attachmenId) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/attachments/' + attachmenId
			, null, null);
	}

	endPresentation<T extends BaseModel>(meetingId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments/' + attachmentId + '/end', null, null);
	}

	changePresenter<T extends BaseModel>(meetingId: number, attachmentId: number, data): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments/' + attachmentId + '/change-presenter', data, null);
	}

	checkPresentationMaster<T extends BaseModel>(meetingId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments/' + attachmentId + '/check-presentation-master', null, null);
	}

	getCurrentPresentingAttachment(meetingId: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/current-presenting-attachment', null, null);
	}

	checkIfOrganiserInMeeting(meetingId: number): Observable<any> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/check-organiser', null, null);
	}

	downloadMomPdf(meetingId: number, lang: string) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/mom-download/' + lang, null, 'blob');
	}

	endPresentationWithOutNotification<T extends BaseModel>(meetingId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments/' + attachmentId + '/end-with-no-notification', null, null);
	}

	presentMeetingAttachmentWithOutEndNotification<T extends BaseModel>(meetingId: number, attachmentId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-attachments/' + attachmentId + '/present-with-no-end-notification', null, null);
	}

	endVote<T extends BaseModel>(meetingId: number, data: any): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/end-vote', data, null);
	}

	startVote<T extends BaseModel>(meetingId: number, data: any): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/start-vote', data, null);
	}

	sendSignatureMail<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/send-signature-mail', { meeting_id: meetingId }, null);
	}

	publishMeetingChanges<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/publish-changes', { meeting_id: meetingId }, null);
	}

	sendSignatureMailToParticipant<T extends BaseModel>(meetingId: number, data): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participant-send-signature-mail', data, null);
	}

	loginUserToSignature<T extends BaseModel>(meetingId: number): Observable<any> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/meetings/' +
			meetingId + '/	signature-user-login', { meeting_id: meetingId }, null);
	}

	getZoomMeetingStartUrl<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/zoom/start-url', null, null);
	}

	getMeetingPresentationAttachment<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/check-current-attachment', null, null);
	}

	previewMom(meetingId: number, langId: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/preview-mom/' +
			meetingId + '/language/' + langId, null, 'blob');
	}

	changeMomTemplate(meetingId: number, data) {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/change-mom-template', data, null);
	}

	changeMomPdf(meetingId: number, data) {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/change-mom-pdf', data, null);
	}
	createReviewFilePdf(data) {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/rooms/pdf' , data, 'blob');
	}


	getMomTemplate<T extends BaseModel>(meetingId: number,momTemplateId): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/mom-templates/' + momTemplateId, null, null);
	}

	setAttendForMeentingParticipant<T extends BaseModel>(meetingId: number,data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participant/attend-attendance-status', data, null);
	}

	setAbsentForMeentingParticipant<T extends BaseModel>(meetingId: number,data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participant/absent-attendance-status', data, null);
	}

	setAttendForMeentingParticipants<T extends BaseModel>(meetingId: number,data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participants/attend-attendance-status', data, null);
	}

	setAbsentForMeentingParticipants<T extends BaseModel>(meetingId: number,data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participants/absent-attendance-status', data, null);
	}

	getMeetingAttendancePercentage<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/attendance-percentage', null, null);
	}

	setAcceptAbsentForMeentingParticipant<T extends BaseModel>(meetingId: number,data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participant/accept-absent-attendance-status', data, null);
	}

	setAcceptAbsentForMeentingParticipants<T extends BaseModel>(meetingId: number,data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/participants/accept-absent-attendance-status', data, null);
	}

	addApprovalToMeeting<T extends BaseModel>(meetingId: number, data: object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/add-approval-meeting', data, null);
	}

	updateApprovalToMeeting<T extends BaseModel>(meetingId: number, approvalId: number, data: object): Observable<T> {
		return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/update-approval-meeting/' + approvalId, data, null);
	}

	deleteApprovalFromMeeting<T extends BaseModel>(meetingId: number, approvalId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/delete-approval-from-meeting/' + approvalId, null, null);
	}

	deleteMeetingRecommendation<T extends BaseModel>(meetingId: number, recommendationId: number): Observable<T> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-recommendation/' + recommendationId, null, null);
	}

	setMeetingRecommendationsForMeeting<T extends BaseModel>(meetingId: number, data: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/meeting-recommendation', data, null);
	}

	sendMeetingRecommendations<T extends BaseModel>(meetingId: number): Observable<T> {
		return this._requestService.SendRequest('get', environment.apiBaseURL + 'admin/meetings/' +
			meetingId + '/send-meeting-recommendation', null, null);
	}
}
