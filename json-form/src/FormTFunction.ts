/*
 * IBM Confidential
 * OCO Source Materials
 * 5737-I23 5725-B69
 * Copyright IBM Corp. 2020, 2020-2025
 * The source code for this program is not published or otherwise divested of its trade secrets,
 * irrespective of what has been deposited with the U.S Copyright Office.
 */
import { StringMap, TFunctionKeys, TOptions } from 'i18next';

export interface FormTFunction {
  <
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap,
  >(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> | string,
  ): string;
}
