// import { PartialType } from '@nestjs/swagger';
// import { CreateSeriesDto } from './create-series.dto';

// export class UpdateSeriesDto extends PartialType(CreateSeriesDto) {}

// update-food-recipe.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createSerieSchema } from './create-series.dto';
// import { Rating } from '../entities/series.entity';

export const updateSerieSchema = createSerieSchema
  .extend({
    id: z.number().int().min(1, 'id is required'),
    title: z.string().min(1, 'name is required').optional(),
    year: z
      .number()
      .int()
      .min(1888, 'year is invalid')
      .max(new Date().getFullYear(), 'year is invalid')
      .optional(),
    description: z.string().min(1, 'description is required').optional(),
    recommendScore: z.number().min(0).max(10).optional(),
    // rating: z.enum(Rating).optional(),
    avgReviewScore: z.number().min(0).max(10).optional(),
    reviewCount: z.number().min(0).optional(),
    createdById: z.number().int().min(1, 'createdById is required').optional(),
  })
  .strict();

export class UpdateSeriesDto extends createZodDto(updateSerieSchema) {}
