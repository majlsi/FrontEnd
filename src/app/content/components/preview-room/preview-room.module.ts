import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { PartialsModule } from "../../partials/partials.module";
import { FullCalendarModule } from '@fullcalendar/angular';
import { TranslateModule } from "@ngx-translate/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { FormsModule } from "@angular/forms";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReviewFileComponent } from "./review-file/review-file.component";
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgSelectModule } from "@ng-select/ng-select";
import { LayoutModule } from "../../layout/layout.module";

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		TranslateModule,
		NgxChartsModule,
		FullCalendarModule,
		FormsModule,
		NgbModule,
		NgbCollapseModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		MatRadioModule,
		MatTooltipModule,
		NgSelectModule,
		LayoutModule,
	],
	declarations: [ReviewFileComponent],
	exports: [ReviewFileComponent],

	providers: [],
})
export class PreviewRoomModule {}
