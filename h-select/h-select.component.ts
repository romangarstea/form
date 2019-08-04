import {
	AfterContentInit,
	AfterViewInit, ChangeDetectionStrategy,
	Component,
	ContentChildren,
	ElementRef,
	forwardRef, HostBinding,
	Input,
	OnDestroy,
	OnInit, QueryList, Renderer2,
	ViewChild
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {of, Subscription} from 'rxjs';
import {HSelectOptionComponent, Selected} from './h-select-option/h-select-option.component';
import {SelectorType} from 'codelyzer/selectorNameBase';

enum SelectType {
	select = 'select',
	search = 'search',
	title = 'title'
}
enum SelectSize {
	sm = 'sm',
	md = 'md',
}
enum SelectEmphasis {
	low = 'low',
	md = 'md',
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-select',
	templateUrl: './h-select.component.html',
	styleUrls: ['./h-select.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => HSelectComponent),
			multi: true
		}
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HSelectComponent implements OnInit, AfterContentInit, AfterViewInit, ControlValueAccessor, OnDestroy {

	private isOpen = false;
	private maxDropdownHeight = 260;
	private indexesOfDisplayedEl: number[] = []; // For ArrowDown and ArrowUp Key
	private indexOfSelectedEl;
	private valueOfSelectedEl;
	private optionHeight: number;
	private selectedByForm: string;
	private focusPrevent = false;
	private blurPrevent = false;
	private numberOfIcons = 0;

	set numberOfDisplayedLines(numberOfLines: number) {

		// Set options height
		if (this.indexesOfDisplayedEl[0]) {
			// If the items were filtered
			this.optionHeight = this.optionsQueryList.find((item, index) => index === this.indexesOfDisplayedEl[0]).el.nativeElement.offsetHeight;
		} else {
			// If items have not been filtered
			if (this.optionsQueryList.first) {
				this.optionHeight = this.optionsQueryList.first.el.nativeElement.offsetHeight;
				if (this.optionHeight < 32) {
					this.optionHeight = 32;
				}
			} else {
				this.optionHeight = 32;
			}
		}

		// Compare with @Input height(number of lines customizable by client).
		// The number of lines should not be more than 8 or more preset by the client value.
		if (this.dropdownHeight >= numberOfLines) {
			this._numberOfDisplayedLines = numberOfLines;
		} else {
			this._numberOfDisplayedLines = this.dropdownHeight;
		}

		// Compare with dropdown height
		// The number of displayed lines must not be greater than the height of the max dropdown height
		if (this.numberOfDisplayedLines * this.optionHeight > this.maxDropdownHeight) {
			this._numberOfDisplayedLines = Math.floor(this.maxDropdownHeight / this.optionHeight);
		}
	}
	get numberOfDisplayedLines() {
		if (this._numberOfDisplayedLines !== undefined) {
			return this._numberOfDisplayedLines;
		}
	}
	private _numberOfDisplayedLines: number;

	@Input() placeholder = '';
	@Input() required = true;
	@Input() width = '200px';
	@Input() dropdownHeight = 8; // Number of row in dropdown box. Max height 260px.
	@Input() disabled = false;
	@Input() widthDropdownBox;
	@Input() readonly: boolean;
	@Input() noSearch = false;

	@Input()
	set type(value: string) {
		if (!(value in SelectType)) {
			console.error('@Input ERROR in <h-select [type]= select | title | search');
			return;
		}
		this._type = value;
	}
	get type() {
		return this._type;
	}
	private _type: string = SelectType.select; // select | search | title

	@Input()
	set size(value: string) {
		if (!(value in SelectSize)) {
			console.error('@Input ERROR in <h-select [size]= sm | md');
			return;
		}
		this._size = value;
	}
	get size() {
		return this._size;
	}
	private _size: string = SelectSize.md; // md(height=32px) | sm(height=24px)

	@Input()
	set emphasis(value: string) {
		if (!(value in SelectEmphasis)) {
			console.error('@Input ERROR in <h-select [emphasis]= md | low');
			return;
		}
		this._emphasis = value;
	}
	get emphasis() {
		return this._emphasis;
	}
	private _emphasis: string = SelectEmphasis.md; // md | low

	@Input()
	set showCancelIcon(value: boolean) {
		if (value) {
			this.numberOfIcons++;
		}
		this._showCancelIcon = value;
	}
	get showCancelIcon() {
		return this._showCancelIcon;
	}
	private _showCancelIcon: boolean;

	@Input()
	set showTriangleIcon(value: boolean) {
		if (value) {
			this.numberOfIcons++;
		}
		this._showTriangleIcon = value;
	}
	get showTriangleIcon() {
		return this._showTriangleIcon;
	}
	private _showTriangleIcon: boolean;

	@Input()
	set showSearchIcon(value: boolean) {
		if (value) {
			this.numberOfIcons++;
		}
		this._showSearchIcon = value;
	}
	get showSearchIcon() {
		return this._showSearchIcon;
	}
	private _showSearchIcon: boolean;

	@ViewChild('inputBox') inputBox: ElementRef;
	@ViewChild('label') label: ElementRef;
	@ViewChild('hint') hint: ElementRef;
	@ViewChild('input') input: ElementRef;
	@ViewChild('iconCancel') iconCancel: ElementRef;
	@ViewChild('dropdownBox') dropdownBox: ElementRef;
	@ContentChildren(HSelectOptionComponent) optionsQueryList: QueryList<HSelectOptionComponent>;

	// Listen
	private inputBoxKeyDownListen: any;
	private inputBoxKeyUpListen: any;
	private inputBoxMousedownListen: any;
	private inputBoxMouseUpListen: any;
	private inputBoxHoverListen: any;
	private documentClickListen: any;
	private inputFocusListen: any;
	private inputBlurListen: any;
	private inputInputListen: any;
	private inputKeyUpListen: any;
	private cancelClickListen: any;
	private subscriptions: Subscription[] = [];

	@HostBinding('class.style-search') get isStyleSearch () {
		return this.type === SelectType.search;
	}

	@HostBinding('class.style-select') get isStyleSelect () {
		return this.type === SelectType.select;
	}

	@HostBinding('class.style-title') get isStyleTitle () {
		return this.type === SelectType.title;
	}

	@HostBinding('class.low') get isLowType () {
		return this.emphasis === SelectEmphasis.low;
	}

	@HostBinding('class.small') get isSmallSize () {
		return this.size === SelectSize.sm;
	}

	@HostBinding('class.required') get isRequired () {
		return this.required;
	}

	@HostBinding('class.readonly') get isReadOnly () {
		return this.readonly;
	}

	@HostBinding('class.disabled') get isDisabled () {
		return this.disabled;
	}

	// OVERLAY: CDK
	// private overlayRef: OverlayRef;
	// private positionStrategy = new GlobalPositionStrategy();
	// private startPosition?: {x: number, y: number};

	// ControlValueAccessor
	private propagateChange = (_: any) => {
	}


	////////////////////////////////////////////////////////////////////
	constructor(private host: ElementRef, private renderer: Renderer2) {
		// private overlay: Overlay
	}

	ngOnInit() {
		// Show Icons
		if (this.type === SelectType.search) {
			if (this.showCancelIcon === undefined) {
				this.showCancelIcon = true;
			}
			if (this.showSearchIcon === undefined) {
				this.showSearchIcon = true;
			}
			if (this.showTriangleIcon === undefined) {
				this.showTriangleIcon = false;
			}
			if (this.readonly === undefined) {
				this.readonly = false;
			}
		}
		if (this.type === SelectType.select) {
			if (this.showCancelIcon === undefined) {
				this.showCancelIcon = false;
			}
			if (this.showSearchIcon === undefined) {
				this.showSearchIcon = false;
			}
			if (this.showTriangleIcon === undefined) {
				this.showTriangleIcon = true;
			}
			if (this.readonly === undefined) {
				this.readonly = true;
			}
		}
	}

	ngAfterViewInit() {
		this.inputBoxListen();
		if (this.width === 'auto') {
			this.setWidthAdaptive();
		}
	}

	ngAfterContentInit() {

		this.optionsListen();
		this.optionsQueryList.changes.subscribe(() => this.optionsChange());
		this.setWidth();
		this.numberOfDisplayedLines = this.optionsQueryList.length;

		// if the form already has a default value (value->id or text->name), then you need to find
		// the index of the selected value and add class '.selected'
		if (this.selectedByForm && this.optionsQueryList) {
			this.optionsQueryList.find((item, index) => {
				if (item.search === this.selectedByForm) {
					this.indexOfSelectedEl = index;
					this.valueOfSelectedEl = item.value;
					this.markLine();
					return true;
				}
				if (item.value === this.selectedByForm) {
					this.indexOfSelectedEl = index;
					this.valueOfSelectedEl = item.value;
					this.selectedByForm = item.text;
					this.markLine();
					return true;
				}

				this.indexOfSelectedEl = -1;
				return false;
			});
		}

		if (this.valueOfSelectedEl) {
			this.changeBy_Form(this.valueOfSelectedEl);
			this.renderer.addClass(this.host.nativeElement, 'text');
		}

		// Initialisation indexesOfDisplayedEl.
		this.optionsQueryList.forEach((item, index) => {
			this.indexesOfDisplayedEl.push(index);
		});

		// CREATE OVERLAY
		// this.overlayRef = this.overlay.create({
		// 	positionStrategy: this.positionStrategy
		// });
	}

	ngOnDestroy() {
		if (this.inputBoxKeyDownListen) {
			this.inputBoxKeyDownListen();
		}
		if (this.inputBoxKeyUpListen) {
			this.inputBoxKeyUpListen();
		}
		if (this.inputBoxMousedownListen) {
			this.inputBoxMousedownListen();
		}
		if (this.inputBoxMouseUpListen) {
			this.inputBoxMouseUpListen();
		}
		if (this.inputBoxHoverListen) {
			this.inputBoxHoverListen();
		}
		if (this.documentClickListen) {
			this.documentClickListen();
		}
		if (this.inputFocusListen) {
			this.inputFocusListen();
		}
		if (this.inputBlurListen) {
			this.inputBlurListen();
		}
		if (this.inputInputListen) {
			this.inputInputListen();
		}
		if (this.inputKeyUpListen) {
			this.inputKeyUpListen();
		}
		if (this.cancelClickListen) {
			this.cancelClickListen();
		}
		if (this.inputInputListen) {
			this.inputInputListen();
		}

		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		// this.overlayRef.dispose();
	}

	private inputBoxListen() {

		//// Prevent scroll page if press Arrow Key
		////////////////////////////////////////////////////
		const keys = {};

		// INPUT-BOX(keydown)
		this.inputBoxKeyDownListen = this.renderer.listen(this.inputBox.nativeElement, 'keydown', (e) => {
			keys[e.code] = true;
			switch (e.code) {
				case 'ArrowDown':  case 'ArrowUp': // Arrow keys
					e.preventDefault(); break;
				default: break; // do not block other keys
			}
		});

		// INPUT-BOX(keyup)
		this.inputBoxKeyUpListen = this.renderer.listen(this.inputBox.nativeElement, 'keyup', (e) => {
			keys[e.code] = false;
		});

		////////////////////////////////////////////////////

		// DOCUMENT(click): If clicks anywhere outside the select box, then close select box
		this.documentClickListen = this.renderer.listen('document', 'click', (e) => {
			const isClickInnInputBox = e.path.find( el => el === this.inputBox.nativeElement);
			const isClickInDropdownBox = e.path.find( el => el === this.dropdownBox.nativeElement);

			if (!isClickInnInputBox && !isClickInDropdownBox) {
				this.close();
			}
		});

		////////////////////////////////////////////////////

		// INPUT-BOX(mousedown)
		this.inputBoxMousedownListen = this.renderer.listen(this.inputBox.nativeElement, 'mousedown', (e) => {
			this.focusPrevent = true;
			this.renderer.addClass(this.host.nativeElement, 'pressed');
		});

		// INPUT-BOX(mouseup)
		this.inputBoxMouseUpListen = this.renderer.listen(this.inputBox.nativeElement, 'mouseup', (e) => {
			this.focusPrevent = false;
			this.renderer.removeClass(this.host.nativeElement, 'pressed');
			if (this.isOpen) {
				this.close();
			} else {
				this.open();
			}
		});

		// INPUT-BOX(mouseover): Add class [.hover] to :host.
		this.inputBoxHoverListen = this.renderer.listen(this.inputBox.nativeElement, 'mouseover', (e) => {
			this.renderer.addClass(this.host.nativeElement, 'hover');
		});

		// INPUT-BOX(mouseout): Remove class [.hover] to :host.
		this.inputBoxHoverListen = this.renderer.listen(this.inputBox.nativeElement, 'mouseout', (e) => {
			this.renderer.removeClass(this.host.nativeElement, 'hover');
		});

		////////////////////////////////////////////////////

		// INPUT(focus)
		this.inputFocusListen = this.renderer.listen(this.input.nativeElement, 'focus', (e) => {
			this.renderer.addClass(this.host.nativeElement, 'focus');
			if (!this.focusPrevent) {
				// this.open(); // If Tab Key dropdown box open.
			}
		});

		// INPUT(blur)
		this.inputBlurListen = this.renderer.listen(this.input.nativeElement, 'blur', (e) => {

			this.renderer.removeClass(this.host.nativeElement, 'focus');
			if (this.input.nativeElement.value === '') {
				this.changeBy_CancelButton();
			} else {
				if (this.blurPrevent) {
					this.blurPrevent = false;
				} else {
					const inputValue = this.input.nativeElement.value;
					const isInputValueValid = this.optionsQueryList.find((item, index) => {
						if (item.text === inputValue) {
							this.indexOfSelectedEl = index;
							return true;
						} else {
							return false;
						}
					});
					if (isInputValueValid) {
						this.changeBy_Key();
					} else {
						this.changeBy_CancelButton();
					}
				}
			}
			this.close();
		});

		// INPUT(input)
		this.inputInputListen = this.renderer.listen(this.input.nativeElement, 'input', (e) => {
			if (e.target.value !== '') {
				this.renderer.addClass(this.host.nativeElement, 'text');
			} else {
				this.renderer.removeClass(this.host.nativeElement, 'text');
			}

			this.filterElements(e.target.value);
		});

		// INPUT(keyup)
		this.inputKeyUpListen = this.renderer.listen(this.input.nativeElement, 'keyup', (e) => {
			if (e.code === 'Enter' || e.which === 13) {
				if (this.isOpen) {
					this.close();
				} else {
					this.open();
				}
			}
			if (e.code === 'ArrowDown' || e.which === 40) {
				e.preventDefault();
				this.selectDown();
			}
			if (e.code === 'ArrowUp' || e.which === 38) {
				e.preventDefault();
				this.selectUp();
			}
			if (e.code === 'Delete' || e.which === 46) {
				this.changeBy_CancelButton();
			}
		});

		////////////////////////////////////////////////////

		// CANCEL(click)
		if (this.type === 'search' && this.showCancelIcon) {
			this.cancelClickListen = this.renderer.listen(this.iconCancel.nativeElement, 'click', (e) => {
				this.changeBy_CancelButton();
			});
		}
	}

	private open() {
		this.isOpen = true;
		this.renderer.addClass(this.host.nativeElement, 'open');
		this.renderer.setStyle(this.dropdownBox.nativeElement, 'height', this.numberOfDisplayedLines * this.optionHeight + 'px');

		// so that the scroll doesn't appear during the animation
		setTimeout(() => {
			this.renderer.setStyle(this.dropdownBox.nativeElement, 'overflow-y', 'auto');
		}, 200);

		this.scrollOpen();

		// OVERLAY: RENDER DROP BOX
		// if (!this.overlayRef.hasAttached()) {
		// 	// this.overlayRef.attach(new ComponentPortal(this.dropdownBox));
		// }

		// OVERLAY: POSITION DROP BOX
		// this.positionStrategy.left(`${0}px`);
		// this.positionStrategy.top(`${0}px`);
		// this.positionStrategy.apply();
	}

	private close() {
		this.isOpen = false;
		this.renderer.removeClass(this.host.nativeElement, 'open');
		this.renderer.setStyle(this.dropdownBox.nativeElement, 'height', '0px');
		this.renderer.removeStyle(this.dropdownBox.nativeElement, 'overflow-y');

		// OVERLAY: REMOVE DROP BOX
		// this.overlayRef.detach();
	}

	///////////////////////////////////////////////////////
	private changeBy_MouseClick(value?: Selected) {
		// console.log('CHANGE_BY_MOUSE_CLICK');
		this.blurPrevent = true;
		this.input.nativeElement.value = value ? value.text : '';
		this.propagateChange(value ? value.value : '');
		this.hostClassText();
		this.filterElements('');
		this.close();

		if (this.optionsQueryList && value) {
			this.optionsQueryList.find((item, index) => {
				if (item.el.nativeElement === value.el.nativeElement) {
					this.indexOfSelectedEl = index;
					this.markLine();
					return true;
				} else {
					return false;
				}
			});
		}
	}

	private changeBy_Key() {
		// console.log('CHANGE_BY_KEY');
		// FUNCTION DESCRIPTION: change by ArrowUp, ArrowDown or Tab Key
		let el: HSelectOptionComponent;

		// Nid Required Validation and error message. After delete
		if (this.indexOfSelectedEl >= 0) {
			this.optionsQueryList.find((item, index) => {
				if (index === this.indexOfSelectedEl) {
					el = item;
					return true;
				} else {
					return false;
				}
			});
		}

		this.input.nativeElement.value = el ? el.text : '';
		this.propagateChange(el ? el.value : '');
		this.hostClassText();
	}

	private changeBy_CancelButton() {
		// console.log('CHANGE_BY_CANCEL_BUTTON');
		this.indexOfSelectedEl = -1;
		this.input.nativeElement.value = '';
		this.markLine();
		this.propagateChange('');
		this.hostClassText();
		this.filterElements('');
	}

	private changeBy_Form(value) {
		// console.log('CHANGE_BY_FORM');
		this.selectedByForm = value;

		if (this.optionsQueryList) {
			this.optionsQueryList.find((item, index) => {
				if (item.value === value) {
					this.renderer.addClass(this.host.nativeElement, 'text');
					this.input.nativeElement.value = item.text;
					this.selectedByForm = item.text;
					this.indexOfSelectedEl = index;
					this.markLine();
					this.filterElements('');
					this.close();
					return true;
				} else {
					return false;
				}
			});
		}
	}

	///////////////////////////////////////////////////////
	private optionsListen() {
		this.optionsQueryList.forEach(el => {
			this.subscriptions.push(el.selectedElement.subscribe(value => {
				this.changeBy_MouseClick(value);
			}));
		});
	}

	private optionsChange() {
		this.optionsListen();

		// For set drop box height
		this.numberOfDisplayedLines = this.optionsQueryList.length;

		if (this.selectedByForm) {
			this.changeBy_Form(this.selectedByForm);
		}
	}

	///////////////////////////////////////////////////////
	private  setWidthFixed() {
		this.renderer.setStyle(this.host.nativeElement, 'width', this.width);
		this.renderer.setStyle(this.inputBox.nativeElement, 'width', this.width);
		this.renderer.setStyle(this.dropdownBox.nativeElement, 'width', this.widthDropdownBox ? this.widthDropdownBox : this.width);
		this.renderer.setStyle(this.label.nativeElement, 'width', this.width);
		this.renderer.setStyle(this.hint.nativeElement, 'width', this.width);
	}

	private setWidth() {
		if (this.width === 'auto') {
			this.renderer.setStyle(this.dropdownBox.nativeElement, 'width', 'max-content');
		} else {
			this.setWidthFixed();
		}
	}

	private setWidthAdaptive() {
		this.width = this.dropdownBox.nativeElement.scrollWidth + (32 * this.numberOfIcons) + 'px';
		this.setWidthFixed();
	}

	private changeHeight(numberOfLines: number) {
		this.numberOfDisplayedLines = numberOfLines;
		if (this.isOpen) {
			this.close();
			this.open();
		} else {
			this.open();
		}
	}

	private filterElements(text: string) {
		if (!this.noSearch) {
			this.indexesOfDisplayedEl = [];
			let numberOfFilteredItems = 0;
			text = text.trim().toLowerCase();

			// Create Reg.
			///////////////////////////////////////////////////////////
			const textSplit = text.split(/\s+/);

			let regAllStr = '';
			let regOnlyStr = '';

			// Create Reg for all matches.
			// EX: Martin Edgard. Input "ma ed" -> /\bma|\bed/ig
			// [Martin Edgard, Martin Bernard, Joly Edgard] -> all
			for (let i = 0; i < textSplit.length; i++) {
				if (i !== textSplit.length - 1) {
					regAllStr = regAllStr + '\\b' + textSplit[i] + '|';
				} else {
					regAllStr = regAllStr + '\\b' + textSplit[i];
				}
			}

			// Create Reg for specific matches.
			// EX: Martin Edgard. Input "ma ed" -> /\bma.*\bed/ig
			// [Martin Edgard, Martin Bernard, Joly Edgard] -> Martin Edgard
			for (let i = 0; i < textSplit.length; i++) {
				if (i !== textSplit.length - 1) {
					regOnlyStr = regOnlyStr + '\\b' + textSplit[i] + '.*';
				} else {
					regOnlyStr = regOnlyStr + '\\b' + textSplit[i];
				}
			}

			const regAll = new RegExp(regAllStr, 'ig');
			const regOnly = new RegExp(regOnlyStr, 'ig');

			this.optionsQueryList.forEach((item, index) => {

				if (text === '') {
					numberOfFilteredItems++; // set height of dropdown
					item.searchElement.nativeElement.innerHTML = item.search;
					this.renderer.removeClass(item.el.nativeElement, 'hidden');

					// For ArrowDown and ArrowUp Key
					this.indexesOfDisplayedEl.push(index);

				} else {

					if (item.search.search(regAll) >= 0 && item.search.search(regOnly) >= 0) {

						// Create TEXT RED
						const str = item.search;
						let result;
						const tabIndex = [];
						const tabIndexForSubstring = [];
						const tabString = [];

						// Create tabIndex. ex: 'Bernard Bertrand' \/bbe\ig
						// [0,2,8,10]
						// tslint:disable-next-line:no-conditional-assignment
						while ((result = regAll.exec(str)) !== null) {
							tabIndex.push(result.index);
							tabIndex.push(regAll.lastIndex);
						}

						// Create tabIndexForSubstring ex: 'Bernard Bertrand' \/bbe\ig
						// {index: 0, length: 2}
						// {index: 2, length: 6}
						// {index: 8, length: 2}
						// {index:10, length: 6}
						if (!(tabIndex[0] === 0)) {
							tabIndexForSubstring.push({index: 0, length: -(0 - tabIndex[0])});
						}
						for (let e = 0; e < tabIndex.length; e++) {
							if (e === tabIndex.length - 1) {
								tabIndexForSubstring.push({index: tabIndex[e], length: -(tabIndex[e] - str.length)});
							} else {
								tabIndexForSubstring.push({index: tabIndex[e], length: -(tabIndex[e] - tabIndex[e + 1])});
							}
						}

						// Create tabString ex: 'Bernard Bertrand' \/bbe\ig
						// ['Be', 'rnard ', 'Be', 'rtrand']
						for (const val of tabIndexForSubstring) {
							tabString.push(str.substr(val.index, val.length));
						}

						// Delete old text
						item.searchElement.nativeElement.innerHTML = '';

						// Create NODE
						for (const tabStringItem of tabString) {

							let mark = false;
							for (const textSplitItem of textSplit) {
								if (textSplitItem === tabStringItem.toLowerCase()) {
									mark = true;
								}
							}

							if (mark) {
								const spanNode = this.renderer.createElement('span');
								this.renderer.addClass(spanNode, 'markLetters');
								spanNode.innerHTML = tabStringItem.replace(/ /g, '&nbsp;');
								this.renderer.appendChild(item.searchElement.nativeElement, spanNode);
							} else {
								const spanNode = this.renderer.createElement('span');
								spanNode.innerHTML = tabStringItem.replace(/ /g, '&nbsp;');
								this.renderer.appendChild(item.searchElement.nativeElement, spanNode);
							}
						}

						// For height of dropdown
						numberOfFilteredItems++;
						// For ArrowDown and ArrowUp Key
						this.indexesOfDisplayedEl.push(index);

						this.renderer.removeClass(item.el.nativeElement, 'hidden');
					} else {
						this.renderer.addClass(item.el.nativeElement, 'hidden');
					}
				}
			});

			this.changeHeight(numberOfFilteredItems);
			if (numberOfFilteredItems === 0) {
				this.renderer.removeClass(this.host.nativeElement, 'open');
			}
		}
	}

	private selectUp() {

		if (this.indexOfSelectedEl >= 0) {
			if (this.indexesOfDisplayedEl && this.indexesOfDisplayedEl.length) {
				const key = this.indexesOfDisplayedEl.indexOf(this.indexOfSelectedEl);
				if (key - 1 < 0) {
					this.indexOfSelectedEl = this.indexesOfDisplayedEl[this.indexesOfDisplayedEl.length - 1];
				} else {
					this.indexOfSelectedEl = this.indexesOfDisplayedEl[key - 1];
				}

			} else {
				if (this.indexOfSelectedEl - 1 < 0) {
					this.indexOfSelectedEl = this.optionsQueryList.length - 1;
				} else {
					this.indexOfSelectedEl = this.indexOfSelectedEl - 1;
				}
			}
		} else {
			if (this.indexesOfDisplayedEl && this.indexesOfDisplayedEl.length) {
				this.indexOfSelectedEl = this.indexesOfDisplayedEl[this.indexesOfDisplayedEl.length - 1];
			} else {
				this.indexOfSelectedEl = this.optionsQueryList.length - 1;
			}
		}

		this.markLine();
		this.scrollArrowUp();
		this.changeBy_Key();
	}

	private selectDown() {
		if (this.indexOfSelectedEl >= 0) {
			if (this.indexesOfDisplayedEl && this.indexesOfDisplayedEl.length) {
				const key = this.indexesOfDisplayedEl.indexOf(this.indexOfSelectedEl);
				if (key + 1 <= this.indexesOfDisplayedEl.length - 1) {
					this.indexOfSelectedEl = this.indexesOfDisplayedEl[key + 1];
				} else {
					this.indexOfSelectedEl = this.indexesOfDisplayedEl[0];
				}
			} else {
				if (this.indexOfSelectedEl + 1 <= this.optionsQueryList.length - 1) {
					this.indexOfSelectedEl = this.indexOfSelectedEl + 1;
				} else {
					this.indexOfSelectedEl = 0;
				}
			}
		} else {
			if (this.indexesOfDisplayedEl && this.indexesOfDisplayedEl.length) {
				this.indexOfSelectedEl = this.indexesOfDisplayedEl[0];
			} else {
				this.indexOfSelectedEl = 0;
			}
		}
		this.markLine();
		this.scrollArrowDown();
		this.changeBy_Key();
	}

	private markLine() {
		// remove old '.selected'
		this.optionsQueryList.forEach(value => {
			this.renderer.removeClass(value.el.nativeElement, 'selected');
		});

		// add new '.selected'
		const elAddClass = this.optionsQueryList.find((item, index) => index === this.indexOfSelectedEl);
		if (elAddClass) {
			this.renderer.addClass(elAddClass.el.nativeElement, 'selected');
		}
	}

	private hostClassText() {
		if (this.input.nativeElement.value !== '') {
			this.renderer.addClass(this.host.nativeElement, 'text');
		} else {
			this.renderer.removeClass(this.host.nativeElement, 'text');
		}
	}

	//// Adjust scroll when on press 'arrow' key or opening
	///////////////////////////////////////////////////////
	private scrollArrowUp() {
		const dropBoxHeight = this.numberOfDisplayedLines * this.optionHeight;
		const minIndex = (this.dropdownBox.nativeElement.scrollTop / this.optionHeight);
		const maxIndex = ((this.dropdownBox.nativeElement.scrollTop + dropBoxHeight) / this.optionHeight);
		const index = this.indexesOfDisplayedEl.indexOf(this.indexOfSelectedEl) + 1;

		if (index < minIndex + 1) {
			this.dropdownBox.nativeElement.scrollTop = this.dropdownBox.nativeElement.scrollTop - this.optionHeight;
		}

		if (index > maxIndex) {
			this.dropdownBox.nativeElement.scrollTop = index * this.optionHeight;
		}
	}

	private scrollArrowDown() {
		const dropBoxHeight = this.numberOfDisplayedLines * this.optionHeight;
		const minIndex = (this.dropdownBox.nativeElement.scrollTop / this.optionHeight);
		const maxIndex = ((this.dropdownBox.nativeElement.scrollTop + dropBoxHeight) / this.optionHeight);
		const index = this.indexesOfDisplayedEl.indexOf(this.indexOfSelectedEl) + 1;

		if (index > maxIndex) {
			this.dropdownBox.nativeElement.scrollTop = this.dropdownBox.nativeElement.scrollTop + this.optionHeight;
		}

		if (index < minIndex) {
			this.dropdownBox.nativeElement.scrollTop = (index - 1) * this.optionHeight;
		}
	}

	private scrollOpen() {
		let middle = this.numberOfDisplayedLines / 2;
		if (middle % 1 === 0) {
			middle = middle - 1;
		} else {
			middle = Math.floor(middle);
		}

		const index = this.indexesOfDisplayedEl.indexOf(this.indexOfSelectedEl);
		this.dropdownBox.nativeElement.scrollTop = (index - middle) * this.optionHeight;
	}

	//// ControlValueAccessor
	///////////////////////////////////////////////////////
	writeValue(value: string) {
		this.changeBy_Form(value);
	}

	registerOnChange(fn) {
		this.propagateChange = fn;
	}

	registerOnTouched() {
	}
}
