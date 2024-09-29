import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { isAfter, isEqual, parseISO, isValid } from 'date-fns';

@ValidatorConstraint({ name: 'isNotEarlierThanStartDate', async: false })
export class IsNotEarlierThanStartDate implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const startDateStr = (args.object as any).startDate || (args.object as any).proposedStartDate;
    if (!startDateStr || !endDate) {
      return false; 
    }

    const startDate = parseISO(startDateStr);
    const endDateParsed = parseISO(endDate);

    if (!isValid(startDate) || !isValid(endDateParsed)) {
      return false;
    }

    return isAfter(endDateParsed, startDate) || isEqual(endDateParsed, startDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must not be earlier than start date';
  }
}