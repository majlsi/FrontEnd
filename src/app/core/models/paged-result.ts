import { BaseModel } from './baseModel';
import { Observable } from 'rxjs';

export class PagedResult extends BaseModel {
	TotalRecords: Observable<number>;
	Results: Array<any>;

}


