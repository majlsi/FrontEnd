import { BaseModel } from './baseModel';
import { User } from './user';

export class Document extends BaseModel {
    id: number;
    added_by: number;
    organization_id: number;
    document_subject_ar: string;
    document_description_ar: string;
    document_url:  string;
    document_name: string;
    committee_id: number;
    document_status_id: number;
    review_start_date: any;
    review_end_date: any;
    document_users_ids: Array<any>;
    can_add_review: boolean;
    is_completed: boolean;
    reviewres: Array<User> = [];
}
