import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsDateStringNotFutureConstraint implements ValidatorConstraintInterface {
  validate(dateString: any, args: ValidationArguments) {
    // Check if it is a string first
    if (typeof dateString !== 'string') {
      return false;
    }

    const date = new Date(dateString);
    // Check if it's a valid date
    if (isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();
    // Compare dates (ignoring time if we strictly want date comparison, but "not future" usually implies < now)
    // Spec says "dob is not in future date".
    // Let's assume strict comparison with current time, or just date.
    // Given it's a DOB, usually only date matters.
    // If input is YYYY-MM-DD, new Date() treats it as UTC midnight.
    // If we compare with new Date() (now), future dates will be > now.

    return date <= now;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Date of birth must not be in the future';
  }
}

export function IsDateStringNotFuture(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateStringNotFutureConstraint,
    });
  };
}
