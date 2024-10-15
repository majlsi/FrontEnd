import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";

@Component({
	selector: "m-chats-page",
	template: "<router-outlet></router-outlet>",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ChatsPageComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
