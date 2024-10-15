import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-guide-video-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class GuideVideosPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
