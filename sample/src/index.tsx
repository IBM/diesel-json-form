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

// @ts-ignore
import './style.scss';
import {
  defaultSchemaService,
  parseJsonValueUnsafe,
  JsonForm,
  Renderer,
} from '@diesel-parser/json-form';

import '@carbon/web-components/es/index.js';
import { issueTrackerJson, IssueTrackerSchema } from './issuetracker_sample';

const jsonForm = document.getElementById('json-form') as JsonForm;

const schema = parseJsonValueUnsafe(IssueTrackerSchema);

const value = parseJsonValueUnsafe(issueTrackerJson);

const renderer: Renderer = new Renderer();

// renderer.addCustomRenderer('RatingRenderer', () => {
//   return new RatingRenderer();
// });

jsonForm.initialize(renderer, defaultSchemaService, schema, value);
