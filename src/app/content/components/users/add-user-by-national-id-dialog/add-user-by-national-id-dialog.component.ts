import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
	selector: 'default-add-user-by-national-id-dialog',
	templateUrl: './add-user-by-national-id-dialog.component.html',
})
export class AddUserByNationalIdDialogComponent implements OnInit {
	viewLoading: boolean = false;
	nationalId: string;
	isValid: boolean = false;
	isTouched: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<AddUserByNationalIdDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}

	ngOnInit() {
		this.viewLoading = false;
	}

	onNoClick(): void {
		this.dialogRef.close();
		this.dialogRef.afterOpened().subscribe(() => {
			// this.viewLoading = false;
			document.getElementById('nationalId').focus();
		});
	}

	onYesClick() {
		if (this.nationalId && this.nationalId.length === 10 && !isNaN(Number(this.nationalId))) {
			this.viewLoading = true;
			this.isValid = true;
			this.dialogRef.close(this.nationalId);
		} else {
			this.isValid = false;

		}
	}

	checkValidation($event: Event) {
		this.isTouched = true;
		// const val = ($event.target as any).value;
		this.isValid = this.nationalId && this.nationalId.length === 10 && !isNaN(Number(this.nationalId));
		// this.dialogRef.close(this.nationalId);
	}
}
