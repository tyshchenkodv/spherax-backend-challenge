import type { SUPPORTED_API_VERSIONS } from '../constants/api-version.constants';

export type ApiVersion = (typeof SUPPORTED_API_VERSIONS)[number];
