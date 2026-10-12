function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    saveTheme(isDark ? "dark" : "light");

    const button =
        document.getElementById("themeBtn");

    if (button) {
        button.textContent =
            isDark ? "☀️" : "🌙";
    }
}


function loadSavedTheme() {

    const theme = getSavedTheme();

    if (theme === "dark") {

        document.body.classList.add("dark");

        const button =
            document.getElementById("themeBtn");

        if (button) {
            button.textContent = "☀️";
        }
    }
}


function toggleMobileMenu() {

    const nav =
        document.getElementById("navMenu");

    if (nav) {
        nav.classList.toggle("active");
    }
}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


function scrollToSection(id) {

    const section =
        document.getElementById(id);

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}