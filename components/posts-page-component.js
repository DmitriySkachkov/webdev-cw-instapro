import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { formatDate, initLikeButtonHandlers } from "../helpers.js";

export function renderPostsPageComponent({ appEl }) {
  console.log("Актуальный список постов:", posts);

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${posts.map(post => {
          if (!post || !post.user) {
            console.error("Некорректный пост:", post);
            return '';
          }
          return `
          <li class="post">
            <div class="post-header" data-user-id="${post.user.id}">
                <img src="${post.user.imageUrl}" class="post-header__user-image">
                <p class="post-header__user-name">${post.user.name}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button">
                <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}" alt="${post.isLiked ? 'Убрать лайк' : 'Поставить лайк'}">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${post.likes ? post.likes.length : 0}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${post.user.name}</span>
              ${post.description}
            </p>
            <p class="post-date">
              ${formatDate(post.createdAt)}
            </p>
          </li>
        `}).join('')}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  initLikeButtonHandlers({
    appEl,
    posts,
    user,
    onLikeUpdate: async (postId, postIndex) => {
      const token = `Bearer ${user.token}`;
      const post = posts[postIndex];

      try {
        let response;
        if (post.isLiked) {
          response = await dislikePost({ token, postId });
        } else {
          response = await likePost({ token, postId });
        }
        
        console.log("Ответ от API:", response);
        
        if (response && response.post) {
          posts[postIndex] = response.post;
        } else if (response) {
          posts[postIndex] = response;
        } else {
          throw new Error("Пустой ответ от сервера");
        }
        
        renderPostsPageComponent({ appEl });
      } catch (error) {
        console.error("Ошибка при лайке:", error);
        alert("Не удалось обновить лайк: " + error.message);
      }
    }
  });
}