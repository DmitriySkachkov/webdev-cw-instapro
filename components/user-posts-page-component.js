import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";

export function renderUserPostsPageComponent({ appEl, userId }) {
  const userPosts = posts.filter(post => post.user.id === userId);
  
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

  const formatDate = (createdAt) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'только что';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${getMinutesText(minutes)} назад`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${getHoursText(hours)} назад`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${getDaysText(days)} назад`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${getMonthsText(months)} назад`;
    }
  };

  const getMinutesText = (minutes) => {
    if (minutes === 1) return 'минуту';
    if (minutes >= 2 && minutes <= 4) return 'минуты';
    return 'минут';
  };

  const getHoursText = (hours) => {
    if (hours === 1) return 'час';
    if (hours >= 2 && hours <= 4) return 'часа';
    return 'часов';
  };

  const getDaysText = (days) => {
    if (days === 1) return 'день';
    if (days >= 2 && days <= 4) return 'дня';
    return 'дней';
  };

  const getMonthsText = (months) => {
    if (months === 1) return 'месяц';
    if (months >= 2 && months <= 4) return 'месяца';
    return 'месяцев';
  };

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="posts-user-header">
        <img src="${userData.imageUrl}" class="posts-user-header__user-image">
        <p class="posts-user-header__user-name">${userData.name}</p>
      </div>
      <ul class="posts">
        ${userPosts.map(post => `
          <li class="post">
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button">
                <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}" alt="${post.isLiked ? 'Убрать лайк' : 'Поставить лайк'}">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${post.likes.length}</strong>
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
        `).join('')}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", () => {
      const postId = likeButton.dataset.postId;
      
      if (!user) {
        alert("Для лайков нужно авторизоваться");
        return;
      }

      // Находим пост в основном массиве posts
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        console.error("Пост не найден:", postId);
        alert("Ошибка: пост не найден");
        return;
      }

      const post = posts[postIndex];
      const token = `Bearer ${user.token}`;

      console.log("Текущий пост на странице пользователя:", post);
      console.log("isLiked:", post.isLiked);

      const isCurrentlyLiked = post.isLiked;

      if (isCurrentlyLiked) {
        // Убираем лайк
        console.log("Убираем лайк с поста:", postId);
        dislikePost({ token, postId })
          .then((updatedPost) => {
            console.log("Лайк убран, обновленный пост:", updatedPost);
            // Обновляем пост в основном массиве
            posts[postIndex] = updatedPost;
            // Перерисовываем страницу
            renderUserPostsPageComponent({ appEl, userId });
          })
          .catch((error) => {
            console.error("Ошибка при снятии лайка:", error);
            alert("Не удалось снять лайк: " + error.message);
          });
      } else {
        // Ставим лайк
        console.log("Ставим лайк на пост:", postId);
        likePost({ token, postId })
          .then((updatedPost) => {
            console.log("Лайк поставлен, обновленный пост:", updatedPost);
            // Обновляем пост в основном массиве
            posts[postIndex] = updatedPost;
            // Перерисовываем страницу
            renderUserPostsPageComponent({ appEl, userId });
          })
          .catch((error) => {
            console.error("Ошибка при установке лайка:", error);
            alert("Не удалось поставить лайк: " + error.message);
          });
      }
    });
  }
}