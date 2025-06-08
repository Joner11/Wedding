const botToken = '7996154680:AAG7xNXeLzNC2V5gf4vNjfsumKl6Z84Yi00';
const chatId = -1002768080760;

function createToastContainer() {
  if (document.getElementById('toast-container')) return;

  const container = document.createElement('div');
  container.id = 'toast-container';

  Object.assign(container.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -70%)',
    zIndex: '10000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none'
  });

  document.body.appendChild(container);
}

function showToast(message, duration = 4000) {
  createToastContainer();

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.innerHTML = `<div class="block-content">${message}</div>`;

  Object.assign(toast.style, {
    background: 'rgba(255, 255, 255, 0.09)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    margin: '10px 0',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.4)',
    opacity: '0',
    transform: 'translateY(30px) scale(0.95)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    color: '#000',
    fontSize: '0.8rem',
    textAlign: 'center',
    maxWidth: '90vw',
    pointerEvents: 'auto'
  });

  const container = document.getElementById('toast-container');
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(30px) scale(0.95)';
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

function getGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name') || urlParams.get('v');
  return name;
}

function setGuestName() {
  const guestName = getGuestName();
  const guestNameElement = document.getElementById('guestName');

  if (guestName && guestNameElement) {
    guestNameElement.textContent = guestName;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const guest = getGuestName() || 'Неизвестный гость';

    fetch('https://ipwho.is/')
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error('Не удалось получить данные');
        const ip = data.ip;
        const city = data.city;
        const region = data.region;
        const country = data.country;
    
        const msg = `<b>Посетитель открыл сайт</b>\n\n` +
                    `🔗 <b>Имя из ссылки:</b> ${guest}\n` +
                    `🌍 <b>IP:</b> ${ip}\n` +
                    `📍 <b>Город:</b> ${city}, ${region}, ${country}`;

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: 4,
          text: msg,
          parse_mode: 'HTML'
        })
      });
    })
    .catch(() => {
      console.warn('Не удалось получить геолокацию по IP');
    });
});

document.getElementById('rsvpForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const attendance = form.attendance.value;
  const wishes = form.wishes.value.trim();
  const dish = form.querySelector('input[name="dish"]:checked')?.value || 'Не выбрано';
  const alcohols = [...form.querySelectorAll('input[name="alcohol"]:checked')]
    .map(cb => cb.value)
    .join(', ');
  const guestFromURL = getGuestName();

  const message = `<b>Новая анкета гостя:</b>\n\n` +
    (guestFromURL ? `🔗 <b>Гость по ссылке:</b> ${guestFromURL}\n` : '') +
    `👤 <b>Имя:</b> ${name}\n` +
    `📅 <b>Присутствие:</b> ${attendance}\n` +
    `🍽 <b>Блюдо:</b> ${dish}\n` +
    `🍷 <b>Алкоголь:</b> ${alcohols || 'Не выбрано'}\n` +
    (wishes ? `💌 <b>Пожелания:</b> ${wishes}` : '');

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Отправка...';

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: 2,
      text: message,
      parse_mode: 'HTML'
    })
  })
    .then(response => {
      if (response.ok) {
        showToast('Спасибо! Анкета отправлена 💌');
        form.reset();
        submitButton.textContent = 'Спасибо за обратную связь!';
      } else {
        showToast('Ошибка при отправке. Попробуйте позже.');
        submitButton.disabled = false;
        submitButton.textContent = 'Отправить';
      }
    })
    .catch(() => {
      showToast('Ошибка соединения. Попробуйте позже.');
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить';
    });
});

setGuestName();
