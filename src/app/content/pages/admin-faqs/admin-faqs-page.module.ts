
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminFaqsPageComponent } from './admin-faqs-page.component';
import { AdminFaqListPageComponent } from './admin-faq-list/admin-faq-list-page.component';
import { AdminFaqPageComponent } from './admin-faq/admin-faq-page.component';
import { AdminFaqsModule } from '../../components/admin-faqs/admin-faqs.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: AdminFaqsPageComponent,
		children: [

			{
				path: '',
				component: AdminFaqListPageComponent,
				data: {
					right: Right.FAQLIST
				},
			},
			{
				path: 'add',
				component: AdminFaqPageComponent,
				data: {
					right:  Right.ADDFAQ
				}
			},
			{
				path: 'edit/:id',
				component: AdminFaqPageComponent,
				data: {
					right: Right.EDITFAQ
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		AdminFaqsModule
	],
	declarations: [
		AdminFaqsPageComponent, AdminFaqListPageComponent, AdminFaqPageComponent
	],

    providers: []
})

export class AdminFaqsPageModule { }
