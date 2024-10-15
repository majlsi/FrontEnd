import { ChangeDetectionStrategy, Component,Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../../../../core/models/user';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin } from 'rxjs';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { attachment } from '../../../../core/config/attachment';
import { UserService } from '../../../../core/services/security/users.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';

@Component({
  selector: 'm-add-user-black-list',
  templateUrl: './add-user-black-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class AddUserBlackListComponent implements OnInit{
  submitted: boolean = false;
  @Input() user: User;
  @Input() isBlocked: boolean;
  edit: boolean = false;
  reason: any;
  attachmentTypeError: boolean = false;
	attachmentExtensions: Array<String> = ["jpeg", "jpg", "png", "doc", "docx", "odt", "xls", "xlsx", "ppt", "pptx", "pdf", "txt"];
	attachmentSizeError: string = "";
	attachmentChangedEvent: any;
  attachmentUrl:string;
  attachmentUrlObs: Observable<any>;
  document_url:string;  
    constructor(
    private router: Router,
    private translate: TranslateService,
    private _uploadService: UploadService,
    private _ngbActiveModal: NgbActiveModal,
    private _userService: UserService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }
  ngOnInit(): void {
   }

  fileUrlChangeEvent(event: any): void {

		this.attachmentSizeError = '';
		this.attachmentTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.attachmentChangedEvent = event.target.files[0];
			this.attachmentUrl = event.target.files[0].name;
			this.attachmentTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
		} else {
			this.attachmentUrl = null;
			this.attachmentChangedEvent = null;
		}
  }

    uploadEvidenceDocument (file: File) {
        if (file) {
            this.attachmentUrlObs = this._uploadService.uploadEvidenceDocument<File>(file);
        }
    }

    hasError(committeeForm: NgForm, field: string, validation: string) {
      if (committeeForm && Object.keys(committeeForm.form.controls).length > 0 &&
        committeeForm.form.controls[field].errors && validation in committeeForm.form.controls[field].errors) {
        if (validation) {
          return (committeeForm.form.controls[field].dirty &&
            committeeForm.form.controls[field].errors[validation]) || (this.edit && committeeForm.form.controls[field].errors[validation]);
        }
        return (committeeForm.form.controls[field].dirty &&
          committeeForm.form.controls[field].invalid) || (this.edit && committeeForm.form.controls[field].invalid);
      }
    }
  
    redirect() {
      this.router.navigate(['/committee-requests']);
    }
    close(res) {
      this.submitted = false;
      this.edit = false;
      this._ngbActiveModal.close(res);
    }
  
    dismiss() {
      this.submitted = false;
      this.edit = false;
      this._ngbActiveModal.dismiss();
    }

    validateFile() {
      this.attachmentSizeError = '';
      const fileSize = this.attachmentChangedEvent ? (this.attachmentChangedEvent.size / 1000) : 0;
      if (fileSize > attachment.file_size) {
        this.attachmentSizeError = this.translate.instant('USERS.VALIDATION.File_SIZE_ERROR');
      } else if (fileSize == 0 && this.attachmentChangedEvent) {
        this.attachmentSizeError = this.translate.instant('USERS.VALIDATION.File_ZERO_SIZE_ERROR');
      }
    }
  
    save(blockForm: NgForm) {
      this.submitted = true;
      this.edit = true;
      this.validateFile();
      if (blockForm.valid
        && !this.attachmentTypeError && this.attachmentSizeError.length == 0) { // submit form if valid
        if (this.attachmentChangedEvent) { 
          this.uploadAttachments(this.attachmentChangedEvent);
          forkJoin(this.attachmentUrlObs).subscribe(data => {             
          this.document_url = data[0].url;
            this.BlockMember();
          }, error => {
            this.submitted = false;
          });
        } else {
          this.BlockMember();
        }
      } else {
        this.submitted = false;
      }
    }

    uploadAttachments(file: File) {
      if (file) {
        this.attachmentUrlObs = this._uploadService.uploadBlockDocument<File>(file);
      }
    }
    BlockMember()
    {
      this._userService.updateUserBlockState({
				user_id: this.user.id,
				is_blocked: !this.user.is_blocked,
        document_url:this.document_url,
        reason:this.reason
			})
				.subscribe(res => {
          const _successMessage = this.translate.instant('USERS.BLOCK.ADDMESSAGE');
          this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
          this.close(res);
				},
					error => {
            this.submitted = false;
					});
    }
}
