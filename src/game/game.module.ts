import {Module} from '@nestjs/common';
import {PresetsModule} from './presets/presets.module';

@Module({
  imports: [
    PresetsModule,
  ],
})
export class GameModule {
}
