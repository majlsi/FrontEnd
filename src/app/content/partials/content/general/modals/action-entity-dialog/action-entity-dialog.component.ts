import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-delete-entity-dialog',
	templateUrl: './action-entity-dialog.component.html'
})
export class ActionEntityDialogComponent implements OnInit {
	viewLoading: boolean = false;

	constructor(
		private _translate: TranslateService,
		public dialogRef: MatDialogRef<ActionEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
		if (!this.data.cancelButtonText) {
			this.data.cancelButtonText = this._translate.instant('BUTTON.CANCEL');
		}
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onYesClick(): void {
		/* Server loading imitation. Remove this */
		this.viewLoading = this.data.noLoading? false : true;
		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, this.data.noLoading? 10 : 2500);
	}
}
