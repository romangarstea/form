import {
	AfterContentInit,
	Component,
	ContentChild,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	Output, Renderer2,
} from '@angular/core';

export interface Selected {
	value: any;
	text: string;
	el: ElementRef;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'h-select-option',
	templateUrl: './h-select-option.component.html',
	styleUrls: ['./h-select-option.component.scss']
})
export class HSelectOptionComponent implements AfterContentInit {

	@Input() value: any;
	@Input() text: string;
	@Input() search: string;

	@ContentChild('search') searchElement: ElementRef;

	@Output() selectedElement: EventEmitter<Selected> = new EventEmitter();

	constructor(public el: ElementRef, public renderer: Renderer2) {
	}

	ngAfterContentInit() {
		if (this.value === undefined) {
			this.value = this.text;
		}

		if (this.search === undefined) {
			this.search = this.text;
		}

		if (this.searchElement === undefined) {
			const spanElement = this.renderer.createElement('span');
			const textNode = this.renderer.createText(this.text);
			this.renderer.appendChild(spanElement, textNode);
			this.renderer.appendChild(this.el.nativeElement, spanElement);
			this.searchElement = new ElementRef(spanElement);
		}

		// console.log(this.el.nativeElement);
		// console.log(this.searchElement.nativeElement);
		// console.log(this.text);
		// console.log(this.value);
		// console.log(this.search);
	}

	@HostListener('mousedown') onMousedown() {
		this.selectedElement.emit({value: this.value, text: this.text, el: this.el});
	}
}
