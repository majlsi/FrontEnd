import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollTopComponent } from './layout/scroll-top/scroll-top.component';
import { TooltipsComponent } from './layout/tooltips/tooltips.component';
import { CoreModule } from '../../core/core.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PortletModule } from './content/general/portlet/portlet.module';
import { SpinnerButtonModule } from './content/general/spinner-button/spinner-button.module';
import { DataTableComponent } from './content/widgets/general/data-table/data-table.component';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
	declarations: [
		ScrollTopComponent,
		TooltipsComponent,
		DataTableComponent,
	],
	exports: [
		ScrollTopComponent,
		TooltipsComponent,
		DataTableComponent,
		PortletModule,
		SpinnerButtonModule
	],
	imports: [
		CommonModule,
		RouterModule,
		NgbModule,
		PerfectScrollbarModule,
		CoreModule,
		PortletModule,
		SpinnerButtonModule,
		MatSortModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatPaginatorModule,
		MatSelectModule,
		MatProgressBarModule,
		MatButtonModule,
		MatCheckboxModule,
		MatIconModule,
		MatTooltipModule
	]
})
export class PartialsModule { }
