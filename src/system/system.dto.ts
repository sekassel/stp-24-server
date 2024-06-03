import {ApiProperty, PartialType, PickType} from '@nestjs/swagger';
import {System} from './system.schema';
import {DistrictName, DISTRICTS} from '../game-logic/districts';
import {BuildingName} from '../game-logic/buildings';

export class UpdateSystemDto extends PartialType(PickType(System, [
  'name',
  'upgrade',
  'owner',
  'districts',
  'buildings',
  '_public',
] as const)) {
  @ApiProperty({
    description: 'Build or destroy districts. Positive values build, negative values destroy.',
    example: {
      'energy': +1,
      'mining': -1,
    },
    type: 'object',
    properties: Object.fromEntries(Object.keys(DISTRICTS).map(id => [id, {
      type: 'integer',
      default: 0,
      required: false,
    }])) as any,
  })
  districts?: Partial<Record<DistrictName, number>>;

  @ApiProperty({
    description: 'Update (build, destroy, reorder) buildings in the system. ' +
      'This value will be the resulting list, so existing buildings must be specified as well.',
  })
  buildings?: BuildingName[];
}
