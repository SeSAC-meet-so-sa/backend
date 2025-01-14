import { IsOptional, IsString } from 'class-validator';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  keyword?: string; // 검색 키워드

  @IsOptional()
  @IsString()
  sortBy?: string; // 정렬 기준 (예: username)

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'; // 정렬 순서

  @IsOptional()
  page?: number; // 페이지 번호

  @IsOptional()
  limit?: number; // 페이지당 결과 수
}
