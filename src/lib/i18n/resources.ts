// Static imports for all JSON files
import enCommon from '@/locales/en-US/common.json';
import enCalibration from '@/locales/en-US/calibration.json';
import enQuality from '@/locales/en-US/quality.json';

import zhCommon from '@/locales/zh-TW/common.json';
import zhCalibration from '@/locales/zh-TW/calibration.json';
import zhQuality from '@/locales/zh-TW/quality.json';

import cnCommon from '@/locales/zh-CN/common.json';
import cnCalibration from '@/locales/zh-CN/calibration.json';
import cnQuality from '@/locales/zh-CN/quality.json';

export const resources = {
  'zh-TW': {
    common: zhCommon,
    calibration: zhCalibration,
    quality: zhQuality,
  },
  'en-US': {
    common: enCommon,
    calibration: enCalibration,
    quality: enQuality,
  },
  'zh-CN': {
    common: cnCommon,
    calibration: cnCalibration,
    quality: cnQuality,
  },
  // Aliases for compatibility
  'zh': {
    common: zhCommon,
    calibration: zhCalibration,
    quality: zhQuality,
  },
  'en': {
    common: enCommon,
    calibration: enCalibration,
    quality: enQuality,
  },
};
