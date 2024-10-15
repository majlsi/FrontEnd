import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DirectoryService } from '../../../../core/services/files/directory.service';
import { FileService } from '../../../../core/services/files/file.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { SharedAddModalComponent } from '../../shared/shared-add-modal/shared-add-modal.component';
import { NewFolderModalComponent } from '../new-folder-modal/new-folder-modal.component';


@Component({
  selector: 'm-folder-details',
  templateUrl: './folder-details.component.html',
})
export class FolderDetailsComponent implements OnInit {

  path: any;
  id: any;
  directory: any;
  requestSubject = new BehaviorSubject<any>(null);

  isArabic: boolean;
  emptyFiles = null;
  emptyDirectories = null;
  filesConfig: { requestSubject: BehaviorSubject<any>; path: any; pageSize: number; isAllFiles: boolean; id: string, sort: any };
  directoriesConfig: { requestSubject: BehaviorSubject<any>; path: any; pageSize: number; id: string, sort: any };
  can_upload: boolean;
  constructor(private route: ActivatedRoute, private directoryService: DirectoryService,
     private fileService: FileService, private modalService: NgbModal, private layoutUtilsService: LayoutUtilsService,
     private translationService: TranslationService) { }


  asc = false;

  sortOrders = [{ label: 'FILES.NAME', value: 'name' }, { label: 'FILES.DATE', value: 'updated_at' }];
  selectedSortOrder = { label: 'FILES.DATE', value: 'updated_at' };


  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.fileService.quotaObservable().subscribe(res => {
      this.can_upload = !res.has_exceeded_quota;
    });
    this.route.params.subscribe(params => {
      this.requestSubject = new BehaviorSubject<any>(null);
      this.path = params['path'];
      this.id = params['id'];
      this.emptyFiles = null;
      this.emptyDirectories = null;
      this.directoriesConfig = { requestSubject: this.requestSubject, path: this.path, pageSize: 100, id: this.id, sort: { direction: 'DESC', sortBy: 'updated_at' } };
      this.filesConfig = { requestSubject: this.requestSubject, path: this.path, pageSize: 24, isAllFiles: true, id: this.id, sort: { direction: 'DESC', sortBy: 'updated_at' } };
      this.requestSubject.next(null);
      this.getDirectory();

    });
  }
  getDirectory() {
    this.directory = null;
    this.directoryService.getDirectoryDetails(this.id).subscribe(res => {
      this.directory = res;
    });
  }

  downloadDirectory() {
    this.fileService.showLoader();
    this.directoryService.downloadDirectory(this.directory.id).subscribe(res => {
      const binaryData = [];
      binaryData.push(res);
      const downloadURL = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/octet-stream' }));
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.directory.directory_name + '.' + 'zip';
      link.click();
      this.fileService.hideLoader();
    }, error => this.fileService.hideLoader());
  }

  openNewFolderModal() {
    const modalRef = this.modalService.open(NewFolderModalComponent, { centered: true, keyboard: false });
    modalRef.result.then(result => {
      if (result) {
        const directory = { directory_name: result };
        this.directoryService.addChildDirectory(this.id, directory).subscribe(res => {
          this.requestSubject.next(null);
        });
      }
    }, (reason) => {
    });
  }
  openUploadFileModal() {
    const modalRef = this.modalService.open(SharedAddModalComponent, { size: 'lg', centered: true, keyboard: false });
    modalRef.result.then(result => {
      if (result) {
        this.fileService.showLoader();
        this.fileService.addFilesOnDirectory(result, this.id).subscribe(res => {
            this.requestSubject.next(null);
            this.fileService.hideLoader();
            this.fileService.reloadStorageQuota();
        }, err => {
          this.fileService.hideLoader();
          if (this.isArabic) {
            this.layoutUtilsService.showActionNotification(err.error[0][0].message_ar, MessageType.Delete);

          } else {
            this.layoutUtilsService.showActionNotification(err.error[0][0].message, MessageType.Delete);
          }
        });
      }
    }, (reason) => {
    });

  }

  isEmptyDirectories(event) {
    this.emptyDirectories = event;
  }
  isEmptyFiles(event) {

    this.emptyFiles = event;
  }

  ChangeSortOrder(newSortOrder) {
    this.selectedSortOrder = newSortOrder;
    this.changeSort();
  }
  changeSort() {
    const direction = (this.asc == false ? 'DESC' : 'ASC');
    if (this.selectedSortOrder) {
      this.requestSubject.next({ event: 'sort', data: { direction: direction, sortBy: this.selectedSortOrder.value } });
    }
  }
}
