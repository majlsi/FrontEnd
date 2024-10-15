import { Component, OnInit, HostListener } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Router } from '@angular/router';
import { NotificationList } from '../../../../core/models/notification-list';

@Component({
  selector: 'm-notifications-list',
  templateUrl: './notifications-list.component.html'
})
export class NotificationsListComponent implements OnInit {

    newNotificationCount: number;
    filterObject = new FilterObject();
    notificationList: NotificationList = new NotificationList();
    isArabic: boolean = false;
    TotalRecords: number;

    constructor(private notificationService: NotificationService,
        private crudService: CrudService,
        private _translationService: TranslationService,
        private router: Router) { 
        this.filterObject.SearchObject = {};
        this.filterObject.PageNumber = 1;
        this.filterObject.PageSize = 25;
        this.filterObject.SortBy = 'id';
        this.filterObject.SortDirection = 'desc';
    }

    ngOnInit() {
        this.notificationList.new_notifications = [];
        this.notificationList.old_notifications = [];
        this.getLanguage();
        this.getNumberOfNewNotifications();
        this.getNotificationPagedList(true);
        this.notificationService.newNotificationCount.subscribe(res => {
            this.newNotificationCount = res;
            this.getNotificationPagedList(true);
        });
        window.addEventListener('scroll', this.onScrollDown.bind(this), true);
    }

    getNumberOfNewNotifications() {
        this.notificationService.getNewNotificationCount().subscribe(res => {
            this.newNotificationCount = res.count;
            // set new notifications number
		 	this.notificationService.setCountOfNewNotifications(res.count);
        },error => {});
    }

    getNotificationPagedList(restPageNumebr) {
        this.filterObject.PageNumber = restPageNumebr? 1 :  this.filterObject.PageNumber;
        this.notificationService.getPaginatedList(this.filterObject).subscribe(res => {
            this.notificationList = restPageNumebr? res.Results : this.prepareNotificationList(res.Results);
            this.TotalRecords = res.TotalRecords;
        });
    }

    prepareNotificationList(list) {
        if(list.new_notifications.length > 0) {
            this.notificationList.new_notifications = this.notificationList.new_notifications.concat(list.new_notifications);
        }
        if(list.old_notifications.length > 0) {
            this.notificationList.old_notifications = this.notificationList.old_notifications.concat(list.old_notifications);
        }
        return this.notificationList;
    }

    getLanguage() {
        this.isArabic = this._translationService.isArabic();
    }

    openNotification(notification) {
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

    onScrollDown() {
        if ((this.notificationList.new_notifications.length + this.notificationList.old_notifications.length) < this.TotalRecords) {
            this.filterObject.PageNumber++;
			this.getNotificationPagedList(false);
		}
    }
}
