import { uploadImage } from "../api.js";

export function renderUploadImageComponent({ element, onImageUrlChange }) {
  let imageUrl = "";
  let isLoading = false;

  const render = () => {
    element.innerHTML = `
      <div class="upload-image">
        ${
          imageUrl
            ? `
            <div class="file-upload-image-container">
              <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение">
              <button class="file-upload-remove-button button" ${isLoading ? 'disabled' : ''}>${isLoading ? 'Загрузка...' : 'Заменить фото'}</button>
            </div>
            `
            : `
            <label class="file-upload-label secondary-button" ${isLoading ? 'disabled' : ''}>
              <input
                type="file"
                class="file-upload-input"
                accept="image/*"
                style="display:none"
                ${isLoading ? 'disabled' : ''}
              />
              ${isLoading ? 'Загрузка...' : 'Выберите фото'}
            </label>
            <div class="file-upload-hint">Можно загрузить JPG, PNG или GIF</div>
          `
        }
        ${isLoading ? '<div class="upload-progress">Загружаем изображение...</div>' : ''}
      </div>
    `;

    const fileInputElement = element.querySelector(".file-upload-input");
    fileInputElement?.addEventListener("change", () => {
      const file = fileInputElement.files[0];
      if (file) {
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
          alert("Пожалуйста, выберите файл изображения (JPG, PNG, GIF)");
          return;
        }

        // Проверка размера файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Файл слишком большой. Максимальный размер: 5MB");
          return;
        }

        isLoading = true;
        render();

        uploadImage({ file })
          .then(({ fileUrl }) => {
            imageUrl = fileUrl;
            isLoading = false;
            onImageUrlChange(imageUrl);
            render();
          })
          .catch((error) => {
            console.error("Ошибка загрузки изображения:", error);
            alert("Не удалось загрузить изображение. Попробуйте еще раз.");
            isLoading = false;
            render();
          });
      }
    });

    element
      .querySelector(".file-upload-remove-button")
      ?.addEventListener("click", () => {
        if (!isLoading) {
          imageUrl = "";
          onImageUrlChange(imageUrl);
          render();
        }
      });
  };

  render();
}