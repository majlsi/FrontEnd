import { Injectable } from '@angular/core';
import { ActionNotificationComponent } from '../../content/partials/content/general/action-natification/action-notification.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ActionEntityDialogComponent } from '../../content/partials/content/general/modals/action-entity-dialog/action-entity-dialog.component';

import { AddCommitteeMemberDialogComponent } from '../../content/partials/content/general/modals/add-committee-member-dialog/add-committee-member-dialog.component';

export enum MessageType {
	Create,
	Read,
	Update,
	Delete
}

@Injectable({providedIn:'root'})
export class LayoutUtilsService {
	constructor(private snackBar: MatSnackBar,
		private dialog: MatDialog) { }

	// SnackBar for notifications
	showActionNotification(
		message: string,
		type: MessageType = MessageType.Create,
		duration: number = 10000,
		showCloseButton: boolean = true,
		showUndoButton: boolean = false,
		undoButtonDuration: number = 3000,
		verticalPosition: 'top' | 'bottom' = 'top',
		isError: boolean = false
	) {
		return this.snackBar.openFromComponent(ActionNotificationComponent, {
			duration: duration,
			data: {
				message,
				snackBar: this.snackBar,
				showCloseButton: showCloseButton,
				showUndoButton: showUndoButton,
				undoButtonDuration,
				verticalPosition,
				type,
				action: 'Undo',
				isError
			},
			verticalPosition: verticalPosition
		});
	}

	// Method returns instance of MatDialog
	deleteElement(title: string = '', description: string = '', waitDesciption: string = '', buttonText: string) {
		return this.dialog.open(ActionEntityDialogComponent, {
			data: { title, description, waitDesciption, buttonText },
			width: '440px'
		});
	}

	// Method returns instance of Add Committee Member MatDialog
	addCommitteeMemberElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(AddCommitteeMemberDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	activateElement(title: string = '', description: string = '', waitDesciption: string = '', buttonText: string) {
		return this.dialog.open(ActionEntityDialogComponent, {
			data: { title, description, waitDesciption , buttonText},
			width: '440px'
		});
	}

	meeingActions(title: string = '', description: string = '', waitDesciption: string = '',
		buttonText: string, cancelButtonText: string = null
	) {
		return this.dialog.open(ActionEntityDialogComponent, {
			data: { title, description, waitDesciption, buttonText, cancelButtonText },
			width: '440px'
		});
	}

	notification(title: string = '', description: string = '', waitDesciption: string = '', buttonText: string,
	showCancelButton: boolean = true, noLoading: boolean = false ) {
		return this.dialog.open(ActionEntityDialogComponent, {
			data: { title, description, waitDesciption , buttonText, showCancelButton, noLoading},
			width: '440px'
		});
	}

	logOut() {
		this.dialog.closeAll();
	}


}
