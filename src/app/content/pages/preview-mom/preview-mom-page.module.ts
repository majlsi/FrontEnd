
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PreviewMomPageComponent } from './preview-mom-page.component';
import { PreviewMomPdfPageComponent } from './preview-mom-pdf/preview-mom-pdf-page.component';
import { PreviewMomModule } from '../../components/preview-mom/preview-mom.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: PreviewMomPageComponent,
		children: [

			{
				path: ':id',
				component: PreviewMomPdfPageComponent,
				data: {
					// right: Right.USERTITLESLIST
				},
			}

		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		PreviewMomModule
	],
	declarations: [
		PreviewMomPageComponent, PreviewMomPdfPageComponent],

	providers: []
})

export class PreviewMomPageModule { }
