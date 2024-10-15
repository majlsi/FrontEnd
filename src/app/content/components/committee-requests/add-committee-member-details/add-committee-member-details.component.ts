import { AttachmentType } from './../../../../core/models/attachment-type';

import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, AfterViewInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { User } from '../../../../core/models/user';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { forkJoin, Observable } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { environment } from '../../../../../environments/environment';
import { AddUserRequestService } from '../../../../core/services/request/addUserRequest.service';
import { RejectAddUserRequestComponent } from '../reject-add-user-request/reject-add-user-request.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'm-add-committee-member-details',
  templateUrl: './add-committee-member-details.component.html',
  styleUrls: ['./add-committee-member-details.component.scss']
})
export class AddCommitteeMemberDetailsComponent implements OnInit,AfterViewInit{
	user = {name_ar: "",email:"",job_id:"",job_title:"",Responsible_admininstartation:"",transfer_NO:"",committee_name:""};
	requestId:number;
	request:any;
	committeeId:number;
	userId: number;
	files=[];
	submitted:boolean=false;
	isArabic: boolean;


	constructor(private _crudService: CrudService, private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private uploadService: UploadService,
		private addUserRequestService: AddUserRequestService,
		private _modalService: NgbModal) {

			this.route.params.subscribe(params => {
				if (params['id']) {
					this.requestId = +params['id']; // (+) converts string 'id' to a number
				}
			});
	}
	ngAfterViewInit(): void {

	}

	ngOnInit() {
		this.getLanguage();

		this.getRequest();


	}

	redirect() {
			this.router.navigate(['/committee-requests']);
	}


	getRequest() {
		this._crudService.get<Request>(`requests`, this.requestId).subscribe(
			(data) => {
				if (data["request_body"]["committee_name_en"] && !this.isArabic) {
					this.user.committee_name = data["request_body"]["committee_name_en"];
				}
				else
				{
					this.user.committee_name = data["request_body"]["committee_name_ar"];
				}
				this.user.email=data["request_body"]["email"];
				this.userId=data["request_body"]["user_id"];
				this.committeeId=data["request_body"]["user_committee_id"]
				if(data["evidence_document_id"])
				{
					this.getFile(data["evidence_document_id"]);
				}
				this.request=data;
				this.getUser();

			},
			(error) => {

			}
		);
	}


	getUser() {
		this._crudService.get<User>(`users`, this.userId).subscribe(
			(data) => {
				if ( !this.isArabic) {
					this.user.name_ar = data["name"] || data["name_ar"];
				}
				else
				{
					this.user.name_ar = data["name_ar"] || data["name"];
				}
				this.user.job_id=data["job_id"];
				this.user.job_title=data["job_title"];
				this.user.Responsible_admininstartation=data["Responsible_admininstartation"];
				this.user.transfer_NO=data["transfer_NO"];
			},
			(error) => {

			}
		);
	}

	getFile($id) {
		this._crudService.get(`files`,$id).subscribe(
			(data) => {
				this.files=[data];
			},
			(error) => {

			}
		);
	}


	downloadFile(url: string) {
		url=environment.imagesBaseURL+url;
		this.uploadService.downloadFile(url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download =this.translate.instant('COMMITTEES.ADD.EVIDENCEDOCUMENT') + '.' + url.split('.').pop();
			link.click();
		});
	}


	formatBytes(bytes, decimals = 2) {
		if (bytes === 0) { return '0 Bytes'; }

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));
		const size = `${(bytes / Math.pow(k, i)).toFixed(dm)}${sizes[i]}`;
		return size;
	  }





	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}



	accept()
	{

		this.submitted=true;
		this.addUserRequestService.acceptRequest({user_id:this.userId,committee_id:this.committeeId}, this.requestId).subscribe(
			data => {
				this.redirect();
			},
			error => {
				this.submitted = false;
			});
	}


	reject()
	{

		const modelRef = this._modalService.open(RejectAddUserRequestComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.request = this.request;
	}





}
