import { NgModule } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PreviewMomPdfComponent } from './preview-mom-pdf/preview-mom-pdf.component';
import { PartialsModule } from '../../partials/partials.module';
import { MatIconModule} from '@angular/material/icon';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
    imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		MatIconModule,
		MatProgressSpinnerModule,
		FormsModule,
        TranslateModule,
        PdfViewerModule
	],
	declarations: [
        PreviewMomPdfComponent
	],
	exports: [PreviewMomPdfComponent],

    providers: []
})

export class PreviewMomModule { }
