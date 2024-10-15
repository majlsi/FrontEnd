import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatsPageComponent } from "./chats-page.component";
import { ChatListPageComponent } from "./chat-list/chat-list-page.component";
import { RouterModule, Routes } from "@angular/router";
import { Right } from "./../../../core/models/enums/rights";
import { PartialsModule } from "../../partials/partials.module";
import { TranslateModule } from "@ngx-translate/core";
import { ChatsModule } from "../../components/chats/chats.module";
import { MeetingChatListPageComponent } from "./meeting-chat-list/meeting-chat-list-page.component";

const routes: Routes = [
	{
		path: "",
		component: ChatsPageComponent,
		children: [
			{
				path: "chats",
				component: ChatListPageComponent,
				data: {
					right: Right.CHAT_CONVERSATIONS
				},
			}
			//,{
			// 	path: "meetings",
			// 	component: MeetingChatListPageComponent,
			// 	data: {
			// 	},
			// },
		],
	},
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		PartialsModule,
		TranslateModule,
		ChatsModule,
	],
	declarations: [ChatsPageComponent, ChatListPageComponent, MeetingChatListPageComponent],
})
export class ChatsPageModule {}
