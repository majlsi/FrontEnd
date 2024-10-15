import {
	Directive,
	HostListener,
    Input,
    ElementRef
} from '@angular/core';
import { NgForm } from '@angular/forms';
import * as $ from 'jquery';

@Directive({
	selector: '[mScrollInvalid]'
})
export class ScrollFirstInvalidDirective {
    @Input() form: NgForm;
    @Input() haveHeader: NgForm;


	constructor(private el: ElementRef) {}

    @HostListener('submit', ['$event'])
    onSubmit(event) {
        if (!this.form.valid) {
            event.preventDefault();
            if (!this.haveHeader) {
                const formGroupInvalid = this.el.nativeElement.querySelectorAll('.ng-invalid');
                (<HTMLInputElement>formGroupInvalid[0]).scrollIntoView({ behavior: 'smooth' });
            } else {
                const formGroupInvalid = $('input.ng-invalid, ng-select.ng-invalid').first();

                if(formGroupInvalid.length > 0) {
                    const top = formGroupInvalid.offset().top;
    
                    window.scroll({top: top - 125, behavior: 'smooth'});
                }
            }
        }
    }
}

