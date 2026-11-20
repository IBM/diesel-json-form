import { defaultSchemaService } from '../../json-form/src/SchemaService';
import { SchemaServiceWorker } from '../../json-form/src/worker/SchemaServiceWorker';

// import {
//   defaultSchemaService,
//   SchemaServiceWorker,
// } from '@diesel-parser/json-form';

const myWorker = new SchemaServiceWorker(defaultSchemaService);

myWorker.init();
