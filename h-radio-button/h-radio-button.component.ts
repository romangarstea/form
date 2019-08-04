import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component, ElementRef,
	EventEmitter,
	HostBinding, HostListener,
	Input,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-radio-button',
	templateUrl: './h-radio-button.component.html',
	styleUrls: ['./h-radio-button.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:component-class-suffix
export class HRadioButton implements OnInit, AfterContentInit {

	@Input() tabindex = 0;
	@Input() value: any;
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
	set selected(value: boolean) {
		this._selected = value;
	}
	get selected () {
		return this._selected;
	}
	private _selected: boolean;

	@Output() radiobuttonChange: EventEmitter<ElementRef> = new EventEmitter();

	@ViewChild('label') labelRef: ElementRef;

	@HostListener('click') setSelected() {
		if (!this.selected) {
			this.selected = true;
			this.radiobuttonChange.emit(this.host);
		}
	}
	@HostListener('keydown', ['$event']) onKeyDown(e) {
		// If Press [Tab] or [Enter] key -> toggle
		if (e.which === 32 || e.which === 13) {
			e.preventDefault(); // No scroll page for [Tab] key
			this.selected = true;
			this.radiobuttonChange.emit(this.host);
		}
	}
	@HostBinding('class.selected') get isSelected() {
		return this.selected;
	}
	@HostBinding('class.disabled') get isDisabled() {
		return this.disabled;
	}

	constructor(public host: ElementRef) {
	}

	ngOnInit() {
		if (this.disabled) {
			this.tabindex = -1;
		}
	}

	ngAfterContentInit () {
		// Delete label padding if no label
		if (this.labelRef.nativeElement.childNodes.length === 0) {
			this.labelRef.nativeElement.hidden = true;
		}
	}
}
