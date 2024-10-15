import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '../../../../core/models/page';
import { VideoGuide } from '../../../../core/models/video-guide';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TutorialModalComponent } from '../tutorial-modal/tutorial-modal.component';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';
import { JoyrideService } from 'ngx-joyride';
import { TranslateService } from '@ngx-translate/core';
import { FaqService } from '../../../../core/services/faq/faq.service';

@Component({
	selector: 'm-tour-modal',
	templateUrl: './tour-modal.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class TourModalComponent implements OnInit {


	@Output() closeModal = new EventEmitter<boolean>();
	@Input() changeHeight: boolean;
	haveFaq: boolean = false;;

	videosGuides: Array<VideoGuide> = [];
	isArabic: boolean = false;

	constructor(private modalService: NgbModal,
		private crudService: CrudService, private router: Router,
		public activeModal: NgbActiveModal, private _translationService: TranslationService,
		private _faqService: FaqService,
		private videoGuideService: VideoGuideService
	) { }

	ngOnInit() {
		this.isArabic = this._translationService.isArabic();
		this.getGuideVideos();
		this.getFaqTree();
	}
	closeTour(closeModal) {
		if (closeModal) {
			this.changeHeight = false;
			setTimeout(() => {
				this.activeModal.close(true);
			}, 300);
		}
	}


	// Open tutorials modal
	openTutorial(video: VideoGuide) {
		if (video.video_url) {
			this.activeModal.close(true);
			const modalRef = this.modalService.open(TutorialModalComponent, { centered: true, windowClass: 'hidden-modal-content', size: 'lg' });
			modalRef.componentInstance.video = video;
		}
	}


	goToFaqs() {
		this.closeTour(true)
		this.router.navigate(['/help-center/faqs']);
	}

	getGuideVideos() {
		this.crudService.getList<VideoGuide>('admin/videos-guide').subscribe(res => {
			this.videosGuides = res;
		})
	}

	getFaqTree() {
		this._faqService.getFaqTree().subscribe(res => {
			this.haveFaq = res.length == 0 ? false : true;
		});
	}

	startTour(videosGuide: VideoGuide) {
		this.closeTour(true)
		this.videoGuideService.setGuideStepsList(videosGuide.tutorial_step.tutorial_steps_list);
		this.videoGuideService.setRouteUrl(videosGuide.tutorial_step.tutorial_start_route);
		this.router.navigate([videosGuide.tutorial_step.tutorial_start_route]);
	}
}
