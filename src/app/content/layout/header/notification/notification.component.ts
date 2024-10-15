
import {
	Component,
	OnInit,
	HostBinding,
	HostListener,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Router } from '@angular/router';
import { NotificationList } from '../../../../core/models/notification-list';
@Component({
	selector: 'm-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.scss'],
	//changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classes = 'm-nav__item m-topbar__notifications m-topbar__notifications--img m-dropdown m-dropdown--large m-dropdown--header-bg-fill m-dropdown--arrow m-dropdown--align-center 	m-dropdown--mobile-full-width';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';
	@HostBinding('attr.m-dropdown-persistent') attrDropdownPersisten = 'true';

	@Input() animateShake: any;
	@Input() animateBlink: any;
	newNotifications: boolean;
	newNotificationCount: number;
	notificationList: NotificationList = new NotificationList();
	isArabic: boolean = false;

	constructor(private notificationService: NotificationService,
		private _translationService: TranslationService,
		private router: Router) {
		// animate icon shake and dot blink
		setInterval(() => {
			this.animateShake = 'm-animate-shake';
			this.animateBlink = 'm-animate-blink';
		}, 3000);
		setInterval(() => (this.animateShake = this.animateBlink = ''), 6000);
	}

	ngOnInit(): void {
		this.notificationList.new_notifications = [];
		this.notificationList.old_notifications = [];
		this.getLanguage();
		this.getNumberOfNewNotifications();
		this.getNotificationsList();
		this.notificationService.newNotificationCount.subscribe(res => {
			this.newNotificationCount = res;
			this.getNotificationsList();
		});
		this.notificationService.isNewNotification.subscribe(res => {
			this.newNotifications = res;
		});
	}

	getNumberOfNewNotifications() {
		this.notificationService.getNewNotificationCount().subscribe(res => {
			this.newNotificationCount = res.count;
			// set new notifications number
		 	this.notificationService.setCountOfNewNotifications(res.count);
		},error => {});
	}

	getNotificationsList() {
		this.notificationService.getNotificationList().subscribe(res => {
			this.notificationList = res;
		},error => {});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	openNotification(notification) {
		this.closeNotifications();
		if(notification.is_read) {
			if(notification.notification_url) {
				this.router.navigate([notification.notification_url]);
			}
		} else {
			this.markNotificationAsReaded(notification);
		}
	}

	markNotificationAsReaded (notification) {
        this.notificationService.updateUnReadNotificationsToBeRead(notification.id).subscribe(res => {
			this.getNumberOfNewNotifications();
			if(notification.notification_url) {
				this.router.navigate([notification.notification_url]);
			}
    	});
	}

	redirectToNotificationList(){
		this.closeNotifications();
		this.router.navigate(['/notifications']);
	}

	closeNotifications() {
		let notificationsEle = document.getElementById('m_topbar_notification_icon');
		notificationsEle.click();
	}

	updateNewNotificationsFlag () {
		this.newNotifications = false;
		this.notificationService.setIsNewNotification(false);
	}

	markAllAsRead() {
		this.notificationService.markAllNotificationsAsRead().subscribe(res => {
			this.getNumberOfNewNotifications();
			this.closeNotifications();
		});
	}
}
