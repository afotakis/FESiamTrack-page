const copyButton = document.querySelector('[data-copy-target]');
const scrollTopButton = document.querySelector('[data-scroll-top]');

if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const id = copyButton.dataset.copyTarget;
    const node = document.getElementById(id);
    if (!node) return;

    try {
      await navigator.clipboard.writeText(node.innerText.trim());
      const old = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      setTimeout(() => (copyButton.textContent = old), 1500);
    } catch {
      copyButton.textContent = 'Select & copy';
    }
  });
}

if (scrollTopButton) {
  const updateScrollButton = () => {
    scrollTopButton.classList.toggle('visible', window.scrollY > 700);
  };

  updateScrollButton();
  window.addEventListener('scroll', updateScrollButton, { passive: true });
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
