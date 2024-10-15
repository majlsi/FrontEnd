import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, map } from 'rxjs/operators';
import { FilterObject } from '../../../../core/models/filter-object';
import { FileService } from '../../../../core/services/files/file.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-search-bar',
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent implements OnInit {

  activeTab = 'top';
  isArabic: boolean;
  canAdd = false;
  @Input() path: any;
  id: any;
  emptyFiles = null;
  emptyDirectories = null;
  emptyRecent = true;
  term;
  requestSubject = new BehaviorSubject<any>(null);
  searching: boolean;
  searchFailed: boolean;
  constructor(
    private router: Router, private fileService: FileService, private translationService: TranslationService) { }


  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
  }
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term => {
        const filterObject = new FilterObject();
        filterObject.PageNumber = 1;
        filterObject.SearchObject = {};
        filterObject.PageSize = 10;
        filterObject.SearchObject.term = term;
        return this.fileService.searchGlobal(filterObject).pipe(map(res => res.Results),
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }));
      }


      ),
      tap(() => this.searching = false)
    )
  formatter = (result) => {
    return result.name ? result.name : '';
  }
  select($event) {
    const item = $event.item;
    if (item.is_file) {
      this.downloadFile(item);
    } else {
      this.router.navigate(['/files/' + this.path + '/' + item.id]);
    }
  }

  downloadFile(file) {
    this.fileService.downloadFile(file.id).subscribe(res => {
      const binaryData = [];
      binaryData.push(res);
      const downloadURL = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/octet-stream' }));
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = file.name + '.' + file.ext;
      link.click();
    });
  }
}
