import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProposalsModule } from '../../components/proposals/proposals.module';
import { Right } from '../../../core/models/enums/rights';
import { ProposalsPageComponent } from './proposals-page.component';
import { ProposalPageComponent } from './proposal/proposal-page.component';
import { ProposalListPageComponent } from './proposal-list/proposal-list-page.component';

const routes: Routes = [
	{
		path: '',
		component: ProposalsPageComponent,
		children: [
			{
				path: '',
				component: ProposalListPageComponent,
				data: {
					right: Right.PROPOSALS
				}
			},
			{
				path: 'add',
				component: ProposalPageComponent,
				data: {
					right: Right.ADDPROPOSAL
				}
			},
			{
				path: 'view/:id',
				component: ProposalPageComponent,
				data: {
					right: Right.PROPOSALDETAILS
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		ProposalsModule

	],
	declarations: [
        ProposalsPageComponent, ProposalPageComponent, ProposalListPageComponent
    ],
    providers: [],
})

export class ProposalsPageModule { }
