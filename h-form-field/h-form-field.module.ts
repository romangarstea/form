import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HTextInputDirective } from './directives/h-text-input.directive';
import { HTextareaDirective } from './directives/h-textarea.directive';
import { HAmountInputDirective } from './directives/h-amount-input.directive';
import { HNumberInputDirective } from './directives/h-number-input.directive';
import { HFormFieldComponent } from './h-form-field.component';
import { HPasswordInputDirective } from './directives/h-password-input.directive';
import { HGenericDirective } from './directives/h-generic.directive';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
	],
	declarations: [
		HTextInputDirective,
		HTextareaDirective,
		HAmountInputDirective,
		HNumberInputDirective,
		HFormFieldComponent,
		HPasswordInputDirective,
		HGenericDirective,
	],
	exports: [
		HTextInputDirective,
		HTextareaDirective,
		HAmountInputDirective,
		HNumberInputDirective,
		HFormFieldComponent,
		HPasswordInputDirective,
		HGenericDirective
	]
})
export class HFormFieldModule { }
