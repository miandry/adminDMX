// Construction parametre url
// field a utiliser
// filter, sort, pager

export function buildQueryParams(options) {
  const params = new URLSearchParams();

  // Fields
  if (options.fields?.length) {
    options.fields.forEach((f) => params.append("fields[]", f));
  }

  // Sort
  if (options.sort?.val && options.sort?.op) {
    params.append("sort[val]", options.sort.val);
    params.append("sort[op]", options.sort.op);
  }

  // Filters
  if (options.filters && Object.keys(options.filters).length > 0) {
    for (const [key, filter] of Object.entries(options.filters)) {
      if (
        filter?.val !== null &&
        filter?.val !== undefined &&
        filter?.val !== ""
      ) {
        params.append(`filters[${key}][val]`, filter.val);
        if (filter.op) params.append(`filters[${key}][op]`, filter.op);
      }
    }
  }

  // Values dynamiques pour n'importe quel champ
  if (options.values) {
    for (const [field, arr] of Object.entries(options.values)) {
      if (Array.isArray(arr)) {
        arr.forEach((v) => params.append(`values[${field}][]`, v));
      }
    }
  }

  // Pagination
  params.append("pager", options.pager);
  params.append("offset", options.offset);

  return params.toString();
}
