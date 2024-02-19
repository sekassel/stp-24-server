import { Module } from '@nestjs/common';
import { PresetsController } from './presets.controller';

@Module({
  controllers: [PresetsController]
})
export class PresetsModule {}
