import { BaseModel } from './baseModel';
import { User } from './user';
import { Organization } from './organization';

export class Proposal extends BaseModel {
    id: number;
    proposal_text: string;
    proposal_title: string;
    created_by: number;
    organization_id: number;
    user: User;
    organization: Organization;
}
