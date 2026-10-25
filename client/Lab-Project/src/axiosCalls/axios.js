import axios from "axios";


export const axiosInstance = axios.create({
    baseURL : 'http://localhost:8090/',
    headers : {
        "Content-Type" : 'application/json'
    },
    withCredentials : true


})