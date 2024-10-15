
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PreviewRoomPageComponent } from './preview-room-page.component';
import { ReviewFilePageComponent } from './review-file/review-file-page.component';
import { PreviewRoomModule } from '../../components/preview-room/preview-room.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: PreviewRoomPageComponent,
		children: [

			{
				path: ':id',
				component: ReviewFilePageComponent,
				data: {
					right: Right.REVIEW_DOCUMENT
				},
			}

		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		PreviewRoomModule
	],
	declarations: [
		PreviewRoomPageComponent, ReviewFilePageComponent],

	providers: []
})

export class PreviewRoomPageModule { }
