`<h-form-field>` is a component used to wrap form inputs and apply common styles and behavior.

In this document, "form field" refers to the wrapper component `<h-form-field>` and
"form field control" refers to the component that the `<h-form-field>` is wrapping
(e.g. the input, textarea)

The following variants of inputs could work inside a `<h-form-field>`:
* `<input hTextInput>` - text input
* `<textarea hTextarea></textarea>` - text area input
* `<input hNumberInput type="number">` - number input with `+`, `-` controls
* `<input hAmountInput type="number">` - amount input

<!-- example(form-field-overview) -->

### Label
To show label, you should mark tag with `label` parameter
```html
<h-form-field>
  <div label>Name*</div>
  <------>
</h-form-field>
```

### Hint labels
To show label, you should mark tag with `hint` parameter
```html
<h-form-field>
  <div hint>Write you Name</div>
  <------>
</h-form-field>
```

### Error messages

Error messages can be shown under the form field underline by mark element with `error` property inside the
form field. Errors are hidden initially and will be displayed on invalid form fields after the user
has interacted with the element or the parent form has been submitted. 

```html
<h-form-field>
  <------>
  <div error *ngIf="form.get('name').hasError('required')">
    <div class="material-icons">error</div>
  	<div>First Name is required.</div>
  </div>
  <div error *ngIf="form.get('name').hasError('maxlength')">
  	<div class="material-icons">error</div>
  	<div>First name length should be less than 50 symbols</div>
  </div>
  <------>
</h-form-field>
```

### Icons
| Type             | Description
|------------------|------------------------------------------------
| `leftIcon`       | Element shows as left icon
| `rightIcon`      | Element shows as right icon
| `rightIconDone`  | Element shows as right icon, and have `success` color
| `rightIconError` | Element shows as right icon, and have `danger` color
| `rightIconSpin`  | Element shows as right icon and icon is spin

```html
<h-form-field>
  <------>
  <div leftIcon class="material-icons">email</div>
  <div rightIcon class="material-icons">email</div>
  <div rightIconDone class="material-icons">check_circle</div>
  <div rightIconError class="material-icons">warning</div>
  <div rightIconSpin><div class="material-icons">sync</div></div>
  <------>
</h-form-field>
```

## Inputs
####@Input [width] 
Width of input field 

| Type            |  Ex        |  Default                    |
|-----------------|------------|-----------------------------|
| `hTextInput`    | '200px'    |  'auto' (max 378px)         |
| `textarea`      | '200px'    |  'auto' (max 378px)         |
| `hAmountInput`  | '200px'    |  'auto' (max 378px)         |
| `hNumberInput`  | '200px'    |  length of max value * 8px  |

		
####@Input [numberOfCharacter] 
`numberOfCharacter` uses for calculating width of input field. You can use it while working with
float values. 

| Type          |  Ex             |
|---------------|-----------------|
| hNumberInput  |   10            |

## Examples

```html
<form class="form-container" [formGroup]="profileForm">

		<----- Text input ----->
		<h-form-field>
			<div label>Name*</div>
			<input hTextInput formControlName="name" placeholder="Name" maxlength="18">
			<div hint>Write you Name</div>
			<div error *ngIf="profileForm.get('name').hasError('required')">
				<div class="material-icons">error</div>
				<div>Name is required.</div>
			</div>
		</h-form-field>

        <-----Text input with icon----->
		<h-form-field>
			<div label>Email*</div>

			<div leftIcon class="material-icons">email</div>
			<input hTextInput formControlName="email" placeholder="Email" maxlength="18">
			<div rightIcon class="material-icons">email</div>

			<!--<div rightIconDone class="material-icons">check_circle</div>-->
			<!--<div rightIconError class="material-icons">warning</div>-->
			<!--<div rightIconSpin><div class="material-icons">sync</div></div>-->

			<div hint>Write email</div>
			<div error *ngIf="profileForm.get('email').hasError('required')">
				<div class="material-icons">error</div>
				<div>First Name is required.</div>
			</div>
			<div error *ngIf="profileForm.get('email').hasError('email')">
				<div class="material-icons">error</div>
				<div>Email invalid</div>
			</div>
		</h-form-field>

        <-----Text area----->
		<h-form-field>
			<div label>Textarea*</div>
			<textarea hTextarea formControlName="description" placeholder="Description" maxlength="200"></textarea>

			<div hint>Hint <em>(required)</em></div>
			<div error *ngIf="profileForm.get('description').hasError('required')">
				<div class="material-icons">error</div>
				<div>Description is required.</div>
			</div>
		</h-form-field>

        <-----Amount input----->
		<h-form-field [width]="'160px'">
			<div label>Amount EN</div>

			<!--<div amountLeftIcon  class="material-icons">attach_money</div>-->
			<input hAmountInput formControlName="amountEn" placeholder="0.00" min="0" max="1000">
			<div amountRightIcon class="material-icons">attach_money</div>

			<div hint>Write amount</div>

			<div error *ngIf="profileForm.get('amountEn').hasError('required')">
				<div class="material-icons">error</div>
				<div>Required.</div>
			</div>
			<div error *ngIf="profileForm.get('amountEn').hasError('max')">
				<div class="material-icons">error</div>
				<div>Max 1000$</div>
			</div>
			<div error *ngIf="profileForm.get('amountEn').hasError('min')">
				<div class="material-icons">error</div>
				<div>Min 1000$</div>
			</div>
		</h-form-field>

        <----- Number input ----->
		<h-form-field>
			<div label>Adult*</div>

			<input hNumberInput formControlName="numberIncrement" min="0" max="10" step="1">

			<div hint>Write numb.</div>
			<div error *ngIf="profileForm.get('numberIncrement').hasError('required')">
				<div class="material-icons">error</div>
				<div>Required</div>
			</div>
			<div error *ngIf="profileForm.get('numberIncrement').hasError('rangeError')">
				<div class="material-icons">error</div>
				<div>Range Error</div>
			</div>
			<div error *ngIf="profileForm.get('numberIncrement').hasError('min')">
				<div class="material-icons">error</div>
				<div>Min Error</div>
			</div>
			<div error *ngIf="profileForm.get('numberIncrement').hasError('max')">
				<div class="material-icons">error</div>
				<div>Max Error</div>
			</div>
		</h-form-field>
		
        <----- Float Number input ----->
        <h-form-field numberOfCharacter="4">
            <div label>Adult*</div>

            <input hNumberInput formControlName="numberIncrement" min="0" max="1" step="0.01">

            <div hint>Write numb.</div>
            <div error *ngIf="profileForm.get('numberIncrement').hasError('required')">
                <div class="material-icons">error</div>
                <div>Required</div>
            </div>
            <div error *ngIf="profileForm.get('numberIncrement').hasError('rangeError')">
                <div class="material-icons">error</div>
                <div>Range Error</div>
            </div>
            <div error *ngIf="profileForm.get('numberIncrement').hasError('min')">
                <div class="material-icons">error</div>
                <div>Min Error</div>
            </div>
            <div error *ngIf="profileForm.get('numberIncrement').hasError('max')">
                <div class="material-icons">error</div>
                <div>Max Error</div>
            </div>
        </h-form-field>

	</form>
```
