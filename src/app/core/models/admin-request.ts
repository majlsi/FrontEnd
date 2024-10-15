import { BaseModel } from './baseModel';

export class AdminRequest extends BaseModel {
    request_type_id?: number;
    request_body: any;
    organization_id?: number;
    evidence_document_url?: string;
}
