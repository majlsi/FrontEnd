import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-user-titles-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class UserTitlesPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
