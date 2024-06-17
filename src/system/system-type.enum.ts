import {SystemUpgradeName} from "../game-logic/system-upgrade";

const nextSystemType: Partial<Record<SystemUpgradeName, SystemUpgradeName>> = {
  explored: 'colonized',
  colonized: 'upgraded',
  upgraded: 'developed',
};

export function getNextSystemType(currentType: SystemUpgradeName): SystemUpgradeName | undefined {
  return nextSystemType[currentType];
}
