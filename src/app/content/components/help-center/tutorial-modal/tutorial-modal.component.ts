import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { VideoGuide } from '../../../../core/models/video-guide';

@Component({
  selector: 'm-tutorial-modal',
  templateUrl: './tutorial-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TutorialModalComponent implements OnInit {

	closeAnimation: boolean;
	isArabic: boolean;
	@Input() video: VideoGuide;
	constructor(public activeModal: NgbActiveModal,
		private translationService: TranslationService,
		private route: Router) {
		this.isArabic = this.translationService.isArabic();
	}
	ngOnInit() {
		const tag = document.createElement('script');

		tag.src = 'https://www.youtube.com/iframe_api';
		document.body.appendChild(tag);
	  }
	closeTutorial() {
		this.closeAnimation = true;
		setTimeout(() => {
			this.activeModal.close(true);
		}, 350);
	}
	goToTutorialPage() {
		this.activeModal.close(false);
		this.route.navigate(['/help-center/tutorials']);
	}

	getVideoID(url: string) {
		let videoID;
		if (url.includes('v=')) {
		  const videoStr = url.split('v=')[1];
		  const ampersandPosition = videoStr.indexOf('&');
		  if (ampersandPosition !== -1) {
			 videoID = videoStr.substring(0, ampersandPosition);
		  } else {
			videoID = videoStr;
		  }
		}
		return videoID;
	  }


}
