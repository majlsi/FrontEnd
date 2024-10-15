import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-participants-page',
    template: '<router-outlet></router-outlet>',
    changeDetection: ChangeDetectionStrategy.Default
})
export class ParticipantsPageComponent implements OnInit {


    constructor() {}
    ngOnInit() {}
}
