import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-temporary-committees-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class TemporaryCommitteesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}