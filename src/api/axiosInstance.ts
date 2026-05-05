import axios from "axios";

// Создаем инстанс Axios
const api = axios.create({
  baseURL: "https://arlenback-production.up.railway.app",
});

// Request interceptor: добавляем токен авторизации ко всем запросам
api.interceptors.request.use(
  (config) => {
    const persistData = localStorage.getItem("persist:token");

    const persistedAuth = JSON.parse(persistData as string);
    const token = JSON.parse(persistedAuth.token);
    console.log(token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: глобальная обработка ошибок (например, протухший токен)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Получаем URL запроса, который вызвал ошибку
    const originalRequestUrl = error.config?.url || "";

    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403;

    // Игнорируем 401/403 ошибки, если они пришли от эндпоинта логина
    const isLoginRequest =
      originalRequestUrl.includes("/signin") ||
      originalRequestUrl.includes("/login");

    if (isAuthError && !isLoginRequest) {
      // Токен действительно протух или невалиден, очищаем данные
      localStorage.removeItem("persist:token");

      // Жесткий редирект на страницу входа.
      // Выполняется только если ошибка произошла ВНЕ формы логина.
      window.location.href = "/login";
    }

    // Пробрасываем ошибку дальше, чтобы её мог поймать Redux (thunk) или компонент
    return Promise.reject(error);
  },
);

export default api;
