import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user/user.component';
import { UserListComponent } from './user-list/user-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { JoyrideModule } from 'ngx-joyride';
import { AddUserBlackListComponent } from './add-user-black-list/add-user-black-list.component';
import { AddUserByNationalIdDialogComponent } from './add-user-by-national-id-dialog/add-user-by-national-id-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		FormsModule,
		NgSelectModule,
		NgbCollapseModule,
		TranslateModule,
		MatTooltipModule,
		JoyrideModule,
		NgbModule,
		MatProgressBarModule,
		MatButtonModule,
	],
	declarations: [
       UserComponent, UserListComponent, AddUserBlackListComponent, AddUserByNationalIdDialogComponent
	],
	exports: [ UserComponent, UserListComponent],
    providers: [],
})

export class UsersModule { }
