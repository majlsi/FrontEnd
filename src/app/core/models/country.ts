import { BaseModel } from './baseModel';

export class Country extends BaseModel {
    //id is inherited from Resource
    ID: number;
    Name: string;
    Code: string;
    DestinationName: string;
    DestinationCode: string;
}


