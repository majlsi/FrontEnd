import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'm-files-page',
  templateUrl: './files-page.component.html',
  changeDetection: ChangeDetectionStrategy.Default

})
export class FilesPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
