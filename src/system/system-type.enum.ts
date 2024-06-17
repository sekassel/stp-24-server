export enum SystemType {
  EXPLORED = 'explored',
  COLONIZED = 'colonized',
  UPGRADED = 'upgraded',
  DEVELOPED = 'developed',
}

const nextSystemType: { [key in SystemType]?: SystemType } = {
  [SystemType.EXPLORED]: SystemType.COLONIZED,
  [SystemType.COLONIZED]: SystemType.UPGRADED,
  [SystemType.UPGRADED]: SystemType.DEVELOPED,
};

export function getNextSystemType(currentType: SystemType): SystemType | undefined {
  return nextSystemType[currentType];
}
