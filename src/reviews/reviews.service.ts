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

  async create(createReviewDto: CreateReviewDto, loggedInDto: LoggedInDto) {
    const review = this.repository.create({
      ...createReviewDto,
      forSeries: { id: createReviewDto.forSeriesId } as { id: number },
      createdBy: { id: loggedInDto.id } as {
        id: number;
      },
    });
    await this.repository.save(review);

    // Update the average score of the series after creating the review
    await this.UpdateAvgScore(createReviewDto.forSeriesId);

    return this.repository.findOne({
      where: { id: review.id },
      relations: ['createdBy', 'forSeries'],
    });
  }

  findOne(id: number) {
    return this.repository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['createdBy', 'forSeries'],
    });
  }

  findBySeries(seriesId: number, loggedInDto: LoggedInDto) {
    if (!loggedInDto?.id || !loggedInDto?.username) {
      throw new UnauthorizedException('You must be logged in to view reviews.');
    }

    return this.repository.find({
      where: { forSeries: { id: seriesId }, deletedAt: undefined },
      relations: ['createdBy'],
    });
  }

  findByUser(userId: number) {
    return this.repository.find({
      where: { createdBy: { id: userId }, deletedAt: undefined },
      relations: ['forSeries'],
    });
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    loggedInDto: LoggedInDto,
  ) {
    const review = await this.repository.find({
      where: { id, deletedAt: undefined },
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

    const result = await this.repository.update(id, updateReviewDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Review with ID ${id} not found.`);
    }

    // Update the average score of the series after updating the review
    await this.UpdateAvgScore(review[0].forSeries.id);

    return this.repository.findOne({
      where: { id },
      relations: ['createdBy', 'forSeries'],
    });
  }

  async remove(id: number, loggedInDto: LoggedInDto) {
    const review = await this.repository.find({
      where: { id, deletedAt: undefined },
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

    // Soft delete the review
    await this.repository.softDelete(id);

    // Update the average score of the series after deleting the review
    await this.UpdateAvgScore(review[0].forSeries.id);

    return { message: `Review with ID ${id} has been deleted.` };
  }

  // Get avgScore methods the average score for a series based on its reviews
  async GetAvgScore(seriesId: number) {
    const reviews = await this.repository.find({
      where: { forSeries: { id: seriesId } },
    });

    if (reviews.length === 0) {
      throw new NotFoundException(
        `No reviews found for series with ID ${seriesId}.`,
      );
    }

    const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
    // Round to 4 decimal places
    const avgReviewScore =
      Math.round((totalScore / reviews.length) * 10000) / 10000;

    return { avgReviewScore: avgReviewScore, reviewCount: reviews.length };
  }

  // UpdateAvgScore method to update the average score of a series
  async UpdateAvgScore(seriesId: number) {
    // Check if there are any reviews for the series
    const reviews = await this.repository.find({
      where: { forSeries: { id: seriesId }, deletedAt: undefined },
    });
    if (reviews.length === 0) {
      throw new NotFoundException(
        `No reviews found for series with ID ${seriesId}.`,
      );
    }

    // Calculate the new average score
    const { avgReviewScore, reviewCount } = await this.GetAvgScore(seriesId);

    // Update the series with the new average score
    const result = await this.repository
      .createQueryBuilder()
      .update('series')
      .set({ avgReviewScore, reviewCount })
      .where('id = :id', { id: seriesId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`Series with ID ${seriesId} not found.`);
    }

    return {
      message: `Average score for series with ID ${seriesId} updated to ${avgReviewScore}.`,
    };
  }
}
