
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, AfterViewInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
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
  selector: 'm-delete-file-details',
  templateUrl: './delete-file-details.component.html',
  styleUrls: ['./delete-file-details.component.scss']
})
export class DeleteFileDetailsComponent {
	document = {committee_name:"",delete_reason:""};
	requestId:number;
	request:any;
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
					this.document.committee_name = data["request_body"]["committee_name_en"];
				}
				else
				{
					this.document.committee_name = data["request_body"]["committee_name_ar"];
				}

				this.document.delete_reason=data["request_body"]["reason"]
				if(data["evidence_document_id"])
				{
					this.getFile(data["evidence_document_id"]);
				}


				this.request=data;


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
		this.addUserRequestService.acceptDeleteFileRequest( this.requestId).subscribe(
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
