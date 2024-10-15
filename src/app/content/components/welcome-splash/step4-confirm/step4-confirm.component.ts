import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SettingService } from '../../../../core/services/setting/setting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'm-step4-confirm',
  templateUrl: './step4-confirm.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Step4ConfirmComponent implements OnInit {

	constructor( private router: Router) { }

  ngOnInit() {
  }
  goToCreateMeeting() {
	this.router.navigate(['/meetings/add']);
}

goToDashboard() {
	this.router.navigate(['/dashboard/secertary_dashboard']);
}


}
