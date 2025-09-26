import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
// import { Rating } from '../entities/series.entity';

export const createSerieSchema = z
  .object({
    title: z.string().min(1, 'name is required'),
    year: z
      .number()
      .int()
      .min(1888, 'year is invalid')
      .max(new Date().getFullYear(), 'year is invalid'),
    description: z.string().min(1, 'description is required'),
    recommendScore: z.number().min(0).max(10),
    // rating: z.enum(Rating),
    avgReviewScore: z.number().min(0).max(10).optional().default(0),
    reviewCount: z.number().min(0).optional().default(0),
    createdById: z.number().int().min(1, 'createdById is required'),
  })
  .strict();

export class CreateSeriesDto extends createZodDto(createSerieSchema) {}
