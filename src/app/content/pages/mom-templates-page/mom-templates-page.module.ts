import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MomTemplatesPageComponent } from './mom-templates-page.component';
import { MomTemplateListPageComponent } from './mom-template-list-page/mom-template-list-page.component';
import { Routes, RouterModule } from '@angular/router';
import { Right } from '../../../core/models/enums/rights';
import { MomTemplatePageComponent } from './mom-template-page/mom-template-page.component';
import { MomTemplatesModule } from '../../components/mom-templates/mom-templates.module';

const routes: Routes = [
	{
		path: '',
		component: MomTemplatesPageComponent,
		children: [

			{
				path: '',
				component: MomTemplateListPageComponent,
				data: {
					right: Right.MOMTEMPLATELIST
				},
			},
			{
				path: 'add',
				component: MomTemplatePageComponent,
				data: {
					right:  Right.MOMTEMPLATEADD
				}
			},
			{
				path: 'edit/:id',
				component: MomTemplatePageComponent,
				data: {
					right: Right.MOMTEMPLATEEDIT
				}
			},

		]
	}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MomTemplatesModule
  ],
  declarations: [MomTemplatesPageComponent, MomTemplateListPageComponent, MomTemplatePageComponent]
})
export class MomTemplatesPageModule { }
