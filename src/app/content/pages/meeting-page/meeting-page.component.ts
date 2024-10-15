import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenStorage } from '../../../core/auth/token-storage.service';
import { UserService } from '../../../core/services/security/users.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'm-meeting-page',
  templateUrl: './meeting-page.component.html',
})
export class MeetingPageComponent implements OnInit {
  alert = '';
  meetingName = 'رئاسة مجلس الإدارة';
  imgSrc = 'meeting-expired';
  isArabic: boolean = true;
  themeName = environment.themeName;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private _translationService: TranslationService,
    private userService: UserService,
    private storage: TokenStorage) {
  }

  ngOnInit() {
    this.getLanguage();
    this.activeRoute.queryParams.subscribe(param => {
      if (param['token'] != null) {
        this.storage.setAccessToken(param['token']);
        this.userService.AuthenticateGuest().subscribe(res => {
          this.router.navigate(['/guest-invitation'], { state: { meetingName: res.meeting_title_ar, meetingID: res.id } });
        }, err => {
          this.storage.setAccessToken('');
          this.alert = this.isArabic ? err.error_ar : err.error;
          const errorCode = err.error_code;
          if (errorCode === 1) {
            this.imgSrc = 'link-corrupted';
          } else if (errorCode === 2) {
            this.imgSrc = 'meeting-start';
          } else if (errorCode === 3) {
            this.imgSrc = 'meeting-expired';
          }
        });
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  getLanguage() {
    this.isArabic = this._translationService.isArabic();
  }

}
