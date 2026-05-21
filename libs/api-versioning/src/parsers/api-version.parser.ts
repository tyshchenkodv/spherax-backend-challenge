import { UnsupportedApiVersionError } from '@lib/common';

import { DEFAULT_API_VERSION, SUPPORTED_API_VERSIONS } from '../constants/api-version.constants';
import type { ApiVersion } from '../types/api-version.types';

export function parseApiVersion(value: string | string[] | undefined): ApiVersion {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.trim() ?? String(DEFAULT_API_VERSION);
  const parsedValue = Number(normalizedValue);

  if (SUPPORTED_API_VERSIONS.includes(parsedValue as ApiVersion)) {
    return parsedValue as ApiVersion;
  }

  throw new UnsupportedApiVersionError(normalizedValue);
}
