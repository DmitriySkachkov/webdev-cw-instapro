export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage(user) {
  try {
    return JSON.parse(window.localStorage.getItem("user"));
  } catch (error) {
    return null;
  }
}

export function removeUserFromLocalStorage(user) {
  window.localStorage.removeItem("user");
}

export function formatDate(createdAt) {
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
}

function getMinutesText(minutes) {
  if (minutes === 1) return 'минуту';
  if (minutes >= 2 && minutes <= 4) return 'минуты';
  return 'минут';
}

function getHoursText(hours) {
  if (hours === 1) return 'час';
  if (hours >= 2 && hours <= 4) return 'часа';
  return 'часов';
}

function getDaysText(days) {
  if (days === 1) return 'день';
  if (days >= 2 && days <= 4) return 'дня';
  return 'дней';
}

function getMonthsText(months) {
  if (months === 1) return 'месяц';
  if (months >= 2 && months <= 4) return 'месяца';
  return 'месяцев';
}

export function initLikeButtonHandlers({ appEl, posts, user, onLikeUpdate }) {
  const likeButtons = appEl.querySelectorAll(".like-button");
  
  likeButtons.forEach(likeButton => {
    likeButton.addEventListener("click", async () => {
      const postId = likeButton.dataset.postId;
      
      if (!user) {
        alert("Для лайков нужно авторизоваться");
        return;
      }

      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        console.error("Пост не найден:", postId);
        return;
      }

      await onLikeUpdate(postId, postIndex);
    });
  });
}