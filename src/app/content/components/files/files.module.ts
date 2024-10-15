import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyFilesComponent } from './my-files/my-files.component';
import { NgbModalModule, NgbModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilesListComponent } from './files-list/files-list.component';
import { FoldersListComponent } from './folders-list/folders-list.component';
import { FolderDetailsComponent } from './folder-details/folder-details.component';
import { AvailableStorageComponent } from './available-storage/available-storage.component';
import { RouterModule } from '@angular/router';
import { NewFolderModalComponent } from './new-folder-modal/new-folder-modal.component';
import { CoreModule } from '../../../core/core.module';
import { ShareModalComponent } from './share-modal/share-modal.component';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from '../../../core/services/files/file.service';
import { DirectoryService } from '../../../core/services/files/directory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RenameModalComponent } from './rename-modal/rename-modal.component';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { JoyrideModule } from 'ngx-joyride';
import { DeleteFileRequestComponent } from './delete-file-request/delete-file-request.component';



@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    MatProgressSpinnerModule,
    RouterModule,
    NgbModalModule,
    CoreModule,
    MatRadioModule,
    SharedModule,
    NgSelectModule,
    NgOptionHighlightModule,
    MatCheckboxModule,
    TranslateModule,
    NgbTypeaheadModule,
    InfiniteScrollModule,
    JoyrideModule
  ],
  declarations: [
    MyFilesComponent,
    FilesListComponent,
    FoldersListComponent,
    FolderDetailsComponent,
    AvailableStorageComponent,
    NewFolderModalComponent,
    ShareModalComponent,
    RenameModalComponent,
    SearchBarComponent,
    DeleteFileRequestComponent
  ],
  exports: [
    MyFilesComponent,
    FilesListComponent,
    FoldersListComponent,
    FolderDetailsComponent,
    AvailableStorageComponent,
    NewFolderModalComponent,
    SearchBarComponent
  ],
  providers: [
    FileService, DirectoryService
  ],
})
export class FilesModule { }
