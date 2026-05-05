import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login as loginThunk, clearError } from "../../store/slices/authSlice";
import { useAppDispatch, type RootState } from "../../store";
import styles from "./LoginPage.module.css";

const LoginPage: React.FC = () => {
  // Переименовали email в loginValue, чтобы соответствовать API
  // и не конфликтовать с импортированным экшеном login
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector(
    (state: RootState) => state.auth,
  );

  // Редирект при успешной авторизации
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true }); // replace: true не дает вернуться на страницу логина по кнопке "Назад"
    }
  }, [token, navigate]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Отправляем ключ login, как того ждет наш backend
    dispatch(loginThunk({ login: loginValue, password }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(e.target.value);
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h2 className={styles.title}>Вход в систему</h2>

        {/* Отображение ошибки */}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Логин:
            </label>
            <input
              type="text"
              id="login"
              className={styles.input}
              value={loginValue}
              onChange={(e) => handleInputChange(e, setLoginValue)}
              disabled={isLoading} // Блокируем ввод во время загрузки
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль:
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => handleInputChange(e, setPassword)}
              disabled={isLoading} // Блокируем ввод во время загрузки
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading || !loginValue.trim() || !password.trim()}
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
