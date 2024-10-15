import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatListComponent } from "./chat-list/chat-list.component";
import { RouterModule } from "@angular/router";
import { PartialsModule } from "../../partials/partials.module";
import { TranslateModule } from "@ngx-translate/core";
import { CollapsibleChatWidgetComponent } from "./collapsible-chat-widget/collapsible-chat-widget.component";
import { NgbCollapseModule, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FixedChatRouterButtonComponent } from "./fixed-chat-router-button/fixed-chat-router-button.component";
import { NewChatModalComponent } from "./new-chat-modal/new-chat-modal.component";
import { CommitteesModule } from "../committees/committees.module";
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { FormsModule } from "@angular/forms";
import { MeetingChatListComponent } from "./meeting-chat-list/meeting-chat-list.component";
import { EditChatInfoModalComponent } from "./edit-chat-info-modal/edit-chat-info-modal.component";
import { GroupChatMembersModalComponent } from "./group-chat-members-modal/group-chat-members-modal.component";
import { JoyrideModule } from "ngx-joyride";

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		TranslateModule,
		NgbCollapseModule,
		NgbModule,
		CommitteesModule,
		MatTableModule,
		MatCardModule,
		MatCheckboxModule,
		FormsModule,
		InfiniteScrollModule,
		MatRadioModule,
		JoyrideModule
	],
	declarations: [
		ChatListComponent,
		CollapsibleChatWidgetComponent,
		FixedChatRouterButtonComponent,
		NewChatModalComponent,
		MeetingChatListComponent,
		EditChatInfoModalComponent,
		GroupChatMembersModalComponent,
	],
	exports: [
		ChatListComponent,
		CollapsibleChatWidgetComponent,
		FixedChatRouterButtonComponent,
		MeetingChatListComponent,
	]
})
export class ChatsModule {}
