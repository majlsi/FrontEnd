import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'm-faqs-page',
  templateUrl: './faqs-page.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class FaqsPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
