import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";

@Component({
	selector: "m-reviews-room-page",
	template: "<router-outlet></router-outlet>",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ApprovalsPageComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
