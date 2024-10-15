import { BaseModel } from "./baseModel";

export class Approval extends BaseModel {
    id: number;
    approval_title: string;
    committee_id: number;
    status_id: number;
    creator_name_ar: string;
    creator_name: string;
    approval_status_name_ar: string;
    approval_status_name_en: string;
    created_at_formatted: string;
    updated_at_formatted: string;

    organization_id: number;
    attachment_url:  string;
    attachment_name: string;
    members: Array<any> = [];
}
