import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	ElementRef, EventEmitter,
	forwardRef,
	Input,
	OnDestroy,
	OnInit, Output,
	QueryList
} from '@angular/core';
import {Subscription} from 'rxjs';
import {HRadioButton} from '../h-radio-button.component';
import {SubscriptionHelper} from '../../../../utils/subscribtion-helper';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-radio-group',
	templateUrl: './h-radio-group.component.html',
	styleUrls: ['./h-radio-group.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => HRadioGroup),
			multi: true
		}
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:component-class-suffix
export class HRadioGroup implements OnInit, AfterContentInit, OnDestroy, ControlValueAccessor {

	@Input() direction = 'column';
	@Input()
	set selectedIn (value: any) {
		this._selectedIn = value;
		this.changedBy_Cod(value);
	}
	get selectedIn() {
		return this._selectedIn;
	}
	private _selectedIn: any;

	@Output() selectedOut: EventEmitter<any> = new EventEmitter();

	private subscriptions: Subscription[] = [];
	@ContentChildren(HRadioButton) buttonsQueryList: QueryList<HRadioButton>;

	constructor() {
	}

	ngOnInit() {
	}

	ngAfterContentInit() {
		this.buttonsListen();
		this.buttonsQueryList.changes.subscribe(() => this.optionsChange());
		if (this.selectedIn !== undefined) {
			this.changedBy_Cod(this.selectedIn);
		}
	}

	ngOnDestroy() {
		SubscriptionHelper.unsubscribeAll(this.subscriptions);
	}

	///////////////////////////////////////////////////////
	private propagateChange = (_: any) => {};

	private buttonsListen() {
		this.buttonsQueryList.forEach(el => {
			this.subscriptions.push(el.radiobuttonChange.subscribe(value => {
				this.changedBy_Click(value);
			}));
		});
	}

	private optionsChange() {
		SubscriptionHelper.unsubscribeAll(this.subscriptions);
		this.subscriptions = [];
		this.buttonsListen();
	}

	// Changed by user in HTML by click
	private changedBy_Click(value: ElementRef) {
		this.buttonsQueryList.forEach((item, index) => {
			if (item.host.nativeElement === value.nativeElement) {
				if (item.value === undefined) {
					this.selectedOut.emit(index);
					this.propagateChange(index);
				} else {
					this.selectedOut.emit(item.value);
					this.propagateChange(item.value);
				}
			} else {
				item.selected = false;
			}
		});
	}

	// Changed by Form Model or @Input
	private changedBy_Cod(value: any) {
		if (this.buttonsQueryList && this.buttonsQueryList.length > 0) {
			if (this.buttonsQueryList.first.value !== undefined) {
				this.buttonsQueryList.forEach((item) => {
					if (item.value === value) {
						item.selected = true;
					} else {
						item.selected = false;
					}
				});
			}

			if (this.buttonsQueryList.first.value === undefined && typeof value === 'number') {
				this.buttonsQueryList.forEach((item, index) => {
					if (index === value) {
						item.selected = true;
					} else {
						item.selected = false;
					}
				});
			}
		}
	}

	//// IMPLEMENT INTERFACE ControlValueAccessor
	///////////////////////////////////////////////

	// FormModel -> HTML
	writeValue(value: any) {
		this.selectedIn = value;
	}
	// HTML -> FormModel
	registerOnChange(fn) {
		this.propagateChange = fn;
	}
	registerOnTouched() {}

}
