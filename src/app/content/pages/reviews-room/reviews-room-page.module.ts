import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReviewPageComponent } from "./review-page/review-page.component";
import { ReviewListPageComponent } from "./review-list-page/review-list-page.component";
import { Routes, RouterModule } from "@angular/router";
import { Right } from "../../../core/models/enums/rights";
import { ReviewsRoomPageComponent } from "./reviews-room-page.component";
import { ReviewsRoomModule } from "../../components/reviews-room/reviews-room.module";
import {
	NgbCollapseModule,
	NgbModule,
	NgbNavModule,
} from "@ng-bootstrap/ng-bootstrap";
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../partials/partials.module";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { JoyrideModule } from "ngx-joyride";

const routes: Routes = [
	{
		path: "",
		component: ReviewsRoomPageComponent,
		children: [
			{
				path: "",
				component: ReviewListPageComponent,
				data: {
					right: Right.REVIEW_ROOM,
				},
			},
			{
				path: "add",
				component: ReviewPageComponent,
				data: {
					right: Right.ADD_DOCUMENT,
				},
			},
			{
				path: "edit/:id",
				component: ReviewPageComponent,
				data: {
					right: Right.EDIT_DOCUMENT,
				},
			},
		],
	},
];
@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		NgbNavModule,
		MatTabsModule,
		ReviewsRoomModule,
		FormsModule,
		TranslateModule,
		NgbCollapseModule,
		PartialsModule,
		NgSelectModule,
		NgbModule,
		JoyrideModule
	],
	declarations: [
		ReviewsRoomPageComponent,
		ReviewPageComponent,
		ReviewListPageComponent,
	],
})
export class ReviewsRoomPageModule {}
