
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaqSectionsPageComponent } from './faq-sections-page.component';
import { FaqSectionListPageComponent } from './faq-section-list/faq-section-list-page.component';
import { FaqSectionPageComponent } from './faq-section/faq-section-page.component';
import { FaqSectionsModule } from '../../components/faq-sections/faq-sections.module';
import { Right } from './../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: FaqSectionsPageComponent,
		children: [

			{
				path: '',
				component: FaqSectionListPageComponent,
				data: {
					right: Right.FAQSECTIONLIST
				},
			},
			{
				path: 'add',
				component: FaqSectionPageComponent,
				data: {
					right:  Right.ADDFAQSECTION
				}
			},
			{
				path: 'edit/:id',
				component: FaqSectionPageComponent,
				data: {
					right: Right.EDITFAQSECTION
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		FaqSectionsModule
	],
	declarations: [
		FaqSectionsPageComponent, FaqSectionListPageComponent, FaqSectionPageComponent
	],

    providers: []
})

export class FaqSectionsPageModule { }
