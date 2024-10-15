import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FilterObject } from '../../../../core/models/filter-object';
import { DirectoryService } from '../../../../core/services/files/directory.service';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { RenameModalComponent } from '../rename-modal/rename-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { switchMap } from 'rxjs/operators';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from './../../../../core/services/translation.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../core/services/files/file.service';


@Component({
  selector: 'm-folders-list',
  templateUrl: './folders-list.component.html',
})
export class FoldersListComponent implements OnInit, OnDestroy {
  isArabic: boolean;
  imageBaseUrl = environment.imagesBaseURL;
  subscription: Subscription;
  @Output() isEmpty = new EventEmitter<boolean>();
  @Input() get config() {
    return this._config;
  }
  set config(val) {
    this.directories = [];
    this._config = val;
    this.filterObject.PageSize = this.config.pageSize;
    if (this.config.sort) {
      this.filterObject.SortBy = this.config.sort.sortBy;
      this.filterObject.SortDirection = this.config.sort.direction;
    }
    this.subscription = this.config.requestSubject.asObservable().pipe(switchMap(res => {
      if (res && res.event == 'sort') {
        this.directories = [];
        this.filterObject.SortBy = res.data.sortBy;
        this.filterObject.SortDirection = res.data.direction;
      }
      return this.getDirectories();

    })).subscribe(res => {
      this.directories = res.Results;
      if (res.TotalRecords) {
        this.isEmpty.emit(false);
      } else {
        this.isEmpty.emit(true);
      }

    });
  }
  directories = [];
  filterObject = new FilterObject();
  _config: { requestSubject: BehaviorSubject<any>, id: string, path: string, pageSize: number, sort: any };

  constructor(private directoryService: DirectoryService, private modalService: NgbModal,
    private layoutUtilsService: LayoutUtilsService,
    private translate: TranslateService,
    private translationService: TranslationService, private fileService: FileService) {
    this.filterObject.SearchObject = {};
    this.filterObject.PageNumber = 1;
    this.filterObject.PageSize = 24;
  }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
  }
  getDirectories() {
    if (this.config.id) {
      return this.directoryService.getDirectoryDetailsDirectories(this.config.id, this.filterObject);
    } else {
      switch (this.config.path) {
        case 'my': {
          return this.directoryService.getMyDirectories(this.filterObject);
        }
        case 'shared': {
          return this.directoryService.getSharedDirectories(this.filterObject);
        }
        case 'recent': {
          return this.directoryService.getRecentDirectories(this.filterObject);
        }
      }

    }
  }

  downloadDirectory(directory) {
    this.fileService.showLoader();
    this.directoryService.downloadDirectory(directory.id).subscribe(res => {
      const binaryData = [];
      binaryData.push(res);
      const downloadURL = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/octet-stream' }));
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = directory.directory_name + '.' + 'zip';
      link.click();
      this.fileService.hideLoader();
    }, error => this.fileService.hideLoader());
  }
  openShareModal(directory) {
    const modalRef = this.modalService.open(ShareModalComponent, {windowClass: 'modal-615', centered: true, keyboard: false });
    modalRef.componentInstance.oldUsers = directory.directory_users;
    modalRef.componentInstance.ownerId = directory.directory_owner_id;
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
        this.directoryService.shareDirectory(directory.id, storageRights).subscribe(res => {
          this.config.requestSubject.next(null);
        });
      }
    }, (reason) => {
    });
  }
  openRenameModal(directory) {
    const modalRef = this.modalService.open(RenameModalComponent, { centered: true, keyboard: false });
    modalRef.componentInstance.name = directory.directory_name;
    modalRef.result.then(result => {
      if (result) {
        this.directoryService.renameDirectory(directory.id, result).subscribe(res => {
          this.config.requestSubject.next(null);
        });
      }
    }, (reason) => {
    });
  }


  deleteDirectory(directory, index) {
    const _title: string = this.translate.instant('FILES.DELETE.DELETEDIRECTORY');
    const _description: string = this.translate.instant('FILES.DELETE.DESCRIPTIONDIRECTORY');
    const _waitDesciption: string = this.translate.instant('FILES.DELETE.WAITDESCRIPTION');
    // const _deleteMessage = this.translate.instant('ROLES.DELETE.DELETEMESSAGE');
    const _deleteErrorMessage = this.translate.instant('FILES.DELETE.DELETE_ERROR_MESSAGEDIRECTORY');

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.directoryService.delete(directory.id).subscribe(_res => {
        this.directories.splice(index, 1);
        this.config.requestSubject.next(null);
        this.fileService.reloadStorageQuota();
      }, error => {
        const msg = (this.isArabic ? error.errors[0].error_ar : error.errors[0].error) ?? _deleteErrorMessage;
        this.layoutUtilsService.showActionNotification(msg, MessageType.Delete);
        this.config.requestSubject.next(null);
      });

    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
