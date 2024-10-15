import { BaseModel } from './baseModel';
import { CommitteeNature } from './committee-nature';
import { CommitteeStatus } from './committee-status';
import { CommitteeType } from './committee-type';
import { User } from './user';

export class Committee extends BaseModel {
    id: number;
    committee_name_en: string;
    committee_name_ar: string;
    committeee_members_count: number;
    committee_head: User;
    member_users: Array<User> = [];
    committee_code: string;
    can_delete: boolean;
    committee_organiser: User;
    is_selected: boolean;
    chat_room_id: number;
    last_message_text: string;
    last_message_date: any;
    committee_start_date: any;
    committee_expired_date: any;
    final_output_date: any;
    governance_regulation_url: string;
    isFreezed: boolean;
    canRequestUnfreeze: boolean;
    organization_id: number;
    recommendations: Array<any>;
    newRecommendations: Array<any>;
    decision_number: number;
    decision_date: any;
    committee_responsible: User;
    committee_status: CommitteeStatus;
    decision_document_url: string;
    committee_type_id: number;
    committee_reason: string;
    committee_type: CommitteeType;
    final_output_url: string;
    can_add_final_output: boolean;
    final_outputs: Array<any>;
    has_recommendation_section: boolean;
    canEvaluateUser: boolean;
    canSendReminder: boolean;
    finalOutput: Array<any>;
    committee_nature: CommitteeNature;
    committee_nature_id: number;
}


