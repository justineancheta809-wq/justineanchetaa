function selectForPlanner(id) {

    const select =
        document.getElementById("plannerDestination");

    if (select) {
        select.value = id;
    }

    closeModal();

    document
        .getElementById("planner")
        ?.scrollIntoView({
            behavior: "smooth"
        });
}


function calculateTrip() {

    const destinationID =
        document.getElementById("plannerDestination")?.value;

    const travelers =
        Number(document.getElementById("travelers")?.value);

    const days =
        Number(document.getElementById("days")?.value);

    const style =
        document.getElementById("travelStyle")?.value;

    const result =
        document.getElementById("budgetResult");

    if (!destinationID || travelers < 1 || days < 1) {

        showToast("Please complete the trip details.");

        return;
    }

    const destination =
        destinations.find(item =>
            item.id === destinationID
        );

    if (!destination) return;

    const styleMultiplier = {
        budget: 0.8,
        standard: 1,
        comfort: 1.4
    };

    const multiplier =
        styleMultiplier[style] || 1;

    const accommodation =
        destination.budget *
        days *
        travelers *
        multiplier;

    const food =
        500 *
        days *
        travelers;

    const activities =
        700 *
        travelers;

    const total =
        accommodation +
        food +
        activities;

    result.innerHTML = `

        <div class="budget-card">

            <h3>Estimated Trip Budget</h3>

            <p>
                Destination:
                <strong>${destination.name}</strong>
            </p>

            <p>
                Travelers:
                <strong>${travelers}</strong>
            </p>

            <p>
                Days:
                <strong>${days}</strong>
            </p>

            <p>
                Travel Style:
                <strong>${style}</strong>
            </p>

            <hr>

            <h2>
                ₱${total.toLocaleString()}
            </h2>

            <button
                onclick="generateItinerary()"
            >
                Generate Itinerary
            </button>

        </div>
    `;

    showToast("Trip budget calculated!");
}


function generateItinerary() {

    const destinationID =
        document.getElementById("plannerDestination")?.value;

    const travelers =
        Number(document.getElementById("travelers")?.value);

    const days =
        Number(document.getElementById("days")?.value);

    const result =
        document.getElementById("budgetResult");

    const destination =
        destinations.find(item =>
            item.id === destinationID
        );

    if (!destination) {
        showToast("Please calculate your trip first.");
        return;
    }

    result.querySelector(".itinerary")?.remove();

    let itinerary = `
        <div class="itinerary">
            <h3>
                ${days}-Day Itinerary for ${destination.name}
            </h3>
    `;

    for (let day = 1; day <= days; day++) {

        const activity =
            destination.activities[
                (day - 1) %
                destination.activities.length
            ];

        const attraction =
            destination.attractions[
                (day - 1) %
                destination.attractions.length
            ];

        itinerary += `
            <div class="itinerary-day">

                <h4>Day ${day}</h4>

                <img
                    class="itinerary-photo"
                    src="${attraction.image}"
                    alt="${attraction.name}"
                    onerror="this.onerror=null;this.src=makePlaceholder(this.alt);"
                >

                <p>
                    📍 Visit:
                    ${attraction.name}
                </p>

                <p>
                    🎯 Activity:
                    ${activity}
                </p>

                <p>
                    👥 Travelers:
                    ${travelers}
                </p>

            </div>
        `;
    }

    itinerary += `</div>`;

    result.innerHTML += itinerary;

    showToast("Itinerary generated!");
}


function surpriseMe() {

    const randomIndex =
        Math.floor(
            Math.random() * destinations.length
        );

    const randomDestination =
        destinations[randomIndex];

    openDestination(randomDestination.id);

    showToast(
        `Try ${randomDestination.name}!`
    );
}