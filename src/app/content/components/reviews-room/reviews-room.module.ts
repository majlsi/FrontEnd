import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReviewComponent } from "./review/review.component";
import { ReviewListComponent } from "./review-list/review-list.component";
import { FormsModule } from "@angular/forms";
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from "@angular/router";
import {
	NgbAccordionModule,
	NgbCollapseModule,
	NgbDatepickerModule,
	NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../partials/partials.module";
import { CoreModule } from "../../../core/core.module";
import { JoyrideModule } from "ngx-joyride";

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
		NgbModule,
		FormsModule,
		NgbAccordionModule,
		NgbCollapseModule,
		TranslateModule.forChild(),
		NgSelectModule,
		NgbDatepickerModule,
		MatTooltipModule,
		CoreModule,
		JoyrideModule
	],
	declarations: [ReviewComponent, ReviewListComponent],
	exports: [ReviewComponent, ReviewListComponent],
})
export class ReviewsRoomModule {}
