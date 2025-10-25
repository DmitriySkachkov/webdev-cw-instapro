import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
  let description = "";

  const render = () => {
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="form">
        <h3 class="form-title">Добавить пост</h3>
        <div class="form-inputs">
          <div class="upload-image-container">Загрузка изображения...</div>
          <textarea 
            id="description-input" 
            class="input textarea" 
            placeholder="Описание фотографии"
            rows="4"
          >${description}</textarea>
          <button class="button" id="add-button">Добавить пост</button>
        </div>
      </div>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange: (newImageUrl) => {
        imageUrl = newImageUrl;
      },
    });

    const descriptionInput = document.getElementById("description-input");
    descriptionInput.addEventListener("input", (e) => {
      description = e.target.value;
    });

    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl) {
        alert("Не выбрана фотография");
        return;
      }

      if (!description.trim()) {
        alert("Добавьте описание фотографии");
        return;
      }

      onAddPostClick({
        description: description.trim(),
        imageUrl: imageUrl,
      });
    });
  };

  render();
}