import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() request: { user: LoggedInDto },
  ) {
    return this.reviewsService.create(createReviewDto, request.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('series/:id')
  bySeriesId(@Param('id') id: string, @Req() request: { user: LoggedInDto }) {
    return this.reviewsService.findBySeries(+id, request.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:id')
  byUserId(@Param('id') id: string) {
    return this.reviewsService.findByUser(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() request: { user: LoggedInDto },
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(+id, updateReviewDto, request.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: { user: LoggedInDto }) {
    return this.reviewsService.remove(+id, request.user);
  }
}
