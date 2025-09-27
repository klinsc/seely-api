import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { paginateConfig, SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createSeriesDto: CreateSeriesDto,
    @Req() request: { user: LoggedInDto },
  ) {
    return this.seriesService.create(createSeriesDto, request.user);
  }

  @ApiPaginationQuery(paginateConfig)
  // Add with config
  @Get()
  search(@Paginate() query: PaginateQuery) {
    return this.seriesService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seriesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeriesDto: UpdateSeriesDto,
    @Req() request: { user: LoggedInDto },
  ) {
    return this.seriesService.update(id, updateSeriesDto, request.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seriesService.remove(+id);
  }
}
