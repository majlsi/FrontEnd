import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SignatureModalComponent } from './signature-modal/signature-modal.component';
import { CommentModalComponent } from './comment-modal/comment-modal.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VerificationMethodModalComponent } from './verification-method-modal/verification-method-modal.component';
import { MatRadioModule } from '@angular/material/radio';
import { VerificationModalComponent } from './verification-modal/verification-modal.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    TranslateModule,
	MatRadioModule

  ],
  declarations: [SignatureModalComponent, CommentModalComponent, VerificationMethodModalComponent, VerificationModalComponent],
  exports: [SignatureModalComponent, CommentModalComponent
  ]
})
export class MeetingMinutesModule { }
