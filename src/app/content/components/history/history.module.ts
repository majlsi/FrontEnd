import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsModule } from 'ngx-custom-validators';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../../core/core.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

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
		NgbModule,
		MatCheckboxModule,
		MatTooltipModule,
		TranslateModule
	],
	declarations: [
        HistoryComponent
	],
	exports: [  HistoryComponent],
    providers: [],
})

export class HistoryModule { }
