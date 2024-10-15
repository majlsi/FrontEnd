import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { Committee } from "../../../../core/models/committee";
import { BehaviorSubject } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { ChatService } from "../../../../core/services/chat/chat.service";
import { FilterObject } from "../../../../core/models/filter-object";
import { environment } from "../../../../../environments/environment";
import { EditChatInfoModalComponent } from "../edit-chat-info-modal/edit-chat-info-modal.component";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { PagedResult } from "../../../../core/models/paged-result";
import { ChatGroup } from "../../../../core/models/chat-group";

export interface PeriodicElement {
	id: string;
	name: string;
	members_no: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
	{ id: "1", name: "Hydrogen", members_no: "H" },
	{ id: "2", name: "Helium", members_no: "He" },
];

@Component({
	selector: "m-new-chat-modal",
	templateUrl: "./new-chat-modal.component.html",
	styleUrls: ["./new-chat-modal.component.scss"],
})
export class NewChatModalComponent implements OnInit {
	// dataSource: Array<Committee> = [];
	dataSourceLength: boolean = false;
	committees: Array<Committee> = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// displayedColumns = ["select", "name", "members no."];

	displayedColumns: string[] = ["name"];
	displayedMeetingColumns: string[] = ["name"];
	dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
	selection = new SelectionModel<PeriodicElement>(true, []);
	meetingsList: Array<any> = [];
	committeesList: Array<any> = [];
	usersList: Array<any> = [];
	@Input() isArabic: boolean;
	selectedId: number;
	submitted: boolean = false;
	error: string = "";
	filterObject = new FilterObject();
	chatRoomsFilterObject = new FilterObject();
	selectedMeeting: any;
	selectedCommittee: any;
	selectedUser: any;
	type: string = '';
	imagesBaseURL = environment.imagesBaseURL;
	searchName: string = '';
	showFirstStep: boolean = true;
	showSecondStep: boolean = false;
	showThirdStep: boolean = false;
	chatGroup: ChatGroup =  new ChatGroup();
	meetingTotalRecords: number;
	@ViewChild("scrollDown") private myScrollDown: ElementRef;

	constructor(
		private modalService: NgbModal,
		public activeModal: NgbActiveModal,
		private translate: TranslateService,
		private _chatService: ChatService,
		private _crudService: CrudService
	) {}

	ngOnInit() {
		this.searchName = '';
		this.setChatRoomsFilterObject();
		this.setFilterObject();
		this.getAllChatRooms();
	}

	openChat() {
		if (this.selectedId) {
			this.submitted = true;
			if (this.type == 'committee') {
				this._chatService
					.createCommitteeChat(
						this.selectedCommittee.id,
						this.filterObject
					)
					.subscribe(
						(res) => {
							this.close();
							this.activeModal.close({
								chatGroup: res.chatGroup,
								res: res,
							});
							this.submitted = false;
						},
						(error) => {
							this.submitted = false;
						}
					);
			}
			if (this.type == 'meeting') {
				this._chatService
					.createMeetingChat(
						this.selectedMeeting.id,
						this.filterObject
					)
					.subscribe(
						(res) => {
							this.close();
							this.activeModal.close({
								chatGroup: res.chatGroup,
								res: res,
							});
							this.submitted = false;
						},
						(error) => {
							this.submitted = false;
						}
					);
			}
			if (this.type == 'user') {
				this._chatService
				.createIndividualChat(
					{member_user_id: this.selectedUser.id})
				.subscribe(
					(res) => {
						this.close();
						this.activeModal.close({
							chatGroup: res.chatGroup,
							res: res,
						});
						this.submitted = false;
					},
					(error) => {
						this.submitted = false;
					}
				);
			}
		} else {
			this.error = this.translate.instant("CONVERSATIONS.SELECT_ONE");
		}
	}

	openNewChatInfo() {
		this.showFirstStep = false;
		this.showSecondStep = true;
		this.showThirdStep = false;
	}

	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.dataSource.data.forEach((row) => this.selection.select(row));
	}

	/** The label for the checkbox on the passed row */
	checkboxLabel(row?: PeriodicElement): string {
		if (!row) {
			return `${this.isAllSelected() ? "select" : "deselect"} all`;
		}
		return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
			row.id + 1
		}`;
	}

	radioChange($event, type: string) {
		this.error = "";
		this.selectedId = $event.value;
		if (type == 'meeting') {
			this.selectedMeeting = this.meetingsList.find(
				(item) => item.id == this.selectedId
			);
		}
		if (type == 'committee') {
			this.selectedCommittee = this.committeesList.find(
				(item) => item.id == this.selectedId
			);
		}
		if (type == 'user') {
			this.selectedUser = this.usersList.find(
				(item) => item.id == this.selectedId
			);
		}
		this.type = type;
	}

	close() {
		this.submitted = false;
		this.selectedId = null;
		this.type = '';
		this.searchName = '';
	}

	setChatRoomsFilterObject() {
		this.chatRoomsFilterObject.PageNumber = 1;
		this.chatRoomsFilterObject.SortBy = "id";
		this.chatRoomsFilterObject.SortDirection = "DESC";
		this.chatRoomsFilterObject.SearchObject = {};
		this.chatRoomsFilterObject.PageSize = environment.pageSize;
	}

	setFilterObject() {
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = "id";
		this.filterObject.SortDirection = "DESC";
		this.filterObject.SearchObject = {};
		this.filterObject.PageSize = environment.pageSize;
	}

	getAllChatRooms(isScroll: boolean = false) {
		this._chatService
			.getAllChatRooms(this.chatRoomsFilterObject)
			.subscribe((res) => {
				this.committeesList = res.committeesList;
				this.meetingsList = isScroll? this.meetingsList.concat(res.meetingsList.Results) : res.meetingsList.Results;
				this.usersList = res.usersList;
				this.meetingTotalRecords = res.meetingsList.TotalRecords;
			});
	}

	search() {
		this.chatRoomsFilterObject.PageNumber = 1;
		this.chatRoomsFilterObject.SearchObject.search_name = this.searchName;
		this.getAllChatRooms();
	}

	selectChatUsers(data){
		this.chatGroup = data.chatGroup;
		this.showFirstStep = false;
		this.showSecondStep = false;
		this.showThirdStep = true;
	}

	getCreatedChat(data){
		this.activeModal.close({
			chatGroup: data.chatGroup,
			res: data.res,
		});
	}

	onScrollDown(){
		if (this.meetingsList.length < this.meetingTotalRecords) {
			this.chatRoomsFilterObject.PageNumber++;
			this.getAllChatRooms(true);
		}
	}
}
