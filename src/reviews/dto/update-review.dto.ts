import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { createZodDto } from 'nestjs-zod';

const UpdateReviewSchema = CreateReviewDto.schema.partial();

export class UpdateReviewDto extends PartialType(
  createZodDto(UpdateReviewSchema),
) {}
