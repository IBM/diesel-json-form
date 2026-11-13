import {
  defaultSchemaService,
  SchemaServiceWorker,
} from '@diesel-parser/json-form';

const myWorker = new SchemaServiceWorker(defaultSchemaService);

myWorker.init();
