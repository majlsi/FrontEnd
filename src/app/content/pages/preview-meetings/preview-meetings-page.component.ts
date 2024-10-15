import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-preview-meetings-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class PreviewMeetingsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
