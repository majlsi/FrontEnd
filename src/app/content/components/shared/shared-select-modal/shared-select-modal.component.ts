import { Component, OnInit , ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FilterObject } from '../../../../core/models/filter-object';
import { FileService } from '../../../../core/services/files/file.service';

@Component({
  selector: 'm-shared-select-modal',
  templateUrl: './shared-select-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SharedSelectModalComponent implements OnInit {

  selectedFiles = [];
  filterObject = new FilterObject();
  request: { term: string; isScroll: boolean; } = {term: '', isScroll: true};

  termObs = new BehaviorSubject<any>({term: '', scroll: false});
  term = '';
  emptyResult = false;
  requesting: boolean;

  constructor(public activeModal: NgbActiveModal, private fileService: FileService) {
    this.filterObject.PageNumber = 1;
    this.filterObject.SearchObject = {};
    this.filterObject.PageSize = 10;
   }

  ngOnInit() {
    this.termObs.pipe(switchMap(request => {
      this.filterObject.SearchObject.term = request.term;
      if (request.isScroll) {
        this.filterObject.PageNumber++;
      } else {
        this.filterObject.PageNumber = 1;
      }
      this.requesting = true;
      this.emptyResult = false;
      return this.fileService.searchFiles(this.filterObject);
    }), catchError(_err => of({Results: [], TotalRecords: 0}))
    ).subscribe(res => {
      if (!this.request.isScroll) {
        this.selectedFiles = this.selectedFiles.filter(a => a.isChecked == true);
      }
      this.selectedFiles = [...this.selectedFiles , ...res.Results];
      this.selectedFiles =  this.selectedFiles.filter((el, i ) => i == this.selectedFiles.findIndex(a => a.id == el.id));
      this.requesting =  false;
      if (res.TotalRecords == 0) {
        this.emptyResult = true;
      } else {
        this.emptyResult = false;
      }
    }, err => {
      this.requesting =  false;
    });
  }

  applyFilter(term = '') {
    this.request = {term: term, isScroll: false};
    this.termObs.next({term: term, isScroll: false});
  }
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = `${(bytes / Math.pow(k, i)).toFixed(dm)}${sizes[i]}`;
    return size;
  }
  selectFiles() {
    const result = this.selectedFiles.filter(a => a.isChecked == true);
    this.activeModal.close(result);
  }
  onScrollDown() {
    this.request = {term: this.term, isScroll: true};
    this.termObs.next({term: this.term, isScroll: true});
  }
}
