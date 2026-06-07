import { getUtcOffsets } from '@diesel-parser/json-form';

export const allOffsets = ['Z'].concat(getUtcOffsets());
