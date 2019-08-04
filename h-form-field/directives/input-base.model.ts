import { ElementRef, HostListener, Input, Optional } from '@angular/core';
import {NgControl} from '@angular/forms';

export enum HInputTypeEnum {
	Text = 'Text',
	Amount = 'Amount',
	Number = 'Number',
	Textarea = 'Textarea',
	Generic = 'Generic'
}

export class HInputBase {
	public focus = false;
	public native: any;
	public text = false;
	@Input() public minlength: number;
	@Input() public maxlength: number;
	@Input() public min: number;
	@Input() public max: number;

	@HostListener('focus') onFocus() {
		this.focus = true;
	}

	@HostListener('blur') onBlur() {
		this.focus = false;
	}

	@HostListener('keyup') onKey() {
		this.text = this.el.nativeElement.value !== '';
	}

	constructor(
		public type: HInputTypeEnum,
		public el: ElementRef,
		@Optional() public ngControl: NgControl
	) {
		this.native = el.nativeElement;
	}
}
