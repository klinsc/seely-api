import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateReviewSchema = z.object({
  forSeriesId: z.number().int().positive(),
  score: z.number().min(1).max(10),
  comment: z.string().max(500),
});

export class CreateReviewDto extends createZodDto(CreateReviewSchema) {}
