import { AfterContentInit, Component, ContentChild, HostBinding, Input, OnInit } from '@angular/core';
import { HInputBase, HInputTypeEnum } from './directives/input-base.model';
import { HTextInputDirective } from './directives/h-text-input.directive';
import { HTextareaDirective } from './directives/h-textarea.directive';
import { HAmountInputDirective } from './directives/h-amount-input.directive';
import { HNumberInputDirective } from './directives/h-number-input.directive';
import { HPasswordInputDirective } from './directives/h-password-input.directive';
import {HGenericDirective} from './directives/h-generic.directive';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-form-field',
	templateUrl: './h-form-field.component.html',
	styleUrls: ['./h-form-field.component.scss'],
	// encapsulation: ViewEncapsulation.None
})
export class HFormFieldComponent implements OnInit, AfterContentInit {

	// Common Variables
	public count = 0;
	public showCounter: boolean;
	public minLength: number;
	public maxLength: number;
	public min: number;
	public max: number;
	public formField: HInputBase;

	// Counter Variables
	private interval = 100;
	private timeout = 200;
	private isMousedown: boolean;

	// If true counter will be shown, if other conditions will be fulfilled
	@Input() showLengthCounter: boolean;
	@Input() numberOfCharacter: number;
	@Input()
	set disabled(value: boolean) {
		this._disabled = value;
		this.formField.el.nativeElement.disabled = value;
	}
	get disabled() {
		return this._disabled;
	}
	private _disabled: boolean;

	@Input() width: string;

	@HostBinding('class.h-text-input') isTextInput = false;
	@HostBinding('class.h-amount-input') isAmountInput = false;
	@HostBinding('class.h-number-input') isNumberInput = false;
	@HostBinding('class.h-textarea') isTextarea = false;
	@HostBinding('class.h-generic') isGeneric = false;
	@HostBinding('class.disabled') get isDisabled() {
		return this.disabled;
	}
	@HostBinding('class.error') get hasError(): boolean {
		if (this.formField && this.formField.ngControl) {
			const control = this.formField.ngControl;
			// return control.invalid && (control.dirty || control.touched);
			return control.invalid && control.touched;
		}
		return false;
	}

	@HostBinding('class.focus') get focus() {
		return this.formField && this.formField.focus;
	}

	@HostBinding('class.text') get isText() {
		return this.formField && this.formField.text;
	}

	@HostBinding('style.width') get widthHost() {
		if (this.isNumberInput && this.max && !this.width && !this.numberOfCharacter) {
			const maxCharacter = this.max.toString(10).length;
			const widthInput = ((maxCharacter + 1) * 8); // 8px/character
			return 62 + widthInput + 'px';
		}
		if (this.isNumberInput && !this.max) {
			return 'auto';
		}
		if (this.width) {
			return this.width;
		}
		if (this.numberOfCharacter) {
			const widthInput = ((this.numberOfCharacter + 1) * 8); // 8px/character
			return 62 + widthInput + 'px';
		}
		return undefined;
	}

	@ContentChild(HTextInputDirective) set textInput(input: HInputBase) {
		this.setInput(input);
	}

	@ContentChild(HPasswordInputDirective) set passwordInput(input: HInputBase) {
		this.setInput(input);
	}

	@ContentChild(HTextareaDirective) set textarea(input: HInputBase) {
		this.setInput(input);
	}

	@ContentChild(HAmountInputDirective) set amountInput(input: HInputBase) {
		this.setInput(input);
	}

	@ContentChild(HNumberInputDirective) set numberInput(input: HInputBase) {
		this.setInput(input);
	}

	@ContentChild(HGenericDirective) set generic(input: HInputBase) {
		this.setInput(input);
	}

	private setInput(input: HInputBase) {
		if (input) {
			this.formField = input;
		}
	}

	constructor() {
	}

	ngOnInit() {
	}

	ngAfterContentInit() {
		if (!this.formField) {
			return;
		}

		switch (this.formField.type) {
			case HInputTypeEnum.Textarea: {
				this.isTextarea = true;
				if (this.formField.ngControl.value) {
					this.count = this.formField.ngControl.value.length;
				}
				break;
			}
			case HInputTypeEnum.Text: {
				this.isTextInput = true;
				if (this.formField.ngControl.value) {
					this.count = this.formField.ngControl.value.length;
				}
				break;
			}
			case HInputTypeEnum.Amount: {
				this.isAmountInput = true;
				break;
			}
			case HInputTypeEnum.Number: {
				this.isNumberInput = true;
				break;
			}
			case HInputTypeEnum.Generic: {
				this.isGeneric = true;
				break;
			}
		}

		this.minLength = this.formField.minlength;
		this.maxLength = this.formField.maxlength;
		this.min = this.formField.min;
		this.max = this.formField.max;

		if (this.maxLength && this.showLengthCounter) {
			this.showCounter = true;
			this.formField.ngControl.valueChanges.subscribe((value: string) => this.count = value ? value.length : 0);
		}
	}

	get counterValue() {
		if (!this.formField.ngControl.value) {
			return this.min ? this.min : 0;
		}
		return this.formField.ngControl.value;
	}

	set counterValue(val) {
		this.formField.ngControl.control.setValue(val);
	}


	//// INPUT NUMBER
	////////////////////////////////////////////

	// Increment Button
	mousedownIncrement() {
		this.isMousedown = true;
		if (this.counterValue + 1 <= this.max) {
			this.counterValue++;
		}

		setTimeout(() => {
			const timerId = setInterval(() => {
				if (this.isMousedown) {
					if (this.counterValue + 1 <= this.max) {
						this.counterValue++;
					}
				} else {
					clearInterval(timerId);
				}
			}, this.interval);
		}, this.timeout);
	}

	mouseupIncrement() {
		this.isMousedown = false;
	}

	// Decrement Button
	mousedownDecrement() {
		this.isMousedown = true;
		if (this.counterValue - 1 >= this.min) {
			this.counterValue--;
		}

		setTimeout(() => {
			const timerId = setInterval(() => {
				if (this.isMousedown) {
					if (this.counterValue - 1 >= this.min) {
						this.counterValue--;
					}
				} else {
					clearInterval(timerId);
				}
			}, this.interval);
		}, this.timeout);
	}

	mouseupDecrement() {
		this.isMousedown = false;
	}
}
