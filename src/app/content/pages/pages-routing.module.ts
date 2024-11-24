import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
// import { NgxPermissionsGuard } from 'ngx-permissions';
import { ProfileComponent } from './header/profile/profile.component';
import { ErrorPageComponent } from './snippets/error-page/error-page.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { Authorization } from '../../core/services/shared/authorization';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ConfirmComponent } from './auth/confirm/confirm.component';
import { LoginVerificationComponent } from './auth/login-verification/login-verification.component';
import { WelcomeSplashPageComponent } from './welcome-splash-page/welcome-splash-page.component';
import { OrganizationCompletedData } from '../../core/services/shared/organization-completed-data';
import { LoginNotificationOptionsComponent } from './auth/login-notification-options/login-notification-options.component';
import { InvitationPageComponent } from './invitation-page/invitation-page.component';
import { MeetingPageComponent } from './meeting-page/meeting-page.component';

const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		canActivateChild: [Authorization],
		children: [
			{
				path: '',
				redirectTo: 'dashboard/secertary_dashboard',
				pathMatch: 'full',
			},
			{
				path: 'my-profile',
				component: ProfileComponent,
			},
			{
				path: 'users',
				loadChildren: () => import('./users/users-page.module').then(m => m.UsersPageModule),
			},

			{
				path: 'mom-templates',
				loadChildren:
					() => import('./mom-templates-page/mom-templates-page.module').then(m => m.MomTemplatesPageModule),
			},
			{
				path: 'agenda-templates',
				loadChildren:
					() => import('./agenda-templates/agenda-templates-page.module').then(m => m.AgendaTemplatesPageModule),
			},
			{
				path: 'mom-summary-templates',
				loadChildren:
					() => import('./html-mom-templates/html-mom-templates-page.module').then(m => m.HtmlMomTemplatesPageModule),
			},
			{
				path: 'roles',
				loadChildren: () => import('./roles/roles-page.module').then(m => m.RolesPageModule),
			},
			{
				path: 'organizations',
				loadChildren:
					() => import('./organizations/organizations-page.module').then(m => m.OrganizationsPageModule),
			},
			{
				path: 'committees',
				loadChildren:
					() => import('./committees/committees-page.module').then(m => m.CommitteesPageModule),
			},
			{
				path: 'meetings',
				loadChildren:
					() => import('./meetings/meetings-page.module').then(m => m.MeetingsPageModule),
			},
			{
				path: 'time-zones',
				loadChildren:
					() => import('./time-zones/time-zones-page.module').then(m => m.TimeZonesPageModule),
			},
			{
				path: 'meeting-types',
				loadChildren:
					() => import('./meeting-types/meeting-types-page.module').then(m => m.MeetingTypesPageModule),
			},
			{
				path: 'job-titles',
				loadChildren:
					() => import('./job-titles/job-titles-page.module').then(m => m.JobTitlesPageModule),
			},
			{
				path: 'user-titles',
				loadChildren:
					() => import('./user-titles/user-titles-page.module').then(m => m.UserTitlesPageModule),
			},
			{
				path: 'nicknames',
				loadChildren:
					() => import('./nicknames/nicknames-page.module').then(m => m.NicknamesPageModule),
			},
			{
				path: 'meeting-dashboard',
				loadChildren:
					() => import('./meetings-dashboard/meeting-dashboard-page.module').then(m => m.MeetingDashboardPageModule),
			},
			{
				path: 'manage-absence',
				loadChildren:
					() => import('./meetings-absence/meeting-absence-page.module').then(m => m.MeetingAbsencePageModule),
			},

			{
				path: 'view-meetings',
				loadChildren:() => import('./view-meetings/view-meetings-page.module').then(m => m.ViewMeetingsPageModule),
			},
			{
				path: 'preview-meetings',
				loadChildren:
					() => import('./preview-meetings/preview-meetings-page.module').then(m => m.PreViewMeetingsPageModule),
			},
			{
				path: 'meeting-calendar',
				loadChildren:
					() => import('./meeting-calendar/view-meeting-calendar-page.module').then(m => m.ViewMeetingCalendarPageModule),
			},
			{
				path: 'edit-organization-profile',
				loadChildren:
					() => import('./organization/organization-page.module').then(m => m.OrganizationPageModule),
			},
			{
				path: 'participants',
				loadChildren:
					() => import('./participants/participants-page.module').then(m => m.ParticipantsPageModule),
			},
			{
				path: 'proposals',
				loadChildren:
					() => import('./proposals/proposals-page.module').then(m => m.ProposalsPageModule),
			},
			{
				path: 'dashboard',
				loadChildren:
					() => import('./dashboards/dashboards-page.module').then(m => m.DashboardsPageModule),
			},
			{
				path: 'tasks-management',
				loadChildren:
					() => import('./tasks-management/tasks-management-page.module').then(m => m.TasksManagementPageModule),
			},
			{
				path: 'settings',
				loadChildren:
					() => import('./settings/settings-page.module').then(m => m.SettingsPageModule),
			},
			{
				path: 'conversations',
				loadChildren: () => import('./chats/chats-page.module').then(m => m.ChatsPageModule),
			},
			{
				path: 'blocked-users',
				loadChildren:
					() => import('./blocked-users/blocked-users-page.module').then(m => m.BlockedUsersPageModule),
			},
			{
				path: 'online-configurations',
				loadChildren:
					() => import('./online-accounts/online-accounts-page.module').then(m => m.OnlineAccountsPageModule),
			},
			{
				path: 'preview-mom',
				loadChildren:
					() => import('./preview-mom/preview-mom-page.module').then(m => m.PreviewMomPageModule),
			},
			// {
			// 	path: "preview-room",
			// 	loadChildren:
			// 		"./preview-room/preview-room-page.module#PreviewRoomPageModule",
			// },
			{
				path: 'reviews-room',
				loadChildren:
					() => import('./reviews-room/reviews-room-page.module').then(m => m.ReviewsRoomPageModule),
			},
			{
				path: 'decisions',
				loadChildren:
					() => import('./decisions/decisions-page.module').then(m => m.DecisionsPageModule),
			},
			{
				path: 'files',
				loadChildren:
					() => import('./files/files-page.module').then(m => m.FilesPageModule),
			},
			{
				path: 'decision-types',
				loadChildren:
					() => import('./decision-types/decision-types-page.module').then(m => m.DecisionTypesPageModule),
			},
			{
				path: 'circular-decisions',
				loadChildren:
					() => import('./circular-decisions/circular-decisions-page.module').then(m => m.CircularDecisionsPageModule),
			},
			{
				path: 'notifications',
				loadChildren:
					() => import('./notifications-page/notifications-page.module').then(m => m.NotificationsPageModule),
			},
			{
				path: 'faq-sections',
				loadChildren:
					() => import('./faq-sections/faq-sections-page.module').then(m => m.FaqSectionsPageModule),
			},
			{
				path: 'faqs',
				loadChildren:
					() => import('./admin-faqs/admin-faqs-page.module').then(m => m.AdminFaqsPageModule),
			},
			{
				path: 'help-center',
				loadChildren:
					() => import('./help-center/help-center-page.module').then(m => m.HelpCenterPageModule),
			},
			{
				path: 'videos-guide',
				loadChildren:
					() => import('./guide-videos/guide-videos-page.module').then(m => m.GuideVideosPageModule),
			},
			{
				path: 'Stakeholders',
				loadChildren: () => import('./stakeholders/stakeholders-page.module').then(m => m.StakeholdersPageModule),
			},
			{
				path: 'approvals',
				loadChildren:
					() => import('./approvals/approvals-page.module').then(m => m.ApprovalsPageModule),
			},
			{
				path: 'committee-requests',
				loadChildren:
					() => import('./committee-requests/committee-requests-page.module').then(m => m.CommitteeRequestsPageModule),
			},
			{
				path: 'permanent-committee',
				loadChildren:
					() => import('./permanent-committees/permanent-committee-page.module').then(m => m.PermanentCommitteesPageModule),
			},
			{
				path: 'temporary-committee',
				loadChildren:
					() => import('./temporary-committees/temporary-committee-page.module').then(m => m.TemporaryCommitteesPageModule),
			},
			{
				path: 'history',
				loadChildren:
					() => import('./history/history-page.module').then(m => m.HistoryPageModule),
			},
		],
	},
	{
		path: 'welcome',
		component: WelcomeSplashPageComponent,
		canActivate: [Authorization],
	},
	{
		path: 'login',
		// canActivate: [NgxPermissionsGuard],
		loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
		data: {
			permissions: {
				except: 'Admin',
			},
		},
	},
	{
		path: 'guest-invitation',
		component: InvitationPageComponent,
	},
	{
		path: 'meeting',
		component: MeetingPageComponent,
	},
	{
		path: 'reset-password',
		component: ResetPasswordComponent,
	},
	{
		path: 'sign-up',
		component: RegisterComponent,
	},
	{
		path: 'forgot-password',
		component: ForgotPasswordComponent,
	},
	{
		path: 'notification-options',
		component: LoginNotificationOptionsComponent
	},
	{
		path: 'verify',
		component: LoginVerificationComponent
	},
	{
		path: 'confirm',
		component: ConfirmComponent,
	},
	{
		path: '404',
		component: ErrorPageComponent,
	},
	{
		path: 'error/:type',
		component: ErrorPageComponent,
	},
	{
		path:
			'meetings/:meeting_id/meeting_agenda/:meeting_agenda_id/attachments/:attachment_id',
		loadChildren:
			() => import('./attachment-presentation/attachment-presentation-page.module').then(m => m.AttachmentPresentationPageModule),
	},
	{
		path: 'reviews-room/details',
		canActivateChild: [Authorization],
		loadChildren:
			() => import('./preview-room/preview-room-page.module').then(m => m.PreviewRoomPageModule),
	},
	{
		path: 'approvals/details',
		canActivateChild: [Authorization],
		loadChildren:
			() => import('./approvals/approvals-page.module').then(m => m.ApprovalsPageModule),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PagesRoutingModule { }
