import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

interface Selected {
	value: any;
	text: string;
}

@Directive({
	selector: '[appSelectOptions]'
})
export class SelectOptionsDirective {

	@Input() value: any;
	@Input() text: string;
	@Output() selectedElement: EventEmitter<Selected> = new EventEmitter();

	constructor(public el: ElementRef) {
	}

	@HostListener('mousedown') onMousedown() {
		this.selectedElement.emit({value: this.value, text: this.text});
	}
}
