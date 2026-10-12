document.addEventListener("DOMContentLoaded", () => {

    // Load destinations
    displayDestinations();

    // Load favorites
    displayFavorites();

    // Load saved theme
    loadSavedTheme();

    // Load Trip Matcher
    loadQuestion();

    // Search
    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            filterDestinations
        );
    }

    // Category filter
    const categoryFilter =
        document.getElementById("categoryFilter");

    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            filterDestinations
        );
    }

    // Theme button
    document
        .getElementById("themeBtn")
        ?.addEventListener(
            "click",
            toggleTheme
        );

    // Mobile menu
    document
        .getElementById("menuBtn")
        ?.addEventListener(
            "click",
            toggleMobileMenu
        );

    // Close modal when clicking the dark overlay or pressing Escape
    document
        .querySelector("#destinationModal .modal-overlay")
        ?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    // Close mobile menu after clicking a nav link
    document.querySelectorAll("#navMenu a").forEach(link => {
        link.addEventListener("click", () => {
            document.getElementById("navMenu")?.classList.remove("active");
        });
    });

    // Contact form
    const contactForm =
        document.getElementById("contactForm");

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            handleContactSubmit
        );
    }

});


function handleContactSubmit(event) {

    event.preventDefault();

    const name =
        document.getElementById("name")?.value.trim();

    const email =
        document.getElementById("email")?.value.trim();

    const message =
        document.getElementById("message")?.value.trim();

    if (!name || !email || !message) {

        showToast(
            "Please complete all fields."
        );

        return;
    }

    if (!email.includes("@")) {

        showToast(
            "Please enter a valid email."
        );

        return;
    }

    showToast(
        "Thank you for your feedback!"
    );

    event.target.reset();
}




window.toggleFavorite = toggleFavorite;
window.openDestination = openDestination;
window.closeModal = closeModal;
window.selectForPlanner = selectForPlanner;
window.calculateTrip = calculateTrip;
window.generateItinerary = generateItinerary;
window.surpriseMe = surpriseMe;
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;
window.restartQuiz = restartQuiz;
window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToSection = scrollToSection;