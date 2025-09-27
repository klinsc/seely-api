import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { Series } from './entities/series.entity';

export const paginateConfig: PaginateConfig<Series> = {
  // Add `export`
  sortableColumns: [
    'title',
    'year',
    'description',
    'recommendScore',
    'avgReviewScore',
    'reviewCount',
  ],
  searchableColumns: ['title', 'year', 'description', 'recommendScore'],
  defaultSortBy: [['title', 'ASC']],
  nullSort: 'last',
};

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series) private repository: Repository<Series>,
  ) {}

  create(createSeriesDto: CreateSeriesDto, loggedInDto: LoggedInDto) {
    return this.repository.save({
      ...createSeriesDto,
      rating: { id: createSeriesDto.ratingId } as { id: number },
      createdBy: { id: loggedInDto.id } as {
        id: number;
      },
    });
  }

  private queryTemplate() {
    return this.repository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.rating', 'rating')
      .leftJoin('series.createdBy', 'createdBy')
      .addSelect('createdBy.id')
      .addSelect('createdBy.username')
      .addSelect('createdBy.role');
  }

  async search(query: PaginateQuery) {
    const page = await paginate<Series>(
      query,
      this.queryTemplate(),
      paginateConfig,
    );

    return {
      data: page.data,
      meta: page.meta,
    };
  }

  findOne(id: number) {
    return this.queryTemplate().where('series.id = :id', { id }).getOne();
  }

  async update(
    id: number,
    updateSeriesDto: UpdateSeriesDto,
    loggedInDto: LoggedInDto,
  ) {
    const series = await this.repository.findOneBy({
      id,
      createdBy: { id: loggedInDto.id },
    });
    if (!series) {
      throw new NotFoundException(
        `Series with ID ${id} not found or you are not authorized to update it.`,
      );
    }
    const updatedSeries = {
      ...series,
      ...updateSeriesDto,
      rating: updateSeriesDto.ratingId
        ? { id: updateSeriesDto.ratingId }
        : series.rating,
    };
    return this.repository.save(updatedSeries);
  }

  remove(id: number) {
    return `This action removes a #${id} series`;
  }
}
