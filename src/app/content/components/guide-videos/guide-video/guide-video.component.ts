import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { VideoGuide } from '../../../../core/models/video-guide';
import { VideoIcon } from '../../../../core/models/video-icon';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';
import { TutorialStep } from '../../../../core/models/tutorial-step';

@Component({
	selector: 'm-guide-video',
	templateUrl: './guide-video.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class GuideVideoComponent implements OnInit {

	videoGuide = new VideoGuide();
	submitted: boolean = false;
	videoGuideId: number;
	edit: boolean = false;
	videoIcons: Array<VideoIcon> = [];
	videoIconsObs:Observable<VideoIcon[]>;
	tutorialSteps: Array<TutorialStep> = [];
	tutorialStepsObs:Observable<TutorialStep[]>;
	isArabic: boolean;

	constructor(private _crudService: CrudService, private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private videoGuideService: VideoGuideService,
		private translate: TranslateService) {

	}

	ngOnInit() {
		this.getLanguage();
		this.getVideoIcons();
		this.getTutorialSteps();
		this.route.params.subscribe(params => {
			forkJoin([this.videoIconsObs, this.tutorialStepsObs]).subscribe(data => {
				this.videoIcons = data[0];
				this.tutorialSteps = data[1];
				if (params['id']) {
					this.videoGuideId = +params['id'];
					this._crudService.get<VideoGuide>('admin/videos-guide', this.videoGuideId).subscribe(
						res => {
							this.videoGuide = res;
						},
						error => {
							// console.log('error');
						});
				}
			},error => {
			});
		});

	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	hasError(videoGuideForm: NgForm, field: string, validation: string) {
		if (videoGuideForm && Object.keys(videoGuideForm.form.controls).length > 0 && videoGuideForm.form.controls[field] &&
			videoGuideForm.form.controls[field].errors && validation in videoGuideForm.form.controls[field].errors) {
			if (validation) {
				return (videoGuideForm.form.controls[field].dirty &&
					videoGuideForm.form.controls[field].errors[validation]) || (this.edit && videoGuideForm.form.controls[field].errors[validation]);
			}
			return (videoGuideForm.form.controls[field].dirty &&
				videoGuideForm.form.controls[field].invalid) || (this.edit && videoGuideForm.form.controls[field].invalid);
		}
	}

	save(videoGuideForm: NgForm) {
		this.submitted = true;
		this.edit = true;

		if (videoGuideForm.valid) { // submit form if valid
			if (this.videoGuideId) { // if edit
				this._crudService.edit<VideoGuide>('admin/videos-guide', this.videoGuide, this.videoGuideId).subscribe(
					data => {
						this.router.navigate(['/videos-guide']);
					},
					error => {
						this.layoutUtilsService.showActionNotification(this.isArabic? error.error[0][0].error_ar : error.error[0][0].error, MessageType.Delete);
						this.submitted = false;
					});
			} else { // if add
				this._crudService.add<VideoGuide>('admin/videos-guide', this.videoGuide).subscribe(
					data => {
						this.router.navigate(['/videos-guide']);
					},
					error => {
						this.submitted = false;
					});
			}
		} else {
			this.submitted = false;
		}
	}

	redirect() {
		this.router.navigate(['/videos-guide']);
	}

	getVideoIcons() {
		this.videoIconsObs = this.videoGuideService.getVideoIcons();
	}

	getTutorialSteps(){
		this.tutorialStepsObs = this.videoGuideService.getTutorialSteps();
	}
}