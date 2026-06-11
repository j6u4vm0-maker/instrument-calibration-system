import { cookies } from 'next/headers';
import { resources as allResources } from './resources';

import { dictionary } from './translations';

// Helper to get nested value from object
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
}

export async function getTranslation() {
  const cookieStore = await cookies();
  const language = (cookieStore.get('language')?.value) || 'zh-TW';
  
  // Resolve locale folder (map short keys to full keys)
  const locale = language === 'zh' ? 'zh-TW' : (language === 'en' ? 'en-US' : language);

  // We use the pre-loaded resources object directly
  // This avoids importing 'react-i18next' or 'i18next' instance into Server Components
  const resources = (allResources as any)[locale] || (allResources as any)['zh-TW'];
  const fallbackResources = (allResources as any)['en-US'];

  const t = (key: string, params?: Record<string, any>): string => {
    // Attempt to find in current language
    let val = getNestedValue(resources, key);
    if (!val || typeof val !== 'string') {
      // Fallback to en-US
      val = getNestedValue(fallbackResources, key);
    }

    // If still not found, check dictionary from translations.ts
    if (!val || typeof val !== 'string') {
      const parts = key.split('.');
      let current: any = dictionary;
      for (const part of parts) {
        if (!current || current[part] === undefined) {
          current = undefined;
          break;
        }
        current = current[part];
      }
      if (current && typeof current === 'object') {
        const langKey = language.startsWith('zh') ? 'zh' : 'en';
        val = current[langKey];
      }
    }

    if (val && typeof val === 'string') {
      // Simple interpolation: replace {{key}} with params[key]
      if (params) {
        let interpolated = val;
        Object.entries(params).forEach(([k, v]) => {
          interpolated = interpolated.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        });
        return interpolated;
      }
      return val;
    }

    return key;
  };

  return { t, language: locale };
}
