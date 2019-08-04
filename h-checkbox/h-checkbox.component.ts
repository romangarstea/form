/**
 *
 * HTML checked | JavaScript checkboxObject.checked = true|false
 * tabindex="0"
 * autocomplete="off"
 * css:indeterminate | JavaScript checkboxObject.indeterminate = true|false
 *
 *
 */


import {
	AfterContentInit,
	Component,
	ElementRef, EventEmitter,
	forwardRef,
	Input,
	OnInit, Output,
	ViewChild
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-checkbox',
	templateUrl: './h-checkbox.component.html',
	styleUrls: ['./h-checkbox.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => HCheckbox),
			multi: true
		}
	]
})
// tslint:disable-next-line:component-class-suffix
export class HCheckbox implements AfterContentInit, OnInit, ControlValueAccessor {

	@Input() tabindex = 0;
	@Input() disabled = false;

	@Input()
	set checked(value: boolean) {
		this.checkboxRef.nativeElement.checked = value;
	}
	get checked () {
		return this.checkboxRef.nativeElement.checked;
	}
	@Input()
	set indeterminate(value: boolean) {
		this.checkboxRef.nativeElement.indeterminate = value;
	}
	get indeterminate () {
		return this.checkboxRef.nativeElement.indeterminate;
	}

	@Output() checkboxChange: EventEmitter<boolean> = new EventEmitter();

	@ViewChild('checkbox') checkboxRef: ElementRef;
	@ViewChild('label') labelRef: ElementRef;

	private propagateChange = (_: any) => {};

	ngOnInit() {
	}

	constructor	() {
	}

	ngAfterContentInit () {
		// Delete label padding if no label
		if (this.labelRef.nativeElement.childNodes.length === 0) {
			this.labelRef.nativeElement.hidden = true;
		}
	}

	valueChange() {
		const value = this.checkboxRef.nativeElement.checked;
		this.propagateChange(value);
		this.checkboxChange.emit(value);
	}

	//// IMPLEMENT INTERFACE ControlValueAccessor
	///////////////////////////////////////////////

	// FormModel -> HTML
	writeValue(value: any) {
		if (value !== undefined && typeof value === 'boolean') {
			this.checked = value;
		}
	}
	// HTML -> FormModel
	registerOnChange(fn) {
		this.propagateChange = fn;
	}
	registerOnTouched() {}
}
