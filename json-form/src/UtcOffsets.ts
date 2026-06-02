function getOffset(timeZone: string): readonly string[] {
  const timeZoneAbbrivation = new Intl.DateTimeFormat('en', {
    timeZone: timeZone,
    timeZoneName: 'longOffset',
  })
    .formatToParts()
    .find((part) => part.type === 'timeZoneName')?.value;
  if (!timeZoneAbbrivation) {
    throw new Error('no timeZoneName for timeZone');
  }

  const i = timeZoneAbbrivation.indexOf('GMT');
  if (i > -1) {
    const s = timeZoneAbbrivation.substring(i + 3);
    if (s === '') {
      return ['+00:00'];
    }
    return [s];
  } else {
    return [];
  }
}

export function getUtcOffsets(): readonly string[] {
  const res = Intl.supportedValuesOf('timeZone').flatMap(getOffset);
  const dedup = [...new Set(res)];
  const sorted = dedup.sort(sortOffsets);
  return sorted;
}

function convertToInt(offset: string): number {
  const s = offset.replace(':', '');
  const i = parseInt(s);
  return isNaN(i) ? 0 : i;
}

function sortOffsets(o1: string, o2: string): number {
  return convertToInt(o1) - convertToInt(o2);
}

export const allOffsets = getUtcOffsets();

// const timezonesWithoffsets =  Intl.supportedValuesOf('timeZone').map(timeZone => {
//   const offset=new Intl.DateTimeFormat('en',{timeZone:timeZone, timeZoneName:'longOffset'}).formatToParts().find(part => part.type==='timeZoneName').value
//   const offset=new Intl.DateTimeFormat('en',{timeZone:timeZone, timeZoneName:'long'}).formatToParts().find(part => part.type==='timeZoneName').value
//   return `${timeZone} - ${offset}`
// })

//   const offset = new Intl.DateTimeFormat('en', {
//     timeZone: timeZone,
//     timeZoneName: 'longOffset',
//   })
//     .formatToParts()
//     .find((part) => part.type === 'timeZoneName')?.value;
//   if (!offset) {
//     throw new Error('no offset for timezone ' + timeZone);
//   }
