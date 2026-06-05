let counter = 0;

export function nextElementId() {
  counter++;
  return 'json-form-id' + counter;
}
