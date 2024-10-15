import { BaseModel } from './baseModel';
import { Right } from './right';

export class Module extends BaseModel {
    id: number;
    module_name: string;
    module_name_ar: string;
    icon: string;
	rights: Array<Right>;

}


