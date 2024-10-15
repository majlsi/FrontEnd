import { BaseModel } from './baseModel';

export class JobTitle extends BaseModel {
    id: number;
    job_title_name_ar: string;
    job_title_name_en: string;
	organization_id: number;

}
