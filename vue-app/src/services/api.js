import axios from "axios";

const api = axios.create({
  baseURL: mydata.baseUrl,
  headers: {
    Accept: "application/json",
  },
});

// /api/v2/[entity]/[content_type]

export function getListUser(parameters = null) {
  let path = "/api/v2/users";
  if (parameters) {
    path = path + "&" + parameters;
  }
  return api.get(path);
}

export function getLists(entity, content_type, parameters = null) {
  let path = "/api/v2/" + entity + "/" + content_type;
  if (parameters) {
    path = path + "?" + parameters;
  }
  return api.get(path);
}

export function getDetails(entity, content_type, id, parameters = null) {
  let path = "/api/v2/" + entity + "/" + content_type + "/" + id;
  if (parameters) {
    path = path + "?" + parameters;
  }
  return api.get(path);
}

export function saveItem(newItem) {
  let path = "/crud/save";
  return api.post(path, newItem);
}

export function deleteItem(entity, id) {
  let path = `/confirm/${entity}/${id}/delete`;
  return api.get(path);
}
