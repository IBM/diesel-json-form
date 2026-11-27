// imports from dist to avoid pulling all of json-form into the worker
import { defaultSchemaService } from '@diesel-parser/json-form/dist/SchemaService';
import { SchemaServiceWorker } from '@diesel-parser/json-form/dist/worker/SchemaServiceWorker';

const myWorker = new SchemaServiceWorker(defaultSchemaService);

myWorker.init();
