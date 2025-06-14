export enum RegionCode {
    TPE = 'TPE',
    KHH = 'KHH',
    TNN = 'TNN',
    TCH = 'TCH',
    HSZ = 'HSZ',
    TAO = 'TAO',
    ILA = 'ILA',
    HUA = 'HUA',
    TTT = 'TTT',
    PIF = 'PIF',
}

export const RegionCodeLabel: Record<RegionCode, string> = {
    [RegionCode.TPE]: '台北',
    [RegionCode.KHH]: '高雄',
    [RegionCode.TNN]: '台南',
    [RegionCode.TCH]: '台中',
    [RegionCode.HSZ]: '新竹',
    [RegionCode.TAO]: '桃園',
    [RegionCode.ILA]: '宜蘭',
    [RegionCode.HUA]: '花蓮',
    [RegionCode.TTT]: '台東',
    [RegionCode.PIF]: '屏東',
};
