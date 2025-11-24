import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  headers: {
    Accept: 'application/json',
  },
})

// /api/v2/[entity]/[content_type]

  
  export function getListUser(parameters = null) {
    let path = '/api/v2/users' ;
    if(parameters){
        path = path + "&"+parameters ;
    }
    return api.get(path);
  }



  export function getLists(entity,content_type,parameters = null) {
    let path = '/api/v2/'+entity+'/'+content_type ;
    if(parameters){
        path = path + "&"+parameters ;
    }
    return api.get(path);
  }