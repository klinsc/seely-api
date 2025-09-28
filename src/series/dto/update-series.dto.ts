import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createSerieSchema } from './create-series.dto';

export const updateSerieSchema = createSerieSchema
  .extend({
    title: z.string().min(1, 'name is required').optional(),
    year: z
      .number()
      .int()
      .min(1888, 'year is invalid')
      .max(new Date().getFullYear(), 'year is invalid')
      .optional(),
    description: z.string().min(1, 'description is required').optional(),
    ratingId: z
      .number()
      .int()
      .min(1, 'ratingId is required')
      .max(6, 'ratingId is invalid'),
    recommendScore: z.number().min(0).max(10).optional(),
    // avgReviewScore: z.number().min(0).max(10).optional(),
    reviewCount: z.number().min(0).optional(),
  })
  .strict();

export class UpdateSeriesDto extends createZodDto(updateSerieSchema) {}
