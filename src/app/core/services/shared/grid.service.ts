import {Injectable} from '@angular/core';


@Injectable()
export class GridService {
    constructor() {
    }

    getSortExpression(orderByParams: any, defaultOrderBy: string) {
        let OrderBy = defaultOrderBy;
        if (orderByParams && orderByParams.sorts) {
            OrderBy = orderByParams.sorts[0].prop;
        }
        return OrderBy;
    }
    getSortDirection(orderByParams: any) {
        let OrderByDirection = 'asc';
        if (orderByParams && orderByParams.sorts) {
            OrderByDirection = orderByParams.sorts[0].dir;
        }

        return OrderByDirection;
    }

}
