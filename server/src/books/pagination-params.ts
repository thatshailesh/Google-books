import { IsNumber, Min, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
 
export class PaginationParams {
    @IsNotEmpty()
    query: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;
}