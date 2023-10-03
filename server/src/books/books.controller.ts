import { Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { PaginationParams } from './pagination-params';

@Controller('books')
export class BooksController {
    constructor(private readonly bookservice: BooksService) {}

    @Get()
    searchBook(@Query() {query, skip, limit}: PaginationParams) {
        return this.bookservice.searchBooks(query, skip, limit)
    }
}
