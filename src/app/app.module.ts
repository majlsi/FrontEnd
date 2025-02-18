import {FullCalendarModule} from '@fullcalendar/angular';
import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {AuthenticationModule} from './core/auth/authentication.module';
import {NgxPermissionsModule} from 'ngx-permissions';

import {LayoutModule} from './content/layout/layout.module';
import {PartialsModule} from './content/partials/partials.module';
import {CoreModule} from './core/core.module';
import {AclService} from './core/services/acl.service';
import {LayoutConfigService} from './core/services/layout-config.service';
import {MenuConfigService} from './core/services/menu-config.service';
import {PageConfigService} from './core/services/page-config.service';

import {UtilsService} from './core/services/utils.service';
import {ClassInitService} from './core/services/class-init.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {OverlayModule} from '@angular/cdk/overlay';

import {MessengerService} from './core/services/messenger.service';
import {ClipboardService} from './core/services/clipboard.sevice';

import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {LayoutConfigStorageService} from './core/services/layout-config-storage.service';
import {LogsService} from './core/services/logs.service';
import {QuickSearchService} from './core/services/quick-search.service';
import {SubheaderService} from './core/services/layout/subheader.service';
import {HeaderService} from './core/services/layout/header.service';
import {MenuHorizontalService} from './core/services/layout/menu-horizontal.service';
import {MenuAsideService} from './core/services/layout/menu-aside.service';
import {LayoutRefService} from './core/services/layout/layout-ref.service';
import {SplashScreenService} from './core/services/splash-screen.service';
import {DataTableService} from './core/services/datatable.service';
import {CrudService} from './core/services/shared/crud.service';
import {RequestService} from './core/services/shared/request.service';
import {GridService} from './core/services/shared/grid.service';
import {UserService} from './core/services/security/users.service';
import {UploadService} from './core/services/shared/upload.service';
import 'hammerjs';
import {RoleService} from './core/services/security/roles.service';
import {Authorization} from './core/services/shared/authorization';
import {OrganizationCompletedData} from './core/services/shared/organization-completed-data';
import {CustomFormsModule} from 'ngx-custom-validators';
import {NgbDatepickerI18n, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {OrganizationService} from './core/services/organization/organization.service';
import {CommitteeService} from './core/services/committee/committee.service';
import {TaskService} from './core/services/task/task.service';
import {CustomMatPaginatorIntl} from './core/services/shared/custom-mat-paginator-intl';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {MeetingService} from './core/services/meeting/meeting.service';
import {SettingService} from './core/services/setting/setting.service';
import {FaqService} from './core/services/faq/faq.service';
import {VerificationCodeService} from './core/services/decision/verification-code.service';
import {DlDateTimeDateModule} from 'angular-bootstrap-datetimepicker';
import {MeetingsCalendarDataService} from './core/services/meetings-calendar/meetings-calendar-data.service';
import {PreviousRouteService} from './core/services/previous.route.service';
import {AgmCoreModule, GoogleMapsAPIWrapper} from '@agm/core';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';
import {MeetingDataPrepareService} from './core/services/meeting/meeting-data-prepare.service';
import {CustomDatepickerI18nService} from './core/services/layout/custom-datepicker-I18n.service';
import {DragulaModule} from 'ng2-dragula';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {JoditAngularModule} from 'jodit-angular';
import ar from '@angular/common/locales/ar';
import en from '@angular/common/locales/en';
import {DatePipe, registerLocaleData} from '@angular/common';
import {LayoutUtilsService} from './core/services/layout-utils.service';
import {ChatService} from './core/services/chat/chat.service';
import {DocumentService} from './core/services/document/document.service';
import {environment} from '../environments/environment';
import {DecisionService} from './core/services/decision/decision.service';
import {NotificationService} from './core/services/notification/notification.service';
import {DashboardService} from './core/services/dashboard/dashboard.service';
import {SignatureService} from './core/services/decision/signature.service';
import {VideoGuideService} from './core/services/video-guide/video-guide.service';
import {JoyrideModule} from 'ngx-joyride';
import {StakeholderService} from './core/services/stakeholder/stakeholder.service';
import {ApprovalService} from './core/services/approval/approval.service';
import {EnvironmentVariableService} from './core/services/enviroment-variable/enviroment-variable.service';
import {AddUserRequestService} from './core/services/request/addUserRequest.service';
import {CommitteeRequestService} from './core/services/request/committeeRequest.service';
import {LdapUsersService} from './core/services/ldap-users/ldap-users.service';
import {ToastrModule} from 'ngx-toastr';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	// suppressScrollX: true
};

if (localStorage.getItem('language') === 'ar') {
	registerLocaleData(ar);
} else if (localStorage.getItem('language') === 'en') {
	registerLocaleData(en);
} else {
	registerLocaleData(ar);
}

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserAnimationsModule,
        BrowserModule,
        AppRoutingModule,
        LayoutModule,
        PartialsModule,
        CoreModule,
        OverlayModule,
        AuthenticationModule,
        NgxPermissionsModule.forRoot(),
        NgbModule,
        TranslateModule.forRoot(),
        MatProgressSpinnerModule,
        CustomFormsModule,
        DlDateTimeDateModule,
        FullCalendarModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        AgmCoreModule.forRoot({
            apiKey: environment.googleMapKey,
            language: localStorage.getItem('language'),
            libraries: ['places'],
        }),
        GooglePlaceModule,
        DragulaModule.forRoot(),
        MatSnackBarModule,
        MatDialogModule,
        InfiniteScrollModule,
        PdfViewerModule,
        JoditAngularModule,
        JoyrideModule.forRoot()], providers: [
        AclService,
        LayoutConfigService,
        LayoutConfigStorageService,
        LayoutRefService,
        MenuConfigService,
        PageConfigService,
        UtilsService,
        ClassInitService,
        MessengerService,
        ClipboardService,
        LogsService,
        QuickSearchService,
        DataTableService,
        SplashScreenService,
        RoleService,
        SignatureService,
        FaqService,
        MeetingDataPrepareService,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        // template services
        SubheaderService,
        HeaderService,
        MenuHorizontalService,
        CrudService,
        RequestService,
        GridService,
        Authorization,
        OrganizationCompletedData,
        UserService,
        StakeholderService,
        UploadService,
        OrganizationService,
        CommitteeService,
        TaskService,
        {
            provide: MatPaginatorIntl,
            useClass: CustomMatPaginatorIntl,
        },
        { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18nService },
        {
            provide: LOCALE_ID,
            useValue: localStorage.getItem('language')
                ? localStorage.getItem('language')
                : 'ar',
        },
        MeetingService,
        SettingService,
        MeetingsCalendarDataService,
        PreviousRouteService,
        GoogleMapsAPIWrapper,
        LayoutUtilsService,
        ChatService,
        DocumentService,
        DecisionService,
        NotificationService,
        DashboardService,
        VerificationCodeService,
        VideoGuideService,
        MenuAsideService,
        DatePipe,
        ApprovalService,
        EnvironmentVariableService,
        AddUserRequestService,
        CommitteeRequestService,
        LdapUsersService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {
}
