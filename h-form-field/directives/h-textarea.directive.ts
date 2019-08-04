import { Directive, ElementRef, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import {HInputTypeEnum, HInputBase} from './input-base.model';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: 'textarea[hTextarea]'
})
export class HTextareaDirective extends HInputBase {

	constructor(el: ElementRef, @Optional() control: NgControl
	) {
		super(HInputTypeEnum.Textarea, el, control);
	}

}
