import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { formatDate, initLikeButtonHandlers } from "../helpers.js";

export function renderUserPostsPageComponent({ appEl, userId }) {
  const userPosts = posts.filter(post => post && post.user && post.user.id === userId);
  
  if (userPosts.length === 0) {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <p>У пользователя пока нет постов</p>
      </div>
    `;
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });
    return;
  }

  const userData = userPosts[0].user;

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="posts-user-header">
        <img src="${userData.imageUrl}" class="posts-user-header__user-image">
        <p class="posts-user-header__user-name">${userData.name}</p>
      </div>
      <ul class="posts">
        ${userPosts.map(post => {
          if (!post || !post.user) {
            console.error("Некорректный пост:", post);
            return '';
          }
          return `
          <li class="post">
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
        
        renderUserPostsPageComponent({ appEl, userId });
      } catch (error) {
        console.error("Ошибка при лайке:", error);
        alert("Не удалось обновить лайк: " + error.message);
      }
    }
  });
}