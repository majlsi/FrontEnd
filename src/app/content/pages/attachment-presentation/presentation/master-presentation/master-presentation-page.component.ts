import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslationService } from '../../../../../core/services/translation.service';
import { UserService } from '../../../../../core/services/security/users.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { environment } from '../../../../../../environments/environment';
import {ChatService} from '../../../../../core/services/chat/chat.service';
import { Router } from '@angular/router';

@Component({
    selector: 'm-master-presentation-page',
    templateUrl: './master-presentation-page.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MasterPresentationPageComponent implements OnInit {

    userId: any;
    meeting_guest_id: any;
    isArabic: any;
    user: any;

    constructor(private translationService: TranslationService,
        public toastr: ToastrManager,
        private router: Router,
        private chatService: ChatService,
        private _userService: UserService) { }

    ngOnInit() {
        this.getLanguage();
        this.getCurrentUser();
        this.listenToChatNotificationChannel();
    }

    getLanguage() {
        this.isArabic = this.translationService.isArabic();
    }

    getCurrentUser() {
        this._userService.getCurrentUser().subscribe(res => {
            this.userId = res.user.id;
            this.meeting_guest_id = res.user.meeting_guest_id;
            this.user = res.user;

        }, error => {

        });
    }

    listenToChatNotificationChannel() {
        window.Echo.channel('ChatNotifications')
            .listen('.ChatNotificationEvent', (data) => {
                const chat_users = data.data.sender_user.chat_users;
                const chat_guests = data.data.sender_user.chat_guests;
                let index = chat_users.findIndex(user => user.id == this.userId);
                if (index == -1) {
                    index = chat_guests.findIndex(user => user == this.meeting_guest_id);
                }
                if (index != -1 && this.user.chat_user_id != data.data.sender_user_id && (!data.data.is_chat_updated)) {
                    this.chatService.addNewChatNotificationsIdsArray(data.data.chat_room_id);

                    // let message = data.data.message_text;
                    // let title = this.isArabic ? data.data.chat_name_ar : (data.data.chat_name ? data.data.chat_name : data.data.chat_name_ar);
                    // this.toastr.infoToastr(message, title, {
                    //     animate: null,
                    //     toastTimeout: environment.toastTimeout,
                    // });
                    // if (data.data.chat_group_id) {
                    //     const chatGroupId = +data.data.chat_group_id;
                    //     this.toastr.onClickToast().subscribe(() => {
                    //         this.router.navigate(['/conversations/chats'], { queryParams: { chatGroupId: chatGroupId } });
                    //     });
                    // }
                }
            }, (e) => {
                console.log(e);
            });
    }

}
