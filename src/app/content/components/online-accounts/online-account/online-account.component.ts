
import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Organization } from '../../../../core/models/organization';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Role } from './../../../../core/models/role';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

// Service
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TimeZone } from '../../../../core/models/time-zone';
import { UserService } from '../../../../core/services/security/users.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { MessageType, LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { Image } from '../../../../core/models/image';
import { ZoomConfiguration } from '../../../../core/models/zoom-configuration';
import { OnlineMeetingApp } from '../../../../core/models/online-meeting-app';
import { OnlineMeetingApps } from '../../../../core/models/enums/online-meeting-apps';
import { MicrosoftTeamConfiguration } from '../../../../core/models/microsoft-team-configuration';
import { UserOnlineConfiguration } from '../../../../core/models/user-online-configuration';

@Component({
    selector: 'm-online-account',
    templateUrl: './online-account.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class OnlineAccountComponent implements OnInit {

    onlineCongigurationId: number;
    onlineMeetingApps: Array<OnlineMeetingApp> = [];
    onlineCongiguration = new UserOnlineConfiguration();
    submitted: boolean = false;
    edit: boolean = false;
    isArabic: boolean = false;
    onlineMeetingAppsEnum = OnlineMeetingApps;

    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router, private _uploadService: UploadService,
        private translate: TranslateService,
        private _translationService: TranslationService,
        private _userService: UserService,
        private _organizationService: OrganizationService,
        private layoutUtilsService: LayoutUtilsService) {

    }

    ngOnInit() {
        this.getLanguage();
        this.getOnlineMeetingApps();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.onlineCongigurationId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<UserOnlineConfiguration>('admin/user-online-configurations', this.onlineCongigurationId).subscribe(
                    res => {
                        this.onlineCongiguration = res;
                        this.onlineCongiguration.zoom_configuration = this.onlineCongiguration.zoom_configuration? this.onlineCongiguration.zoom_configuration : new ZoomConfiguration();
                        this.onlineCongiguration.microsoft_team_configuration = this.onlineCongiguration.microsoft_team_configuration? this.onlineCongiguration.microsoft_team_configuration : new MicrosoftTeamConfiguration();
                        if (this.onlineCongiguration.microsoft_configuration_id) {
                            this.onlineCongiguration.online_meeting_app_id = this.onlineMeetingAppsEnum.microsoftTeams;
                        } else if (this.onlineCongiguration.zoom_configuration_id){
                            this.onlineCongiguration.online_meeting_app_id = this.onlineMeetingAppsEnum.zoom;
                        }
                    },
                    error => {
                        // console.log('error');
                    });
            } else {
                this.onlineCongiguration.zoom_configuration = new ZoomConfiguration();
                this.onlineCongiguration.microsoft_team_configuration = new MicrosoftTeamConfiguration();
                this.onlineCongiguration.is_active = true;
            }
        },
        error => {
            // console.log('error');
        });
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }

    setAppsFlags(){

    }
    
    getOnlineMeetingApps() {
        this._crudService.getList<OnlineMeetingApp>('admin/online-meeting-apps').subscribe(res => {
            this.onlineMeetingApps = res;
        });
    }

    hasError(onlineConfigurationForm: NgForm, field: string, validation: string) {
		if (onlineConfigurationForm && Object.keys(onlineConfigurationForm.form.controls).length > 0 && onlineConfigurationForm.form.controls[field] &&
			onlineConfigurationForm.form.controls[field].errors && validation in onlineConfigurationForm.form.controls[field].errors) {
            if (validation) {
				return (onlineConfigurationForm.form.controls[field].dirty &&
					onlineConfigurationForm.form.controls[field].errors[validation]) || (this.edit && onlineConfigurationForm.form.controls[field].errors[validation]);
            }
			return (onlineConfigurationForm.form.controls[field].dirty &&
				onlineConfigurationForm.form.controls[field].invalid) || (this.edit && onlineConfigurationForm.form.controls[field].invalid);
        }
    }

    save(onlineConfigurationForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (onlineConfigurationForm.valid) { // submit form if valid
            if (this.onlineCongigurationId) { // if edit
                this._crudService.edit<UserOnlineConfiguration>('admin/user-online-configurations', this.onlineCongiguration, this.onlineCongigurationId).subscribe(
                    data => {
						this.router.navigate(['/online-configurations']);
                    },
                    error => {
                        this.submitted = false;
                    });
            } else { // if add
                this._crudService.add<UserOnlineConfiguration>('admin/user-online-configurations', this.onlineCongiguration).subscribe(
                    data => {
						this.router.navigate(['/online-configurations']);
                    },
                    error => {
                        this.submitted = false;
                    });
            }
        } else {
            this.submitted = false;
        }
    }

    changeIsActive(){
    }

    redirect() {
        this.router.navigate(['/online-configurations']);
    }

    downloadMicrosoftTeamsDocumentation() {
        const lang = this.isArabic? 1 : 2;
		this._organizationService.downloadMicrosoftTeamsDocumentationPdf(lang).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement("a");
			link.href = downloadURL;
			link.download =
				this.translate.instant("MICROSOFT_TEAMS_CONFIGURATION.DOCUMENTATION") + ".pdf";
			link.click();
		});
    }
    
}
