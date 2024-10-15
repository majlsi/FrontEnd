
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobTitlesPageComponent } from './job-titles-page.component';
import { JobTitleListPageComponent } from './job-title-list/job-title-list-page.component';
import { JobTitlePageComponent } from './job-title/job-title-page.component';
import { JobTitlesModule } from '../../components/job-titles/job-titles.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: JobTitlesPageComponent,
		children: [

			{
				path: '',
				component: JobTitleListPageComponent,
				data: {
					right: Right.JOBTITLESLIST
				},
			},
			{
				path: 'add',
				component: JobTitlePageComponent,
				data: {
					right:  Right.ADDNEWJOBTITLE
				}
			},
			{
				path: 'edit/:id',
				component: JobTitlePageComponent,
				data: {
					right: Right.EDITJOBTITLE
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		JobTitlesModule
	],
	declarations: [
		JobTitlesPageComponent, JobTitleListPageComponent, JobTitlePageComponent
	],

    providers: []
})

export class JobTitlesPageModule { }
