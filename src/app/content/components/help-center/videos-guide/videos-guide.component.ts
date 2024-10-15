import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Page } from '../../../../core/models/page';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TutorialModalComponent } from '../tutorial-modal/tutorial-modal.component';
import { VideoGuide } from '../../../../core/models/video-guide';

@Component({
	selector: 'm-videos-guide',
	templateUrl: './videos-guide.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class VideosGuideComponent implements OnInit {


	@Output() closeModal = new EventEmitter<boolean>();
	videosGuide: Array<VideoGuide> = [];
	isArabic: boolean = false;

	constructor(
		private modalService: NgbModal, private crudService: CrudService, private router: Router,
		private translate: TranslateService,
		private _translationService: TranslationService) { }

	ngOnInit() {
		this.getLanguage();
		this.getGuideVideos();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	getGuideVideos() {
		this.crudService.getList<VideoGuide>('admin/videos-guide').subscribe(res => {
			this.videosGuide = res;
		})
	}

	// Open tutorials modal
	openTutorial(video: VideoGuide) {
		if (video.video_url) {
			this.closeModal.emit(true);
			const modalRef = this.modalService.open(TutorialModalComponent, { centered: true, windowClass: 'hidden-modal-content', size: 'lg' });
			modalRef.componentInstance.video = video;
		}

	}

}
