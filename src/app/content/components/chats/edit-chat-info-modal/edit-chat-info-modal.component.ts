import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { ChatGroup } from '../../../../core/models/chat-group';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { Observable, forkJoin } from 'rxjs';
import { Image } from '../../../../core/models/image';
import { CrudService } from '../../../../core/services/shared/crud.service';

@Component({
	selector: 'm-edit-chat-info-modal',
	templateUrl: './edit-chat-info-modal.component.html',
	styleUrls: ['./edit-chat-info-modal.component.scss'],
})
export class EditChatInfoModalComponent implements OnInit {
	@Input() chatGroupId: number;
	@Input() chatGroup: ChatGroup;
	submitted: boolean = false;
	isArabic: boolean = false;
	edit: boolean = false;
	image_url: string = '';
	logoImageSizeError: string = '';
	fileRequiredError: boolean = false;
	fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
	logoImageChangedEvent: any;
	fileTypeError: boolean = false;
	logoImageUrlObs: Observable<any>;
	errors: Array<any> = [];
	@Output() selectChatUsers = new EventEmitter();

	constructor(
		private modalService: NgbModal,
		public activeModal: NgbActiveModal,
		private translate: TranslateService,
		private _translationService: TranslationService,
		private _uploadService: UploadService,
		private _crudService: CrudService
	) {}

	ngOnInit() {
		this.chatGroup = this.chatGroup ? this.chatGroup : new ChatGroup();
		this.getLanguage();
		if (this.chatGroupId && this.chatGroup.chat_group_logo) {
			this.image_url =
				environment.imagesBaseURL +
				this.chatGroup.chat_group_logo.image_url;
		} else {
			this.image_url = './assets/app/media/img/icons/group-icon.png';
		}
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	openSelectGroupMembers() {
		this.selectChatUsers.emit({ chatGroup: this.chatGroup });
	}

	close() {
		this.submitted = false;
	}

	save(form: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.errors = [];
		if (form.valid && this.fileTypeError === false) {
			if (!this.chatGroupId) {
				if (this.logoImageChangedEvent) {
					this.uploadLogo();
					forkJoin([this.logoImageUrlObs]).subscribe(
						(data) => {
							this.chatGroup.chat_group_logo = new Image();
							this.chatGroup.chat_group_logo.original_image_url =
								data[0].url;
							this.chatGroup.chat_group_logo.image_url = data[0].url;
							this.openSelectGroupMembers();
						},
						(erroe) => {
							this.logoImageSizeError = this.translate.instant(
								'CONVERSATIONS.VALIDATION.IMAGE_SIZE_ERROR'
							);
							this.submitted = false;
						}
					);
				} else {
					this.openSelectGroupMembers();
				}
			} else {
				// edit chat group
				if (this.logoImageChangedEvent) {
					this.uploadLogo();
					forkJoin([this.logoImageUrlObs]).subscribe(
						(data) => {
							this.chatGroup.chat_group_logo = this.chatGroup.chat_group_logo ? this.chatGroup.chat_group_logo : new Image();
							this.chatGroup.chat_group_logo.original_image_url =
								data[0].url;
							this.chatGroup.chat_group_logo.image_url =
								data[0].url;
							this.updateChatGroup();
						},
						(erroe) => {
							this.logoImageSizeError = this.translate.instant(
								'CONVERSATIONS.VALIDATION.IMAGE_SIZE_ERROR'
							);
							this.submitted = false;
						}
					);
				} else {
					this.updateChatGroup();
				}
			}
		}
		this.submitted = false;
	}

	hasError(groupForm: NgForm, field: string, validation: string) {
		if (
			groupForm &&
			Object.keys(groupForm.form.controls).length > 0 &&
			groupForm.form.controls[field] &&
			groupForm.form.controls[field].errors &&
			validation in groupForm.form.controls[field].errors
		) {
			if (validation) {
				return (
					(groupForm.form.controls[field].dirty &&
						groupForm.form.controls[field].errors[validation]) ||
					(this.edit &&
						groupForm.form.controls[field].errors[validation])
				);
			}
			return (
				(groupForm.form.controls[field].dirty &&
					groupForm.form.controls[field].invalid) ||
				(this.edit && groupForm.form.controls[field].invalid)
			);
		}
	}

	detectFiles(event) {
		this.logoImageSizeError = '';
		const extension = event.target.files[0].name.split('.');
		this.fileRequiredError = false;
		if (this.fileExtensions.includes(extension[extension.length - 1])) {
			this.logoImageChangedEvent = event.target.files[0];
			if (event.target.files[0]) {
				const reader = new FileReader();
				reader.onload = (e: any) => {
					this.image_url = e.target.result;
				};
				reader.readAsDataURL(event.target.files[0]);
			}
			this.fileTypeError = false;
		} else {
			this.image_url =
				environment.imagesBaseURL +
				this.chatGroup.chat_group_logo.image_url;
			this.fileTypeError = true;
		}
	}

	uploadLogo() {
		this.logoImageUrlObs = this._uploadService.uploadChatLogo<File>(this.logoImageChangedEvent);
	}

	updateChatGroup() {
		this._crudService
			.edit(
				'admin/chat-groups',
				{
					chat_group_logo: this.chatGroup.chat_group_logo,
					chat_group_name_ar: this.chatGroup.chat_group_name_ar,
					chat_group_name_en: this.chatGroup.chat_group_name_en,
				},
				this.chatGroupId
			)
			.subscribe(
				(res) => {
					this.activeModal.close({
						chatGroup: this.chatGroup,
						res: res,
					});
					this.submitted = false;
				},
				(error) => {
					this.errors = error.error;
					this.submitted = false;
				}
			);
	}
}
