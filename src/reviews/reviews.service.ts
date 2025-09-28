import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

  findByUser(userId: number) {
    return this.repository.find({
      where: { createdBy: { id: userId } },
      relations: ['forSeries'],
    });
  }

  // update(id: number, updateReviewDto: UpdateReviewDto) {
  //   return `This action updates a #${id} review`;
  // }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    loggedInDto: LoggedInDto,
  ) {
    const review = await this.repository.find({
      where: { id },
      relations: ['createdBy'],
    });

    if (review.length === 0) {
      throw new NotFoundException(`Review with ID ${id} not found.`);
    }

    if (review[0].createdBy.id !== loggedInDto.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this review.',
      );
    }

    return this.repository.update(id, updateReviewDto);
  }

  // remove(id: number) {
  //   return `This action removes a #${id} review`;
  // }

  async remove(id: number, loggedInDto: LoggedInDto) {
    const review = await this.repository.find({
      where: { id },
      relations: ['createdBy'],
    });
    if (review.length === 0) {
      throw new NotFoundException(`Review with ID ${id} not found.`);
    }

    if (review[0].createdBy.id !== loggedInDto.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this review.',
      );
    }

    await this.repository.delete(id);
    return { message: `Review with ID ${id} has been deleted.` };
  }
}
