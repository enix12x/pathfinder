// Theme management
(function() {
  const THEME_KEY = 'pathfinder-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || DARK_THEME;
  }

  function setStoredTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    setStoredTheme(theme);
    updateThemeToggle(theme);
  }

  function updateThemeToggle(theme) {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(toggle => {
      const textSpan = toggle.querySelector('.theme-toggle-text');
      if (textSpan) {
        if (theme === DARK_THEME) {
          textSpan.textContent = 'Light Mode';
        } else {
          textSpan.textContent = 'Dark Mode';
        }
      }
    });
  }

  function toggleTheme() {
    const currentTheme = getStoredTheme();
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    applyTheme(newTheme);
  }

  // Initialize theme on page load
  document.addEventListener('DOMContentLoaded', function() {
    const theme = getStoredTheme();
    applyTheme(theme);
    
    // Attach toggle handlers
    document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
      toggle.addEventListener('click', toggleTheme);
    });
  });

  // Expose toggle function globally
  window.toggleTheme = toggleTheme;
  window.getCurrentTheme = () => getStoredTheme();
})();

