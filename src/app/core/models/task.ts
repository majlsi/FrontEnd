import { BaseModel } from './baseModel';
import { User } from './user';

export class Task extends BaseModel {
    id: number;
    description: string;
    task_status_id: number;
    start_date: string;
    meeting_id: number;
	assigned_to: number;
    meeting_agenda_id: number;
    number_of_days: number;
    start_date_formated: string;
    assignee: User;
    created_by: User;
    task_status_history_group: [any];
    serial_number: string;
    vote_id: number;
    committee_id : number;
}


