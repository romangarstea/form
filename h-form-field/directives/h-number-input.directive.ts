import { Directive, ElementRef, HostBinding, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import {HInputTypeEnum, HInputBase} from './input-base.model';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: 'input[hNumberInput]'
})
export class HNumberInputDirective extends HInputBase {

	@HostBinding('type') inputType = 'number';
	@HostBinding('autocomplete') inputAutocomplete = 'off';

	constructor(el: ElementRef, @Optional() control: NgControl
	) {
		super(HInputTypeEnum.Number, el, control);
	}

}
