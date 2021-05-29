import axios from 'axios'
import qs from 'qs'

const instance = axios.create({
  timeout: 1000 * 60
})

instance.interceptors.request.use(config => {
  config.headers['token'] = localStorage.token
  return config
})

const baseUrl = {
  isOnline: false,
  base_url: 'https://www.equator8848.xyz/express',
}


function urlEncoderPost(url, dataObject) {
  return new Promise((resolve, reject) => {
    instance.post(url, qs.stringify(dataObject))
      .then(response => {
        resolve(response.data)
      }).catch(error => {
      alert("异常：" + error);
    })
  })
}

function urlEncoderPut(url, dataObject) {
  return new Promise((resolve, reject) => {
    instance.put(url, qs.stringify(dataObject))
      .then(response => {
        resolve(response.data)
      }).catch(error => {
      alert("异常：" + error);
    })
  })
}

function formDataPost(url, formDataObject) {
  return new Promise((resolve, reject) => {
    instance.post(url, formDataObject, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      alert("异常：" + error);
    })
  })
}

function jsonPost(url, formDataObject) {
  return new Promise((resolve, reject) => {
    instance.post(url, formDataObject, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      alert("异常：" + error);
    })
  })
}


function get(url, parameters) {
  return new Promise(((resolve, reject) => {
      instance.get(url, {
        params: {...parameters}
      }).then(response => {
        resolve(response.data)
      }).catch(error => {
        alert("异常：" + error);
      })
    })
  )
}

export default {
  get(url, parameters) {
    return get(baseUrl.base_url + url, parameters)
  },
  urlEncoderPost(url, dataObject) {
    return urlEncoderPost(baseUrl.base_url + url, dataObject);
  },
  urlEncoderPut(url, dataObject) {
    return urlEncoderPut(baseUrl.base_url + url, dataObject);
  },
  jsonPost(url, dataObject) {
    return jsonPost(baseUrl.base_url + url, dataObject);
  },
  formDataPost(url, formData) {
    return jsonPost(baseUrl.base_url + url, formData);
  }
}
