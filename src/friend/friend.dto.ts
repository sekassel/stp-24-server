import {ApiProperty} from '@nestjs/swagger';
import {IsEnum} from 'class-validator';

export class UpdateFriendDto {
  @ApiProperty({enum: ['accepted', 'requested']})
  @IsEnum(['accepted', 'requested'])
  status: 'accepted' | 'requested';
}
