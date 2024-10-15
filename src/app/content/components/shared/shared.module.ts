import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { dropzone } from '../../../core/config/dropzone';
import { SharedAddModalComponent } from './shared-add-modal/shared-add-modal.component';
import { SharedAddSectionComponent } from './shared-add-section/shared-add-section.component';
import { SharedSelectModalComponent } from './shared-select-modal/shared-select-modal.component';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '../../../core/services/files/file.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedLoadingComponent } from './shared-loading/shared-loading.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedTwoColumnTableComponent } from './shared-two-column-table/shared-two-column-table.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DropzoneModule,
    NgbModule,
    NgbModalModule,
    TranslateModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule
  ],
  declarations: [SharedAddModalComponent, SharedAddSectionComponent, SharedSelectModalComponent, SharedLoadingComponent, SharedTwoColumnTableComponent],
  exports: [
    SharedAddModalComponent,
    SharedAddSectionComponent,
    SharedSelectModalComponent,
    SharedLoadingComponent,
	SharedTwoColumnTableComponent
  ],
  providers: [
		{
			provide: DROPZONE_CONFIG,
			useValue: dropzone
		},
    FileService
	],
})
export class SharedModule { }
