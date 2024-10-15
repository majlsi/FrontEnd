import { Component, OnInit } from '@angular/core';
import { FileService } from '../../../../core/services/files/file.service';

@Component({
  selector: 'm-shared-loading',
  templateUrl: './shared-loading.component.html',
})
export class SharedLoadingComponent implements OnInit {
  loading = false;
  constructor(private fileService: FileService) { }

  ngOnInit() {
    this.fileService.loaderObservable().subscribe(res => {
      this.loading = res;
    });
  }
  dismiss() {
    this.fileService.hideLoader();
  }

}
