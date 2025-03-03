import { Component, OnInit, Output } from '@angular/core';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { AuthNotice } from '../../../../core/auth/auth-notice.interface';

@Component({
	selector: 'm-auth-notice',
	templateUrl: './auth-notice.component.html',
	styleUrls: ['./auth-notice.component.scss'],
	host: {
	  class: 'lc-grid__item--wrapper'
	}
})
export class AuthNoticeComponent implements OnInit {
	@Output() type: any;
	@Output() message: any = '';

	constructor(public authNoticeService: AuthNoticeService) {}

	ngOnInit() {
		this.authNoticeService.onNoticeChanged$.subscribe(
			(notice: AuthNotice) => {
				if (notice) {
					this.message = notice.message;
					this.type = notice.type;
				}
			}
		);
	}
}
