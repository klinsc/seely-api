import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createSerieSchema = z
  .object({
    title: z.string().min(1, 'name is required'),
    year: z
      .number()
      .int()
      .min(1888, 'year is invalid')
      .max(new Date().getFullYear(), 'year is invalid'),
    description: z.string().min(1, 'description is required'),
    rating_id: z
      .number()
      .int()
      .min(1, 'ratingId is required')
      .max(6, 'ratingId is invalid'),
    recommendScore: z.number().min(0).max(10),
    avgReviewScore: z.number().min(0).max(10).optional().default(0),
    reviewCount: z.number().min(0).optional().default(0),
    createdById: z.number().int().min(1, 'createdById is required'),
  })
  .strict();

export class CreateSeriesDto extends createZodDto(createSerieSchema) {}
