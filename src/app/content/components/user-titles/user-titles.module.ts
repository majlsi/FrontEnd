import { NgModule } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserTitleComponent } from './user-title/user-title.component';
import { UserTitleListComponent } from './user-title-list/user-title-list.component';
import { PartialsModule } from '../../partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

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
		NgbAccordionModule,
		NgbCollapseModule,
		TranslateModule
	],
	declarations: [
        UserTitleComponent, UserTitleListComponent
	],
	exports: [UserTitleComponent, UserTitleListComponent],

    providers: []
})

export class UserTitlesModule { }
