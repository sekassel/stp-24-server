import {Controller, NotFoundException, StreamableFile} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import * as  fs from 'node:fs';
import {Throttled} from "../../util/throttled.decorator";

@Controller('presets')
@ApiTags('Presets')
@Throttled()
export class PresetsController {
  private async stream(folder: string, filename: string) {
    const path = folder + filename;
    if (!(await fs.promises.access(path).then(() => true, () => false))) {
      throw new NotFoundException(filename);
    }
    return new StreamableFile(fs.createReadStream(path));
  }
}
