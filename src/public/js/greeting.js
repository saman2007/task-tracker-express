// Time-aware dashboard greeting.
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("greetingText");
    if (!el) return;
    const hour = new Date().getHours();
    let greeting = "Welcome Back";
    if (hour >= 5 && hour < 12) {
      greeting = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good Afternoon";
    } else if (hour >= 17 && hour < 22) {
      greeting = "Good Evening";
    } else {
      greeting = "Good Night";
    }
    el.textContent = greeting;
  });
})();
