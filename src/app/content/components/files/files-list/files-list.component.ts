import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FilterObject } from '../../../../core/models/filter-object';
import { DirectoryService } from '../../../../core/services/files/directory.service';
import { FileService } from '../../../../core/services/files/file.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { RenameModalComponent } from '../rename-modal/rename-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RequestService } from '../../../../core/services/shared/request.service';
import { DeleteFileRequestComponent } from '../delete-file-request/delete-file-request.component';

@Component({
  selector: 'm-files-list',
  templateUrl: './files-list.component.html',
})
export class FilesListComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  @Output() isEmpty = new EventEmitter<boolean>();
  nextPageNumber: number = 1;
  @Input() get config() {
    return this._config;
  }
  requesting = false;
  set config(val) {
    this._config = val;
    this.filterObject.PageSize = this._config.pageSize;
    this.filterObject.PageNumber = 1;
    if (this.config.isAllFiles && this.config.sort) {
      this.filterObject.SortBy = this.config.sort.sortBy;
      this.filterObject.SortDirection = this.config.sort.direction;
    }
    this.nextPageNumber = 1;
    this.subscription = this._config.requestSubject.asObservable().pipe(flatMap(res => {
      if (res) {
        if (res.event == 'page' && (this.config.isAllFiles || this.config.id)) {
          this.filterObject.PageNumber = res.data;
        } else if (res.event == 'delete') {
          this.nextPageNumber = 1;
          const index = this.files.findIndex(a => a.id == res.data);
          this.files.splice(index, 1);
        } else if (res.event == 'rename') {
          this.nextPageNumber = 1;
          const file = this.files.find(a => a.id == res.data.id);
          if (file) {
            file.file_name = res.data.name;
          }
        } else if (res.event == 'sort' && (this.config.isAllFiles || this.config.id)) {
          this.files = [];
          this.filterObject.SortBy = res.data.sortBy;
          this.filterObject.SortDirection = res.data.direction;
          this.filterObject.PageNumber = 1;
          this.nextPageNumber = 1;
        }
      } else {
        this.filterObject.PageNumber = 1;
      }
      this.requesting = true;
      return this.getFiles();
    })).subscribe(res => {
      let result = [];
      if (this.config.isAllFiles) {
        if (this.filterObject.PageNumber == 1) {
          result = [...res.Results, ...this.files];
        } else {
          result = [...this.files, ...res.Results];
        }
      } else {
        result = res.Results;
      }
      result = result.filter((el, i) => i == result.findIndex(a => a.id == el.id));
      this.files = result;
      if (res.TotalRecords) {
        this.isEmpty.emit(false);
      } else {
        this.isEmpty.emit(true);
      }
      this.requesting = false;
    }, error => { this.requesting = false; });
  }
  files = [];
  filterObject = new FilterObject();
  isArabic: boolean;
  _config: { requestSubject: BehaviorSubject<any>; path: any; pageSize: number; isAllFiles: boolean; sort: any, id: string };
  constructor(private filesService: FileService, private directoryService: DirectoryService,
    private modalService: NgbModal,
    private layoutUtilsService: LayoutUtilsService,
    private translate: TranslateService,
    private translationService: TranslationService) {
    this.filterObject.SearchObject = {};
    this.filterObject.PageNumber = 1;
    this.filterObject.PageSize = 24;
  }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
  }
  getFiles() {
    if (this.config.id) {
      return this.directoryService.getDirectoryDetailsFiles(this.config.id, this.filterObject);
    } else if (this.config.isAllFiles) {
      switch (this.config.path) {
        case 'my': {
          return this.filesService.getMyFiles(this.filterObject);
        }
        case 'shared': {
          return this.filesService.getSharedFiles(this.filterObject);
        }
        case 'recent': {
          return this.filesService.getRecentFiles(this.filterObject);
        }
      }
    } else {
      switch (this.config.path) {
        case 'my': {
          return this.filesService.getRecentFiles(this.filterObject);
        }
        case 'shared': {
          return this.filesService.getNewSharedFiles(this.filterObject);
        }
      }
    }
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

  downloadFile(file) {
    this.filesService.showLoader();
    this.filesService.downloadFile(file.id).subscribe(res => {
      const binaryData = [];
      binaryData.push(res);
      const downloadURL = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/octet-stream' }));
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = file.file_name + '.' + file.file_type.file_type_ext;
      link.click();
      this.filesService.hideLoader();
    }, err => this.filesService.showLoader());
  }
  openShareModal(file) {
    const modalRef = this.modalService.open(ShareModalComponent, { windowClass: 'modal-615', centered: true, keyboard: false });
    modalRef.componentInstance.oldUsers = file.file_users;
    modalRef.componentInstance.ownerId = file.file_owner_id;
    modalRef.result.then(result => {
      if (result && result.users.length) {
        const storageRights = [];
        result.users.forEach(element => {
          if (result.edit) {
            const accessRight = { user_id: element, can_read: true, can_edit: true, can_delete: true };
            storageRights.push(accessRight);
          } else {
            const accessRight = { user_id: element, can_read: true, can_edit: false, can_delete: false };
            storageRights.push(accessRight);
          }
        });
        this.filesService.shareFile(file.id, storageRights).subscribe(res => {
          this.config.requestSubject.next(null);
        });
      }
    }, (reason) => {
    });
  }
  openRenameModal(file) {
    const modalRef = this.modalService.open(RenameModalComponent, { centered: true, keyboard: false });
    modalRef.componentInstance.name = file.file_name;
    modalRef.result.then(result => {
      if (result) {
        this.filesService.renameFile(file.id, result).subscribe(res => {
          this.config.requestSubject.next({ event: 'rename', data: { id: file.id, name: result } });
        });
      }
    }, (reason) => {
    });
  }

  handleDeleteFileRequest(file) {
    this.filesService.getDeleteFileFeatureVariable().subscribe(_res => {
      if (_res.deleteFileField) {
        this.deleteFileRequest(file);
      } else {
        this.deleteFile(file);
      }
    }, error => {

    });
  }

  deleteFileRequest(file) {
    const modelRef = this.modalService.open(DeleteFileRequestComponent, {
      centered: true, size: 'lg', backdrop: 'static', keyboard: false
    });
    modelRef.componentInstance.fileId = file.id;
    modelRef.result.then(
      (result) => {
        if (result != null) {
          this.layoutUtilsService.showActionNotification(
            this.isArabic ? result['message'][0].message_ar : result['message'][0].message, MessageType.Delete
          );
          this.config.requestSubject.next({ event: 'deleteRequest' });
        }
        this.modalService.dismissAll();
      }
    );
  }

  deleteFile(file) {
    const _title: string = this.translate.instant('FILES.DELETE.DELETEFILE');
    const _description: string = this.translate.instant('FILES.DELETE.DESCRIPTIONFILE');
    const _waitDesciption: string = this.translate.instant('FILES.DELETE.WAITDESCRIPTION');
    const _deleteErrorMessage = this.translate.instant('FILES.DELETE.DELETE_ERROR_MESSAGEFILE');

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.filesService.delete(file.id).subscribe(_res => {
        this.filesService.reloadStorageQuota();
        this.config.requestSubject.next({ event: 'delete', data: file.id });
      }, error => {
        this.layoutUtilsService.showActionNotification(_deleteErrorMessage, MessageType.Delete);
        this.config.requestSubject.next(null);
      });

    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  onScroll() {
    if (this.config.isAllFiles && !this.requesting) {
      this.nextPageNumber++;
      this.config.requestSubject.next({ event: 'page', data: this.nextPageNumber });
    }
  }
}
