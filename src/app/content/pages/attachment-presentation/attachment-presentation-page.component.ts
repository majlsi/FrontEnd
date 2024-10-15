import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'm-attachment-presentation-page',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class AttachmentPresentationPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
