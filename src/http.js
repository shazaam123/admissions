import axios from 'axios'
import router from './router'

let http = axios.create({
  baseURL: 'http://localhost:5173/api',
  headers: {
    'Content-type': 'application/json'
  }
})
http.interceptors.request.use(config => {
  let token = localStorage.getItem('express_token')
  config.headers['Authorization'] = `Bearer ${token}`
  return config
})
http.interceptors.response.use(response => response, (error) => {
  if (!error.response.data || (!error.response.data.message && !error.response.data.errors)) {
    error.response.data = {
      message: error.response.statusText
    }
  }
  if (error.response.status == 401 && !location.hash) {
    if (router.options.history.state.current != '/login' && router.options.history.state.current != '/logout' && router.options.history.state.current != '/') {
      router.options.history.redirect = router.options.history.location
    }
    router.push('/logout')
  }
  return Promise.reject(error)
})

export default http