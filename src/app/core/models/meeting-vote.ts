import { BaseModel } from './baseModel';
import { VoteParticipants } from './vote-participants';
import { VoteResult } from './vote-result';

export class MeetingVote extends BaseModel {
	id: number;
	agenda_id: number;
	vote_type_id: number;

	meeting_id: number;
	vote_subject_ar: string;
	vote_subject_en: string;
	vote_schedule_from_date: any;
	vote_schedule_to_date: any;
	vote_schedule_from_time: any;
	vote_schedule_to_time: any;
	vote_schedule_from: any;
	vote_schedule_to: any;
	is_voted_now: boolean;
	is_started: boolean;
	vote_results:  Array<VoteResult> = [];
	vote_participants: Array<VoteParticipants> = [];
	yes_votes: number;
	no_votes: number;
	abstained_votes: number;
	add_from_presentation: boolean;
	decision_due_date: any;
	decision_type_id: number;
	is_secret: boolean;
	vote_result_status_id: number;
	vote_result_status_name_ar: string;
	vote_result_status_name_en: string;
}


