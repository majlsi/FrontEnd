import { BaseModel } from "./baseModel";

export class Request extends BaseModel {
    id: number;
    organization_id: number;
    request_body: any; 
    request_type_id: number;
    created_by:number;
    is_approved:boolean;
    evidence_document_id:number;
    evidence_document_url:string;
  }