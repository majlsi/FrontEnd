import { LayoutModule } from "../layout/layout.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PagesRoutingModule } from "./pages-routing.module";
import { PagesComponent } from "./pages.component";
import { PartialsModule } from "../partials/partials.module";
import { ProfileComponent } from "./header/profile/profile.component";
import { CoreModule } from "../../core/core.module";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { FormsModule } from "@angular/forms";
import { ErrorPageComponent } from "./snippets/error-page/error-page.component";
import { ActionEntityDialogComponent } from "../partials/content/general/modals/action-entity-dialog/action-entity-dialog.component";
import { AlertComponent } from "../partials/content/general/alert/alert.component";
// tslint:disable-next-line:max-line-length
import { AddCommitteeMemberDialogComponent } from "../partials/content/general/modals/add-committee-member-dialog/add-committee-member-dialog.component";
import { ActionNotificationComponent } from "../partials/content/general/action-natification/action-notification.component";
import { LayoutUtilsService } from "../../core/services/layout-utils.service";
import { AuthModule } from "./auth/auth.module";
import { TranslateModule } from "@ngx-translate/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { ToastrModule } from "ng6-toastr-notifications";
import { WelcomeSplashPageComponent } from "./welcome-splash-page/welcome-splash-page.component";
import { WelcomeSplashModule } from "../components/welcome-splash/welcome-splash.module";
import { NotificationsPageModule } from './notifications-page/notifications-page.module';
import { HelpCenterModule } from "../components/help-center/help-center.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MeetingPageComponent } from './meeting-page/meeting-page.component';
import { InvitationPageComponent } from "./invitation-page/invitation-page.component";
@NgModule({
	declarations: [
		PagesComponent,
		ProfileComponent,
		ErrorPageComponent,
		ActionEntityDialogComponent,
		AddCommitteeMemberDialogComponent,
		ActionNotificationComponent,
		AlertComponent,
		WelcomeSplashPageComponent,
		InvitationPageComponent,
  MeetingPageComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		PagesRoutingModule,
		CoreModule,
		LayoutModule,
		PartialsModule,
		AngularEditorModule,
		MatProgressBarModule,
		MatDialogModule,
		MatSnackBarModule,
		MatIconModule,
		MatProgressSpinnerModule,
		AuthModule,
		TranslateModule.forChild(),
		NgSelectModule,
		ToastrModule,
		WelcomeSplashModule,
		NotificationsPageModule,
		HelpCenterModule
	],
	providers: [LayoutUtilsService],
})
export class PagesModule {}
