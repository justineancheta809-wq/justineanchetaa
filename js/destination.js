function displayDestinations(list = destinations) {

    const grid = document.getElementById("destinationGrid");

    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = `
            <p class="no-results">
                No destinations found.
            </p>
        `;
        return;
    }

    grid.innerHTML = list.map(destination => {

        const favorite = isFavorite(destination.id);

        return `
            <div class="destination-card">

                <div class="destination-image">
                    <img 
                        src="${destination.image}" 
                        alt="${destination.name}" onerror="this.onerror=null;this.src=imageFallback;"
                    >

                    <button 
                        class="favorite-btn ${favorite ? "active" : ""}"
                        onclick="toggleFavorite('${destination.id}')"
                    >
                        ${favorite ? "♥" : "♡"}
                    </button>
                </div>

                <div class="destination-content">

                    <span class="category">
                        ${destination.category}
                    </span>

                    <h3>${destination.name}</h3>

                    <p>
                        ${destination.description}
                    </p>

                    <div class="destination-meta">
                        <span>⭐ ${destination.rating}</span>
                        <span>₱${destination.budget}/day</span>
                    </div>

                    <button 
                        class="view-btn"
                        onclick="openDestination('${destination.id}')"
                    >
                        View Details
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


function filterDestinations() {

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    const searchValue =
        searchInput?.value.toLowerCase() || "";

    const categoryValue =
        categoryFilter?.value || "All";

    const filtered = destinations.filter(destination => {

        const matchesSearch =
            destination.name
                .toLowerCase()
                .includes(searchValue) ||
            destination.description
                .toLowerCase()
                .includes(searchValue);

        const matchesCategory =
            categoryValue === "All" ||
            destination.category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    displayDestinations(filtered);
}


function toggleFavorite(id) {

    toggleFavoriteStorage(id);

    displayDestinations();
    displayFavorites();

    showToast(
        isFavorite(id)
            ? "Added to favorites!"
            : "Removed from favorites."
    );
}


function displayFavorites() {

    const container = document.getElementById("favoritesGrid");

    if (!container) return;

    const favoriteIDs = getFavorites();

    const favoriteDestinations =
        destinations.filter(destination =>
            favoriteIDs.includes(destination.id)
        );

    if (favoriteDestinations.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                You don't have any favorite destinations yet.
            </p>
        `;

        return;
    }

    container.innerHTML = favoriteDestinations.map(destination => {

        return `
            <div class="favorite-card">

                <img 
                    src="${destination.image}"
                    alt="${destination.name}" onerror="this.onerror=null;this.src=imageFallback;"
                >

                <div>
                    <h3>${destination.name}</h3>
                    <p>${destination.category}</p>

                    <button
                        onclick="openDestination('${destination.id}')"
                    >
                        View
                    </button>
                </div>

            </div>
        `;

    }).join("");
}


function openDestination(id) {

    const destination =
        destinations.find(item => item.id === id);

    if (!destination) return;

    const modal =
        document.getElementById("destinationModal");

    const content =
        document.getElementById("modalContent");

    if (!modal || !content) return;

    content.innerHTML = `

        <img
            src="${destination.image}"
            alt="${destination.name}"
            class="modal-image" onerror="this.onerror=null;this.src=imageFallback;"
        >

        <span class="category">
            ${destination.category}
        </span>

        <h2>${destination.name}</h2>

        <p>${destination.description}</p>

        <h3>Popular Attractions</h3>

        <div class="attraction-gallery">
            ${destination.attractions.map(item => `
                <figure class="attraction-card">
                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src=makePlaceholder(this.alt);"
                    >
                    <figcaption>${item.name}</figcaption>
                </figure>
            `).join("")}
        </div>

        <h3>Activities</h3>

        <ul>
            ${destination.activities
                .map(item => `<li>${item}</li>`)
                .join("")}
        </ul>

        <p>
            <strong>Best Time:</strong>
            ${destination.bestTime}
        </p>

        <p>
            <strong>Estimated Daily Budget:</strong>
            ₱${destination.budget}
        </p>

        <button
            onclick="selectForPlanner('${destination.id}')"
        >
            Plan a Trip Here
        </button>
    `;

    modal.classList.add("show");
}


function closeModal() {

    const modal =
        document.getElementById("destinationModal");

    if (modal) {
        modal.classList.remove("show");
    }
}
