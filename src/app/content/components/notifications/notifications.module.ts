import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
	CommonModule,
	PartialsModule,
	TranslateModule
  ],
  declarations: [NotificationsListComponent],
  exports:[
	NotificationsListComponent
  ]
})
export class NotificationsModule { }
