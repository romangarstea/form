import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	forwardRef,
	HostBinding,
	HostListener,
	Input,
	OnInit,
	Output, Renderer2,
	ViewChild
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-toggleswitch',
	templateUrl: './h-toggleswitch.component.html',
	styleUrls: ['./h-toggleswitch.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => HToggleswitch),
			multi: true
		}
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:component-class-suffix
export class HToggleswitch implements OnInit, ControlValueAccessor {

	@Input() tabindex = 0;
	@Input()
	set disabled(value: boolean) {
		this._disabled = value;
		if (value) {
			this.tabindex = -1;
		}
	}
	get disabled () {
		return this._disabled;
	}
	private _disabled = false;
	@Input()
	set checked(value: boolean) {
		this._checked = value;
	}
	get checked () {
		return this._checked;
	}
	private _checked: boolean;

	@Output() toggleChange: EventEmitter<boolean> = new EventEmitter();

	/////////////////////////////////////////////
	@HostBinding('class.checked') get isChecked() {
		return this.checked;
	}
	@HostBinding('class.disabled') get isDisabled() {
		return this.disabled;
	}
	@HostListener('click') onClick() {
		this.checked = !this.checked;
		this.propagateChange(this.checked);
		this.toggleChange.emit(this.checked);
	}
	@HostListener('keydown', ['$event']) onKeyDown(e) {
		if (e.which === 32) {
			// No scroll page
			e.preventDefault();
			this.toggle();
		}
	}
	private propagateChange = (_: any) => {};

	/////////////////////////////////////////////
	constructor() {
	}

	ngOnInit() {
		if (this.disabled) {
			this.tabindex = -1;
		}
	}

	///////////////////////////////////////////////

	public toggle() {
		this.checked = !this.checked;
		this.propagateChange(this.checked);
		this.toggleChange.emit(this.checked);
	}

	public off() {
		this.checked = false;
		this.propagateChange(this.checked);
		this.toggleChange.emit(this.checked);
	}

	public on() {
		this.checked = true;
		this.propagateChange(this.checked);
		this.toggleChange.emit(this.checked);
	}

	public getChecked() {
		return this.checked;
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
