import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-preview-room-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class PreviewRoomPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
