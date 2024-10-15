import { Component, OnInit } from "@angular/core";
import { SettingService } from "../../../../core/services/setting/setting.service";
import { Setting } from "../../../../core/models/setting";
import { TranslationService } from '../../../../core/services/translation.service';
import { UploadService } from "../../../../core/services/shared/upload.service";
import { environment } from "../../../../../environments/environment";
import { ConfigrationColumns } from "../../../../core/models/enums/configration-columns";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "m-user-guide-files",
	templateUrl: "./user-guide-files.component.html",
	styleUrls: ["./user-guide-files.component.scss"],
})
export class UserGuideFilesComponent implements OnInit {

	supportMail: string;
	mjlsiSystemBeforeMeetingVideoUrl: string = '';
	explainCreateMeetingVideoUrl: string = '';
	manageBoardMeetingVideoUrl: string = '';
	manageBoardMeetingExtraVideoUrl: string = '';
	introductionArabicPdfUrl: string = '';
	introductionEnglishPdfUrl: string = '';
	thirdPdfUrl: string = '';
	introductionArabicPdfUrlName: string = '';
	introductionEnglishPdfUrlName: string = '';
	thirdPdfUrlName: string = '';
	isArabic: boolean;

	constructor(private settingService: SettingService,
		private translationService: TranslationService,
		private translate: TranslateService,
		private uploadService: UploadService) { }

	ngOnInit() {
		this.isArabic = this.translationService.isArabic();
		this.settingService.getCongigrationColumn(ConfigrationColumns.supportEmail).subscribe(
			(data) => { this.supportMail = data.support_email; },
			(error) => { }
		);
		this.getMjlsiSystemBeforeMeetingVideoUrl();
		this.getExplainCreateMeetingVideoUrl();
		this.getManageBoardMeetingVideoUrl();
		this.getManageBoardMeetingExtraVideoUrl();
		this.getIntroductionArabicPdfUrl();
		this.getIntroductionEnglishPdfUrl();
		this.getThirdPdfUrl();
	}

	getMjlsiSystemBeforeMeetingVideoUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.mjlsiSystemBeforeMeetingVideoUrl).subscribe(
			(data) => { this.mjlsiSystemBeforeMeetingVideoUrl = data.mjlsi_system_before_meeting_video_url; },
			(error) => { }
		);
	}

	getExplainCreateMeetingVideoUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.explainCreateMeetingVideoUrl).subscribe(
			(data) => {
				this.explainCreateMeetingVideoUrl = data.explain_create_meeting_video_url;
			},
			(error) => { }
		);
	}

	getManageBoardMeetingVideoUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.manageBoardMeetingVideoUrl).subscribe(
			(data) => { this.manageBoardMeetingVideoUrl = data.manage_board_meeting_video_url; },
			(error) => { }
		);
	}

	getManageBoardMeetingExtraVideoUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.manageBoardMeetingExtraVideoUrl).subscribe(
			(data) => { this.manageBoardMeetingExtraVideoUrl = data.manage_board_meeting_extra_video_url; },
			(error) => { }
		);
	}

	getThirdPdfUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.thirdPdfUrl).subscribe(
			(data) => {
				this.thirdPdfUrl = data.third_pdf_url;
				this.thirdPdfUrlName = data.name;
			},
			(error) => { }
		);
	}

	getIntroductionArabicPdfUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.introductionArabicPdfUrl).subscribe(
			(data) => {
				this.introductionArabicPdfUrl = data.introduction_arabic_pdf_url;
				this.introductionArabicPdfUrlName = data.name;
			},
			(error) => { }
		);
	}

	getIntroductionEnglishPdfUrl() {
		this.settingService.getCongigrationColumn(ConfigrationColumns.introductionEnglishPdfUrl).subscribe(
			(data) => {
				this.introductionEnglishPdfUrl = data.introduction_english_pdf_url;
				this.introductionEnglishPdfUrlName = data.name;
			},
			(error) => { }
		);
	}
	download(url: string , name) {
		this.uploadService.downloadFile(environment.imagesBaseURL + url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = name.split('/').pop();
			link.click();
		});
	}
}
