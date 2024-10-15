import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyFilesPageComponent } from './my-files/my-files-page.component';
import { RouterModule, Routes } from '@angular/router';
import { FilesPageComponent } from './files-page.component';
import { Right } from '../../../core/models/right';
import { FilesModule } from '../../components/files/files.module';
import { FolderDetailsPageComponent } from './folder-details/folder-details-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../components/shared/shared.module';

const routes: Routes = [
	{
		path: '',
		component: FilesPageComponent,
		children: [
			{
				path: ':path',
				component: MyFilesPageComponent,
				data: {

				}
			},
			// {
			// 	path: 'shared-files',
			// 	component: SharedFilesPageComponent,
			// 	data: {

			// 	}
			// },
			// {
			// 	path: 'recent-files',
			// 	component: RecentFilesPageComponent,
			// 	data: {

			// 	}
			// },
			{
				path: ':path/:id',
				component: FolderDetailsPageComponent,
				data: {
				}
			}

		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		FilesModule,
		TranslateModule,
		SharedModule
	],
	declarations: [MyFilesPageComponent, FilesPageComponent, FolderDetailsPageComponent]
})
export class FilesPageModule { }
