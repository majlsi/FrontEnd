import { TranslationService } from './../../../../core/services/translation.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedAddModalComponent } from '../shared-add-modal/shared-add-modal.component';
import { SharedSelectModalComponent } from '../shared-select-modal/shared-select-modal.component';
import { FileService } from '../../../../core/services/files/file.service';

@Component({
  selector: 'm-shared-add-section',
  templateUrl: './shared-add-section.component.html',
})
export class SharedAddSectionComponent implements OnInit {

  @Input() isEditable = true;
  @Input() attachments = [
  ];
  public files = [];
  @Input() pageTitle = 'للإجتماع';
  isArabic: boolean;
  can_upload: boolean;
  constructor(private modalService: NgbModal, private translationService: TranslationService,private fileService: FileService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.fileService.quotaObservable().subscribe(res => {
      this.can_upload = !res.has_exceeded_quota;
    });
    this.fileService.reloadStorageQuota();
  }

  selectFileModal() {
    const modalRef = this.modalService.open(SharedSelectModalComponent, { windowClass: 'modal-615', centered: true, keyboard: false });
    modalRef.result.then(result => {
      if (result) {
        const mappedResults = result.map(a => {
          return {
            attachment_url: a.file_path,
            attachment_name:  a.file_name + '.' + a.file_type.file_type_ext,
          is_external_storage: true
        };
        });
        this.attachments.push(...mappedResults);
      }
    } , (reason) => {
		});
  }
  addFileModal() {
    const modalRef = this.modalService.open(SharedAddModalComponent, { windowClass: 'modal-615', centered: true, keyboard: false });
    modalRef.result.then(result => {
      if (result) {
        this.files = [...this.files , ...result];
      }
    } , (reason) => {
		});
  }


  checkFileType(url: string) {
		let extention = url.split('.').pop();
    if (extention) {
			extention = extention.toLowerCase();
		}
		if (['jpeg', 'jpg', 'png'].includes(extention)) {
			return 'image';
		} else if (extention === 'pdf') {
			return 'pdf';
		} else if (['doc', 'docx', 'txt', 'odt'].includes(extention)) {
			return 'doc';
		} else if (['avi', 'mov', 'mp4', '4mp', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
	}
  removeFile(index) {
    this.files.splice(index, 1);
 }
 removeAttachment(index) {
  this.attachments.splice(index, 1);
 }
}
