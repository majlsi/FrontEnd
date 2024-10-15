import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-nicknames-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class NicknamesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
