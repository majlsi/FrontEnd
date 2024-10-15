import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DirectoryService } from '../../../../core/services/files/directory.service';
import { FileService } from '../../../../core/services/files/file.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { SharedAddModalComponent } from '../../shared/shared-add-modal/shared-add-modal.component';
import { NewFolderModalComponent } from '../new-folder-modal/new-folder-modal.component';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';

@Component({
  selector: 'm-my-files',
  templateUrl: './my-files.component.html',
})
export class MyFilesComponent implements OnInit, AfterViewInit {

  activeTab = 'top';
  isArabic: boolean;
  canAdd = false;
  path: any;
  id: any;
  emptyFiles = null;
  emptyDirectories = null;
  emptyRecent = true;
  requestSubject = new BehaviorSubject<any>(null);
  filesConfig: { requestSubject: BehaviorSubject<any>; path: any; pageSize: number; isAllFiles: boolean; sort: any  };
  directoriesConfig: { requestSubject: BehaviorSubject<any>; path: any; pageSize: number; sort: any };
  recentFilesConfig: { requestSubject: BehaviorSubject<any>; path: any; pageSize: number; isAllFiles: boolean; };
  can_upload = false;
  isRecentPage: boolean;

  asc = false;

  sortOrders  = [{label: 'FILES.NAME', value: 'name'}, {label: 'FILES.DATE', value: 'updated_at'}];
  selectedSortOrder = {label: 'FILES.DATE', value: 'updated_at'};
  constructor(private route: ActivatedRoute, private modalService: NgbModal,
    private directoryService: DirectoryService, private fileService: FileService,
    private translationService: TranslationService,
    private videoGuideService: VideoGuideService,
    private layoutUtilsService: LayoutUtilsService) { }


  ngOnInit() {
    this.path = '';
    this.isArabic = this.translationService.isArabic();
    this.route.params.subscribe(params => {
      this.requestSubject = new BehaviorSubject<any>(null);
      this.path = params['path'];
      this.canAdd = params['path'] == 'my';
      this.isRecentPage = params['path'] == 'recent';
      this.emptyFiles = null;
      this.emptyDirectories = null;
      this.emptyRecent = true;
      this.directoriesConfig = { requestSubject: this.requestSubject, path: this.path, pageSize: 100, sort : {direction: 'DESC', sortBy: 'updated_at'} };
      this.filesConfig = { requestSubject: this.requestSubject, path: this.path, pageSize: 24, isAllFiles: true, sort : {direction: 'DESC', sortBy: 'updated_at'} };
      this.recentFilesConfig = { requestSubject: this.requestSubject, path: this.path, pageSize: 4, isAllFiles: false };
      this.requestSubject.next(null);
      this.fileService.quotaObservable().subscribe(res => {
        this.can_upload = !res.has_exceeded_quota;
      });
    });
  }

  ngAfterViewInit(): void {
    this.checkTutorialGuide();
  }

  openNewFolderModal() {
    const modalRef = this.modalService.open(NewFolderModalComponent, { centered: true, keyboard: false });
    modalRef.result.then(result => {
      if (result) {
        const directory = { directory_name: result };
        this.directoryService.addDirectory(directory).subscribe(res => {
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
        this.fileService.addFiles(result).subscribe(res => {
          this.requestSubject.next(null);
          this.fileService.reloadStorageQuota();
          this.fileService.hideLoader();
        }, err => {
          this.fileService.hideLoader();
          if (this.isArabic) {
            this.layoutUtilsService.showActionNotification(err.error[0][0].message_ar, MessageType.Delete);

          } else {
            this.layoutUtilsService.showActionNotification(err.error[0][0].message, MessageType.Delete);
          }
        }
        );
      }
    }, (reason) => {
    });
  }
  isEmptyDirectories(event) {
    this.emptyDirectories = event;
  }
  isEmptyRecent(event) {

    this.emptyRecent = event;
  }
  isEmptyFiles(event) {
    this.emptyFiles = event;
  }

  ChangeSortOrder(newSortOrder) {
    this.selectedSortOrder = newSortOrder;
    this.changeSort();
  }
  changeSort() {
    const direction = (this.asc ==  false ? 'DESC' : 'ASC');
    if (this.selectedSortOrder) {
      this.requestSubject.next({event: 'sort', data: {direction: direction, sortBy: this.selectedSortOrder.value}});
    }
  }

  checkTutorialGuide() {
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			this.videoGuideService.startGuide(list);
		}
	}
}
