import { Component, OnInit } from '@angular/core';
import { FileService } from '../../../../core/services/files/file.service';

@Component({
  selector: 'm-available-storage',
  templateUrl: './available-storage.component.html',
})
export class AvailableStorageComponent implements OnInit {

  used = {value:0,unit:"Bytes"};
  total = 0;
  percentage = 0;
  constructor(private fileService: FileService) { }

  ngOnInit() {
    this.fileService.quotaObservable().subscribe(res => {
      this.getFileStorage(res);
    });
    this.fileService.reloadStorageQuota();
  }

  getFileStorage(res) {
      if (res) {
        this.used = this.formatBytes(res.used_size);
        const usedGiga = this.formatToGIGABytes(res.used_size);
        if (res.directory_quota) {
          this.total = res.directory_quota;
          this.percentage = Math.round(usedGiga * 100 / this.total);
        } else {
          this.percentage = 0;
        }
      }
  }
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) { return {value:0,unit:"Bytes"}; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    const unit = `${sizes[i]}`;
    const used = {value: value,unit:unit};
    return used;
  }

  formatToGIGABytes(bytes = 0, decimals = 2) {
    if (bytes === 0) { return 0; }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    // const size = Number.parseFloat((bytes / Math.pow(k, 3)).toFixed(dm));
    const size = bytes / Math.pow(k, 3);
    return size;
  }
}
