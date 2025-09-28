import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private repository: Repository<Review>,
  ) {}

  create(createReviewDto: CreateReviewDto, loggedInDto: LoggedInDto) {
    return this.repository.save({
      ...createReviewDto,
      forSeries: { id: createReviewDto.forSeriesId } as { id: number },
      createdBy: { id: loggedInDto.id } as {
        id: number;
      },
    });
  }

  findAll() {
    return `This action returns all reviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  findBySeries(seriesId: number, loggedInDto: LoggedInDto) {
    if (!loggedInDto?.id || !loggedInDto?.username) {
      throw new UnauthorizedException('You must be logged in to view reviews.');
    }

    return this.repository.find({
      where: { forSeries: { id: seriesId } },
      relations: ['createdBy'],
    });
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
