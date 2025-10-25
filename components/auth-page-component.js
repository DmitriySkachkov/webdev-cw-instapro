import { loginUser, registerUser } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAuthPageComponent({ appEl, setUser }) {
  let isLoginMode = true;
  let imageUrl = "";

  const renderForm = () => {
    const appHtml = `
      <div class="page-container">
          <div class="header-container"></div>
          <div class="form">
              <h3 class="form-title">
                ${isLoginMode ? "Вход в Instapro" : "Регистрация в Instapro"}
              </h3>
              <div class="form-inputs">
                  ${
                    !isLoginMode
                      ? `
                      <div class="upload-image-container">Выберите фото профиля</div>
                      <input type="text" id="name-input" class="input" placeholder="Имя" />
                      `
                      : ""
                  }
                  <input type="text" id="login-input" class="input" placeholder="Логин" />
                  <input type="password" id="password-input" class="input" placeholder="Пароль" />
                  <div class="form-error"></div>
                  <button class="button" id="login-button">${
                    isLoginMode ? "Войти" : "Зарегистрироваться"
                  }</button>
              </div>
              <div class="form-footer">
                <p class="form-footer-title">
                  ${isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                  <button class="link-button" id="toggle-button">
                    ${isLoginMode ? "Зарегистрироваться." : "Войти."}
                  </button>
                </p>
              </div>
          </div>
      </div>    
    `;

    appEl.innerHTML = appHtml;

    const setError = (message) => {
      const errorEl = appEl.querySelector(".form-error");
      errorEl.textContent = message;
    };

    const setLoading = (isLoading) => {
      const button = appEl.querySelector("#login-button");
      if (isLoading) {
        button.disabled = true;
        button.textContent = "Загрузка...";
      } else {
        button.disabled = false;
        button.textContent = isLoginMode ? "Войти" : "Зарегистрироваться";
      }
    };

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    if (uploadImageContainer) {
      renderUploadImageComponent({
        element: uploadImageContainer,
        onImageUrlChange(newImageUrl) {
          imageUrl = newImageUrl;
        },
      });
    }

    document.getElementById("login-button").addEventListener("click", () => {
      setError("");
      setLoading(true);

      const login = document.getElementById("login-input").value.trim();
      const password = document.getElementById("password-input").value;

      if (isLoginMode) {
        if (!login) {
          setError("Введите логин");
          setLoading(false);
          return;
        }

        if (!password) {
          setError("Введите пароль");
          setLoading(false);
          return;
        }

        loginUser({ login, password })
          .then((user) => {
            setUser(user.user);
          })
          .catch((error) => {
            console.warn(error);
            setError(error.message);
            setLoading(false);
          });
      } else {
        const name = document.getElementById("name-input").value.trim();

        if (!name) {
          setError("Введите имя");
          setLoading(false);
          return;
        }

        if (!login) {
          setError("Введите логин");
          setLoading(false);
          return;
        }

        if (!password) {
          setError("Введите пароль");
          setLoading(false);
          return;
        }

        if (!imageUrl) {
          setError("Не выбрана фотография профиля");
          setLoading(false);
          return;
        }

        if (password.length < 3) {
          setError("Пароль должен содержать минимум 3 символа");
          setLoading(false);
          return;
        }

        registerUser({ login, password, name, imageUrl })
          .then((user) => {
            setUser(user.user);
          })
          .catch((error) => {
            console.warn(error);
            setError(error.message);
            setLoading(false);
          });
      }
    });

    document.getElementById("toggle-button").addEventListener("click", () => {
      isLoginMode = !isLoginMode;
      renderForm();
    });

    // Автофокус на первом поле
    const firstInput = appEl.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  };

  renderForm();
}