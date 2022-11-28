/*
 * Copyright 2018 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import i18n, { TFunction } from 'i18next';
import messagesDe from './Messages_de.json';
import messagesEn from './Messages_en.json';
import messagesEs from './Messages_es.json';
import messagesFr from './Messages_fr.json';
import messagesIt from './Messages_it.json';
import messagesJa from './Messages_ja.json';
import messagesPt from './Messages_pt.json';
import messagesZh from './Messages_zh.json';
import messagesZhTw from './Messages_zh_tw.json';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  de: {
    jsonform: messagesDe,
  },
  en: {
    jsonform: messagesEn,
  },
  es: {
    jsonform: messagesEs,
  },
  fr: {
    jsonform: messagesFr,
  },
  it: {
    jsonform: messagesIt,
  },
  ja: {
    jsonform: messagesJa,
  },
  pt: {
    jsonform: messagesPt,
  },
  zh: {
    jsonform: messagesZh,
  },
  'zh-TW': {
    jsonform: messagesZhTw,
  },
};
export function initMyI18n(lng: string): TFunction {
  const i18n2 = i18n.createInstance(
    {
      resources,
      fallbackLng: 'en',
      initImmediate: false,
      ns: ['jsonform'],
      defaultNS: 'jsonform',
      lng, // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
      // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
      // if you're using a language detector, do not define the lng option
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    },
    () => ({}),
  );
  return i18n2.getFixedT(lng);
}
