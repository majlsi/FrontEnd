import {TranslateService} from '@ngx-translate/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  constructor(private translate: TranslateService) {
    super();

    this.translate.onLangChange.subscribe((e: Event) => {
      this.getAndInitTranslations();
    });

    this.getAndInitTranslations();
  }

  getAndInitTranslations() {
    this.itemsPerPageLabel = this.translate.instant('GENERAL.ITEMSPERPAGE');
    this.firstPageLabel = this.translate.instant('GENERAL.FIRSTPAGELABEL');
    this.lastPageLabel = this.translate.instant('GENERAL.LASTPAGELABEL');
    this.nextPageLabel = this.translate.instant('GENERAL.NEXTPAGELABEL');
    this.previousPageLabel = this.translate.instant('GENERAL.PREVIOUSPAGELABEL');
  }

 getRangeLabel = (page: number, pageSize: number, length: number) =>  {
    if (length === 0 || pageSize === 0) {
        return `0 ${this.translate.instant('GENERAL.RANGELABEL')} ${length}`;
    }
    length = Math.max(length, 0);

    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} ${this.translate.instant('GENERAL.RANGELABEL')} ${length}`;
  }
}
