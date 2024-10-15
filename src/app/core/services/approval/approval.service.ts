import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { UpdateApprovalMembers } from '../../models/update-approval-members.dto';
import { Observable } from 'rxjs';

@Injectable()
export class ApprovalService {

    constructor(private _requestService: RequestService) { }

    downloadApproval(approvalId: number) {
        return this._requestService.SendRequest('get', environment.apiBaseURL + 'admin/approvals/'+ approvalId + '/download', null, 'blob');
    }

    getApprovalSlides(approvalId) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/approvals/' + approvalId + '/slides'
			, null, null);
    }

    updateApprovalMembers(approvalSignatures): Observable<any> {
        var approvalMembers: UpdateApprovalMembers[] = [];
        approvalSignatures.forEach(approvalMember => {
            const updateApprovalMember = new UpdateApprovalMembers();
            updateApprovalMember.id = approvalMember.id;
            updateApprovalMember.x = approvalMember.xPercentage - 15 < 0 ? 0 : approvalMember.xPercentage - 15;
            updateApprovalMember.y = approvalMember.yPercentage + 1;
            updateApprovalMember.slide = approvalMember.slide + 1;
            approvalMembers.push(updateApprovalMember);
        })
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'admin/approval-members', approvalMembers, null);
    }

    loginUserToSignature(approvalId: number): Observable<any> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/approvals/' +
        approvalId + '/signature-user-login', null, null);
    }


    downloadApprovalPdf(approvalId: number): Observable<any> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/approvals/' +
            approvalId + '/download-approval-pdf', null, 'blob');
    }
}
