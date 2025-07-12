import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // Regex Patterns
  readonly PATTERNS = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^[\+]?[1-9][\d\s\-\(\)]{0,15}$/,
    PASSWORD:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    NAME: /^[a-zA-Z\s\-'\.]{2,50}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
    NUMERIC: /^[0-9]+$/,
    DECIMAL: /^[0-9]+(\.[0-9]{1,2})?$/,
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    URL: /^https?:\/\/.+/,
    POSTAL_CODE: /^[A-Za-z0-9\s-]{3,10}$/,
    CURRENCY: /^\d+(\.\d{1,2})?$/,
    PERCENTAGE: /^[0-9]{1,3}(\.[0-9]{1,2})?$/,
  };

  // Validation Messages
  readonly MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PHONE:
      'Please enter a valid phone number (can include spaces, dashes, and parentheses)',
    PASSWORD:
      'Password must be at least 8 characters with uppercase, lowercase, number and special character',
    NAME: 'Name must be 2-50 characters with letters, spaces, hyphens, apostrophes, and periods',
    USERNAME:
      'Username must be 3-20 characters with letters, numbers and underscores only',
    ALPHANUMERIC: 'Only letters, numbers and spaces are allowed',
    NUMERIC: 'Only numbers are allowed',
    DECIMAL: 'Please enter a valid decimal number',
    DATE: 'Please enter a valid date (YYYY-MM-DD)',
    TIME: 'Please enter a valid time (HH:MM)',
    URL: 'Please enter a valid URL',
    POSTAL_CODE: 'Please enter a valid postal code',
    CURRENCY: 'Please enter a valid currency amount',
    PERCENTAGE: 'Please enter a valid percentage (0-100)',
    MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
    MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
    MIN_VALUE: (min: number) => `Value must be at least ${min}`,
    MAX_VALUE: (max: number) => `Value must be no more than ${max}`,
    PATTERN_MISMATCH: 'Invalid format',
    FUTURE_DATE: 'Date cannot be in the future',
    PAST_DATE: 'Date cannot be in the past',
    DATE_RANGE: 'End date must be after start date',
    TIME_RANGE: 'End time must be after start time',
    UNIQUE: 'This value already exists',
    CONFIRM_PASSWORD: 'Passwords do not match',
    STRONG_PASSWORD:
      'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
  };

  // Custom Validators
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.EMAIL.test(control.value) ? null : { email: true };
    };
  }

  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.PHONE.test(control.value) ? null : { phone: true };
    };
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.PASSWORD.test(control.value)
        ? null
        : { password: true };
    };
  }

  nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.NAME.test(control.value) ? null : { name: true };
    };
  }

  usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.USERNAME.test(control.value)
        ? null
        : { username: true };
    };
  }

  alphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.ALPHANUMERIC.test(control.value)
        ? null
        : { alphanumeric: true };
    };
  }

  numericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.NUMERIC.test(control.value)
        ? null
        : { numeric: true };
    };
  }

  decimalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.DECIMAL.test(control.value)
        ? null
        : { decimal: true };
    };
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.DATE.test(control.value) ? null : { date: true };
    };
  }

  timeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.TIME.test(control.value) ? null : { time: true };
    };
  }

  urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.URL.test(control.value) ? null : { url: true };
    };
  }

  postalCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.POSTAL_CODE.test(control.value)
        ? null
        : { postalCode: true };
    };
  }

  currencyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PATTERNS.CURRENCY.test(control.value)
        ? null
        : { currency: true };
    };
  }

  percentageValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = parseFloat(control.value);
      if (isNaN(value) || value < 0 || value > 100) {
        return { percentage: true };
      }
      return this.PATTERNS.PERCENTAGE.test(control.value)
        ? null
        : { percentage: true };
    };
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      return inputDate > today ? { futureDate: true } : null;
    };
  }

  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      return inputDate < today ? { pastDate: true } : null;
    };
  }

  dateRangeValidator(startDateControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !startDateControl.value) return null;
      const startDate = new Date(startDateControl.value);
      const endDate = new Date(control.value);
      return endDate <= startDate ? { dateRange: true } : null;
    };
  }

  timeRangeValidator(startTimeControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !startTimeControl.value) return null;
      const startTime = new Date(`2000-01-01T${startTimeControl.value}`);
      const endTime = new Date(`2000-01-01T${control.value}`);
      return endTime <= startTime ? { timeRange: true } : null;
    };
  }

  confirmPasswordValidator(passwordControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value === passwordControl.value
        ? null
        : { confirmPassword: true };
    };
  }

  // Get validation message
  getErrorMessage(
    control: AbstractControl,
    fieldName: string = 'This field'
  ): string {
    if (!control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return this.MESSAGES.REQUIRED;
    if (errors['email']) return this.MESSAGES.EMAIL;
    if (errors['phone']) return this.MESSAGES.PHONE;
    if (errors['password']) return this.MESSAGES.PASSWORD;
    if (errors['name']) return this.MESSAGES.NAME;
    if (errors['username']) return this.MESSAGES.USERNAME;
    if (errors['alphanumeric']) return this.MESSAGES.ALPHANUMERIC;
    if (errors['numeric']) return this.MESSAGES.NUMERIC;
    if (errors['decimal']) return this.MESSAGES.DECIMAL;
    if (errors['date']) return this.MESSAGES.DATE;
    if (errors['time']) return this.MESSAGES.TIME;
    if (errors['url']) return this.MESSAGES.URL;
    if (errors['postalCode']) return this.MESSAGES.POSTAL_CODE;
    if (errors['currency']) return this.MESSAGES.CURRENCY;
    if (errors['percentage']) return this.MESSAGES.PERCENTAGE;
    if (errors['futureDate']) return this.MESSAGES.FUTURE_DATE;
    if (errors['pastDate']) return this.MESSAGES.PAST_DATE;
    if (errors['dateRange']) return this.MESSAGES.DATE_RANGE;
    if (errors['timeRange']) return this.MESSAGES.TIME_RANGE;
    if (errors['confirmPassword']) return this.MESSAGES.CONFIRM_PASSWORD;
    if (errors['minlength'])
      return this.MESSAGES.MIN_LENGTH(errors['minlength'].requiredLength);
    if (errors['maxlength'])
      return this.MESSAGES.MAX_LENGTH(errors['maxlength'].requiredLength);
    if (errors['min']) return this.MESSAGES.MIN_VALUE(errors['min'].min);
    if (errors['max']) return this.MESSAGES.MAX_VALUE(errors['max'].max);
    if (errors['pattern']) return this.MESSAGES.PATTERN_MISMATCH;

    return `${fieldName} is invalid`;
  }

  // Check if field has error
  hasError(control: AbstractControl): boolean {
    return !!(control.errors && control.touched);
  }

  // Check if field is valid
  isValid(control: AbstractControl): boolean {
    return !!(control.valid && control.touched);
  }

  // Get field status class
  getFieldStatusClass(control: AbstractControl): string {
    if (!control.touched) return '';
    return this.hasError(control)
      ? 'is-invalid'
      : this.isValid(control)
      ? 'is-valid'
      : '';
  }
}
