import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Right } from './../../../core/models/enums/rights';
import { PermanentCommitteeListComponent } from './permanent-committee-list/permanent-committee-list.component';
import { PermanentCommitteesPageComponent } from './permanent-committee-page.component';
import { CommitteesModule } from '../../components/committees/committees.module';
import { ViewPermanentCommitteeDetailsPageComponent } from './view-permanent-committee-details-page/view-permanent-committee-details-page.component';


const routes: Routes = [
	{
		path: '',
		component:  PermanentCommitteesPageComponent,
		children: [
			{
				path: '',
				component:  PermanentCommitteeListComponent,
				data: {
					right: Right.PermanentCommittees
				}
			},
			{
				path: 'view/:id',
				component:  ViewPermanentCommitteeDetailsPageComponent,
				data: {
					right: Right.PermanentCommittees
				}
			},
		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		CommitteesModule,
	],
	declarations: [
        PermanentCommitteesPageComponent,  PermanentCommitteeListComponent, ViewPermanentCommitteeDetailsPageComponent
    ],
    providers: [],
})

export class PermanentCommitteesPageModule { }
