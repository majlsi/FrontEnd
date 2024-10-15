import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Committee } from "../../../../core/models/committee";
import { BehaviorSubject } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { FilterObject } from "../../../../core/models/filter-object";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ChatService } from "../../../../core/services/chat/chat.service";
import { environment } from "../../../../../environments/environment";
import { ChatGroup } from "../../../../core/models/chat-group";
import { PagedResult } from "../../../../core/models/paged-result";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { User } from "../../../../core/models/user";

@Component({
	selector: "m-group-chat-members-modal",
	templateUrl: "./group-chat-members-modal.component.html",
	styleUrls: ["./group-chat-members-modal.component.scss"],
})
export class GroupChatMembersModalComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	displayedColumns: string[] = ["name"];
	selection = new SelectionModel<any>(true, []);
	usersList: Array<any> = [];
	@Input() isArabic: boolean;
	@Input() chatGroup: ChatGroup;
	@Input() chatGroupId: number;
	@Input() currentUser: User;
	@Input() organizationLogoUrl: string = '';
	submitted: boolean = false;
	edit: boolean = false;
	error: string = "";
	filterObject = new FilterObject();
	usersFilterObject = new FilterObject();
	imagesBaseURL = environment.imagesBaseURL;
	searchName: string = '';
	atLeastTwoSelected:  boolean = false;
	errors: Array<any> = [];
	@Output() getCreatedChat  = new EventEmitter();
	TotalRecords: number;

	constructor(
		private modalService: NgbModal,
		public activeModal: NgbActiveModal,
		private translate: TranslateService,
		private _chatService: ChatService,
		private _crudService: CrudService
	) {}

	ngOnInit() {
		//this.atLeastTwoSelected = this.chatGroup.member_users.length > 2? true : false;
		let index = this.chatGroup.member_users.findIndex(member => member.id == this.currentUser.id);
		if(index > -1) {
			let users = this.chatGroup.member_users.splice(index,1);
			this.currentUser = users[0];
		}
		this.setUsersFilterObject();
		this.setFilterObject();
		this.getOrganizationUsers();
	}

	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.usersList.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		this.isAllSelected()
			? this.selection.clear()
			: this.usersList.forEach((row) => this.selection.select(row));
	}

	/** The label for the checkbox on the passed row */
	checkboxLabel(row?: any): string {
		if (!row) {
			return `${this.isAllSelected() ? "select" : "deselect"} all`;
		}
		return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
			row.id + 1
		}`;
	}

	selectUser(user) {
		this.error = "";
		if (user.is_selected) {
			this.chatGroup.member_users.push(user);
            //this.atLeastTwoSelected = this.chatGroup.member_users.length >= 2? true : this.atLeastTwoSelected;
		} else {
			const key = this.chatGroup.member_users.indexOf(user);
			this.chatGroup.member_users.splice(key, 1);
			if (this.chatGroup.member_users.length < 2) {
				//this.atLeastTwoSelected = false;
			}
            }
	}

	close() {
		this.submitted = false;
		this.atLeastTwoSelected = false;
	}

	setFilterObject() {
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = "id";
		this.filterObject.SortDirection = "DESC";
		this.filterObject.SearchObject = {};
		this.filterObject.PageSize = environment.pageSize;
	}

	setUsersFilterObject() {
		this.usersFilterObject.PageNumber = 1;
		this.usersFilterObject.SortBy = "id";
		this.usersFilterObject.SortDirection = "DESC";
		this.usersFilterObject.SearchObject = {};
		this.usersFilterObject.PageSize = environment.pageSize;
	}

	getOrganizationUsers(isScroll: boolean = false){
		this._crudService.getPaginatedList<PagedResult>('admin/organization-users',this.usersFilterObject).subscribe(res => {
			this.usersList = isScroll? this.usersList.concat(res.Results) : res.Results;
			this.TotalRecords = +res.TotalRecords;
			this.chatGroup.member_users.forEach((member,pos) => {
				let index = this.usersList.findIndex(user => user.id == member.id);
				if(index > -1){
					this.usersList[index].is_selected = true;
				} else{
					member.is_selected = true;
					this.usersList.unshift(member);
				}
			});
		});
	}

	search() {
		this.usersFilterObject.PageNumber = 1;
		this.usersFilterObject.SearchObject.search_name = this.searchName;
		this.getOrganizationUsers();
	}

	openChat(searchForm){
		this.edit = true;
		this.errors = [];
		if (searchForm.valid) {
			this.submitted = true;
			if(!this.chatGroupId) { // add chat group
				this._crudService.add<any>('admin/chat-groups',this.chatGroup).subscribe(res => {
					this.close();
					this.getCreatedChat.emit({
						chatGroup: res.chatGroup,
						res: res,
					});
					this.submitted = false;
				}, error => {
					this.errors = error.error;
					this.submitted = false;
				});
			} else { //add new users to chat group
				let memberList = this.chatGroup.member_users;
				memberList.push(this.currentUser);
				this._crudService.edit('admin/chat-groups',{member_users: memberList,chat_group_name_ar: this.chatGroup.chat_group_name_ar,chat_group_name_en: this.chatGroup.chat_group_name_en },this.chatGroupId).subscribe(res => {
					this.close();
					this.activeModal.close({
						memberUsers: memberList,
						res: res,
					});
					this.submitted = false;
				}, error => {
					this.errors = [[error]];
					this.submitted = false;
				});
			}
			
		}
	}

	onScrollDown(){
		if (this.usersList.length < this.TotalRecords) {
			this.usersFilterObject.PageNumber++;
			this.getOrganizationUsers(true);
		}
	}

	getMemberUserImage(user){
		if(user.image) {
			return this.imagesBaseURL + user.image.image_url;
		} else {
			return this.imagesBaseURL + this.organizationLogoUrl;
		}
	}
}
