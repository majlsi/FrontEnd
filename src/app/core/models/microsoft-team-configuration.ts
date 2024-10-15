import { BaseModel } from './baseModel';

export class MicrosoftTeamConfiguration extends BaseModel {
    id: number;
    organization_id: number;
    microsoft_azure_app_id: string;
    microsoft_azure_tenant_id: string;
    microsoft_azure_client_secret: string;
    microsoft_azure_user_id: string;
}
