import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // base URL
});

export default instance;