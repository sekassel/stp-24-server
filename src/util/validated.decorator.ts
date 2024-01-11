import {applyDecorators, UsePipes, ValidationPipe} from '@nestjs/common';
import {ApiBadRequestResponse} from '@nestjs/swagger';

export const VALIDATION_PIPE = new ValidationPipe({
  whitelist: true,
  transform: true,
});

export function Validated() {
  return applyDecorators(
    UsePipes(VALIDATION_PIPE),
    ApiBadRequestResponse({
      description: 'Validation failed.',
    }),
  );
}
