import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-permanent-committees-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class  PermanentCommitteesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}