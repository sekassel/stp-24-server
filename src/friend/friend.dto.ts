import {ApiProperty} from '@nestjs/swagger';
import {IsEnum} from 'class-validator';

export class UpdateFriendDto {
  @ApiProperty({enum: ['requested', 'accepted']})
  @IsEnum(['requested', 'accepted'])
  status: 'requested' | 'accepted';
}
