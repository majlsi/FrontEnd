import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HtmlMomTemplatesPageComponent } from './html-mom-templates-page.component';
import { HtmlMomTemplateListPageComponent } from './html-mom-template-list/html-mom-template-list-page.component';
import { Routes, RouterModule } from '@angular/router';
import { Right } from '../../../core/models/enums/rights';
import { HtmlMomTemplatePageComponent } from './html-mom-template/html-mom-template-page.component';
import { HtmlMomTemplatesModule } from '../../components/html-mom-templates/html-mom-templates.module';

const routes: Routes = [
	{
		path: '',
		component: HtmlMomTemplatesPageComponent,
		children: [

			{
				path: '',
				component: HtmlMomTemplateListPageComponent,
				data: {
					right: Right.HTMLMOMTEMPLATELIST
				},
			},
			{
				path: 'add',
				component: HtmlMomTemplatePageComponent,
				data: {
					right:  Right.HTMLMOMTEMPLATEADD
				}
			},
			{
				path: 'edit/:id',
				component: HtmlMomTemplatePageComponent,
				data: {
					right: Right.HTMLMOMTEMPLATEEDIT
				}
			},

		]
	}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HtmlMomTemplatesModule
  ],
  declarations: [HtmlMomTemplatesPageComponent, HtmlMomTemplateListPageComponent, HtmlMomTemplatePageComponent]
})
export class HtmlMomTemplatesPageModule { }
