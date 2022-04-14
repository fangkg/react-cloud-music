import axios from "axios";

export const baseUrl = "http://192.168.1.103:3300";

// axios实例及拦截器配置
const axiosInstance = axios.create({
    baseUrl: baseUrl
})

axiosInstance.interceptors.response.use(
    res => res.data,
    err => { console.log({err})}
);

export {
    axiosInstance
}
