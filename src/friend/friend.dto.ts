import {ApiProperty} from '@nestjs/swagger';
import {IsEnum} from 'class-validator';

export enum FriendStatus {
  ACCEPTED = 'accepted',
  REQUESTED = 'requested',
}

export class UpdateFriendDto {
  @ApiProperty({enum: FriendStatus, enumName: 'FriendStatus'})
  @IsEnum(FriendStatus)
  status: FriendStatus;
}
