document.querySelectorAll('[data-share]').forEach((button) => {
  button.addEventListener('click', async () => {
    const shareData = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        const oldText = button.textContent;
        button.textContent = 'Link gekopieerd';
        window.setTimeout(() => { button.textContent = oldText; }, 1800);
      }
    } catch (error) {
      if (error.name !== 'AbortError') button.textContent = 'Delen niet gelukt';
    }
  });
});
