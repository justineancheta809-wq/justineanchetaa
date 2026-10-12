/* ===== Landing page + Philippine map flight animation ===== */

// Extra departure cities (all destinations are also available as "From")
const EXTRA_CITIES = { "Laoag": [18.2, 120.6], "Tuguegarao": [17.6, 121.7] };
const ORIGINS = {};
const DEST_COORDS = {};
destinations.forEach(d => {
    DEST_COORDS[d.id] = [d.lat, d.lon];
    ORIGINS[d.name] = [d.lat, d.lon];
});
Object.assign(ORIGINS, EXTRA_CITIES);

// Simplified island outlines [lon, lat]
const ISLANDS = [
    [[120.4,18.4],[121.0,18.65],[121.9,18.55],[122.3,18.2],[122.4,17.2],[122.2,16.3],[121.6,15.9],[121.6,15.2],[121.9,14.8],[121.7,14.2],[122.2,14.2],[122.9,14.1],[123.4,13.9],[124.1,13.0],[123.7,12.6],[123.3,13.0],[122.9,13.5],[122.4,13.6],[121.5,13.7],[121.0,13.7],[120.6,14.1],[120.4,14.5],[120.1,14.8],[119.95,15.7],[120.3,16.2],[120.4,17.0]],
    [[120.3,13.5],[121.0,13.5],[121.5,13.3],[121.4,12.7],[121.2,12.2],[120.7,12.2],[120.3,12.8]],
    [[117.2,8.4],[117.7,8.4],[118.9,9.5],[119.5,10.5],[119.9,11.4],[119.5,11.5],[118.9,10.7],[118.2,9.8],[117.4,8.8]],
    [[121.9,11.9],[122.6,11.9],[123.1,11.5],[123.1,10.8],[122.7,10.4],[122.1,10.4],[121.9,11.0]],
    [[122.9,11.0],[123.5,10.5],[123.3,9.5],[123.2,9.0],[122.6,9.2],[122.4,10.0],[122.7,10.7]],
    [[123.9,11.2],[124.05,11.0],[123.6,9.9],[123.4,9.4],[123.25,9.6],[123.5,10.4],[123.75,10.9]],
    [[123.8,9.9],[124.6,9.9],[124.5,9.6],[124.0,9.6]],
    [[124.3,11.5],[125.0,11.3],[125.1,10.5],[124.9,10.1],[124.5,10.6],[124.3,11.0]],
    [[124.2,12.5],[125.5,12.5],[125.8,11.5],[125.2,10.9],[124.9,11.5],[124.3,11.9]],
    [[123.2,12.5],[124.0,12.3],[123.5,11.8],[123.2,12.0]],
    [[121.9,20.55],[122.05,20.55],[122.05,20.35],[121.9,20.35]],
    [[121.75,20.85],[121.9,20.85],[121.9,20.7],[121.75,20.7]],
    [[124.0,13.9],[124.4,13.8],[124.3,13.5],[124.0,13.6]],
    [[121.8,13.55],[122.15,13.55],[122.1,13.3],[121.85,13.25]],
    [[122.0,12.6],[122.15,12.6],[122.1,12.2],[121.95,12.3]],
    [[123.45,9.3],[123.65,9.25],[123.6,9.1],[123.45,9.1]],
    [[124.65,9.25],[124.8,9.2],[124.75,9.05],[124.65,9.1]],
    [[124.4,11.65],[124.6,11.65],[124.55,11.45],[124.4,11.5]],
    [[119.9,12.25],[120.35,12.25],[120.2,11.95],[119.9,12.0]],
    [[121.9,6.7],[122.4,6.7],[122.3,6.4],[121.9,6.4]],
    [[125.5,10.3],[125.65,10.3],[125.6,9.9],[125.5,10.0]],
    [[126.0,9.95],[126.25,9.95],[126.2,9.65],[126.0,9.7]],
    [[122.0,7.0],[122.2,7.8],[123.0,8.6],[123.8,8.6],[124.5,8.6],[125.0,9.4],[125.5,9.8],[126.2,9.3],[126.4,8.3],[126.3,7.2],[126.1,6.3],[125.6,5.9],[125.0,6.0],[124.2,6.3],[123.8,7.2],[123.4,7.4],[122.8,7.4]]
];

const proj = ([lat, lon]) => [(lon - 116) * 42, (21.5 - lat) * 42];
let flying = false;


/* ===== Transport: airplane / bus / car ===== */
const MODES = {
    plane: { icon: "✈️", label: "Airplane" },
    bus:   { icon: "🚌", label: "Bus" },
    car:   { icon: "🚗", label: "Car" }
};
let currentMode = "plane";

// Which landmass each place is on
const LANDMASS = {
    manila: "luzon", baguio: "luzon", vigan: "luzon", pagudpud: "luzon", "hundred-islands": "luzon",
    banaue: "luzon", sagada: "luzon", palaui: "luzon", baler: "luzon", pinatubo: "luzon", clark: "luzon",
    tagaytay: "luzon", batangas: "luzon", mayon: "luzon", donsol: "luzon", caramoan: "luzon",
    "puerto-galera": "mindoro", palawan: "palawan", "puerto-princesa": "palawan", coron: "busuanga",
    batanes: "batanes", catanduanes: "catanduanes", romblon: "romblon", iloilo: "panay", boracay: "panay",
    bacolod: "negros", dumaguete: "negros", cebu: "cebu", bohol: "bohol", siquijor: "siquijor",
    tacloban: "leyte", biliran: "leyte", samar: "leyte", davao: "mindanao", "cagayan-de-oro": "mindanao",
    zamboanga: "mindanao", "surigao-del-sur": "mindanao", sarangani: "mindanao", "lake-sebu": "mindanao",
    iligan: "mindanao", bukidnon: "mindanao", camiguin: "camiguin", siargao: "siargao",
    Laoag: "luzon", Tuguegarao: "luzon"
};

// Islands NOT reachable by road or RoRo ferry from the rest of the country
const NO_ROAD_LINK = ["batanes", "palawan", "busuanga"];

// Places with their own airport (or an airport in the same town)
const AIRPORTS = ["manila", "batanes", "clark", "coron", "puerto-princesa", "mayon", "catanduanes",
    "romblon", "boracay", "cebu", "bohol", "dumaguete", "bacolod", "iloilo", "tacloban", "siargao",
    "camiguin", "cagayan-de-oro", "davao", "zamboanga", "sarangani", "palawan", "Laoag", "Tuguegarao"];

// "From" holds a display name; turn it into a key (destination id or extra city name)
function keyOf(name) {
    const d = destinations.find(x => x.name === name);
    return d ? d.id : name;
}

function haversine([la1, lo1], [la2, lo2]) {
    const r = Math.PI / 180, R = 6371;
    const a = Math.sin((la2 - la1) * r / 2) ** 2 +
        Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function fmtHours(h) {
    let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    if (mm === 60) { hh++; mm = 0; }
    const base = hh ? `${hh} h${mm ? " " + mm + " min" : ""}` : `${mm} min`;
    return h >= 24 ? `${base} (about ${(h / 24).toFixed(1)} days)` : base;
}

function estimate(mode, fromName, toId) {
    const fk = keyOf(fromName), tk = toId;
    const km = haversine(ORIGINS[fromName], DEST_COORDS[toId]);
    const lf = LANDMASS[fk] || fk, lt = LANDMASS[tk] || tk;

    if (mode === "plane") {
        if (!AIRPORTS.includes(fk)) return { avail: false, km, why: "No airport in the starting place." };
        if (!AIRPORTS.includes(tk)) return { avail: false, km, why: "No airport in this destination. Take a bus or car, or fly to the nearest airport." };
        return { avail: true, km, hours: km / 750 + 2.5, note: "Flight time plus check-in, boarding, and airport transfer." };
    }

    const same = lf === lt;
    if (!same && (NO_ROAD_LINK.includes(lf) || NO_ROAD_LINK.includes(lt)))
        return { avail: false, km, why: "These islands are not connected by road or RoRo ferry. Fly instead." };

    const roadKm = km * 1.4;
    const crossings = same ? 0 : Math.max(1, Math.round(km / 250));
    const ferryH = crossings * 3.5;
    const hours = roadKm / (mode === "bus" ? 45 : 60) + ferryH;
    let note = same ? "Land travel only." : `Includes about ${crossings} RoRo ferry crossing${crossings > 1 ? "s" : ""}.`;
    if (tk === "boracay") note += " Last stretch is a short boat ride from Caticlan.";
    if (mode === "bus" && !same) note += " Buses ride the ferry with you.";
    return { avail: true, km, hours, note, roadKm, crossings };
}

function refreshModes() {
    const bar = document.getElementById("modeBar");
    if (!bar) return;
    const from = document.getElementById("flightFrom").value;
    const to = document.getElementById("flightTo").value;
    if (!ORIGINS[from] || !DEST_COORDS[to]) return;

    const est = {};
    Object.keys(MODES).forEach(m => est[m] = estimate(m, from, to));
    if (!est[currentMode].avail) currentMode = Object.keys(MODES).find(m => est[m].avail) || currentMode;

    bar.innerHTML = Object.entries(MODES).map(([m, info]) => `
        <button type="button" class="mode-btn ${m === currentMode ? "active" : ""} ${est[m].avail ? "" : "off"}"
                data-mode="${m}" ${est[m].avail ? "" : "disabled"} title="${est[m].avail ? "" : est[m].why}">
            <span class="mode-icon">${info.icon}</span>
            <strong>${info.label}</strong>
            <small>${est[m].avail ? "~" + fmtHours(est[m].hours) : "Not available"}</small>
        </button>`).join("");

    bar.querySelectorAll(".mode-btn").forEach(b =>
        b.addEventListener("click", () => { currentMode = b.dataset.mode; refreshModes(); }));

    const hint = document.getElementById("modeHint");
    if (hint) {
        const e = est[currentMode];
        hint.textContent = e.avail ? `${Math.round(e.km)} km straight line • ${e.note}` : e.why;
    }
}

function buildMap() {
    const svg = document.getElementById("phMap");
    if (!svg) return;

    const land = ISLANDS.map(poly =>
        `<polygon class="land" points="${poly.map(([lo, la]) => proj([la, lo]).join(",")).join(" ")}"/>`
    ).join("");

    const destXY = Object.values(DEST_COORDS).map(proj);
    const originPins = Object.entries(ORIGINS).filter(([, c]) => {
        const [x, y] = proj(c);
        return !destXY.some(([dx, dy]) => Math.hypot(dx - x, dy - y) < 10);
    }).map(([name, c]) => {
        const [x, y] = proj(c);
        return `<g class="city" data-city="${name}" transform="translate(${x} ${y})">
            <circle r="9" fill="transparent"/><circle class="city-dot" r="4.5"/>
            <text class="city-label" x="8" y="4">${name}</text></g>`;
    }).join("");

    const pins = destinations.map(d => {
        const [x, y] = proj(DEST_COORDS[d.id]);
        return `<g class="pin" data-id="${d.id}" transform="translate(${x} ${y})">
            <circle class="pin-pulse" r="8"/><circle class="pin-dot" r="4.5"/>
            <text class="pin-label" x="${x > 380 ? -10 : 10}" y="-8" text-anchor="${x > 380 ? "end" : "start"}">${d.name}</text></g>`;
    }).join("");

    svg.innerHTML = `${land}
        <path id="flightTrail" class="trail" d=""/>
        <path id="flightPath" d="" fill="none" stroke="none"/>
        ${originPins}
        <circle id="originDot" class="origin-dot" r="7" cx="-50" cy="-50"/>
        ${pins}
        <g id="plane" style="display:none"><path id="planeShape" d="M16 0 L-10 -9 L-5 0 L-10 9 Z"/><text id="vehicleEmoji" text-anchor="middle" font-size="22" y="8" style="display:none"></text></g>`;

    svg.querySelectorAll(".city").forEach(c =>
        c.addEventListener("click", () => {
            document.getElementById("flightFrom").value = c.dataset.city;
            moveOrigin();
            refreshModes();
        }));

    svg.querySelectorAll(".pin").forEach(p =>
        p.addEventListener("click", () => {
            document.getElementById("flightTo").value = p.dataset.id;
            startFlight();
        }));
}

const visited = new Set();

function moveOrigin() {
    const dot = document.querySelector("#originDot");
    if (!dot) return;
    const [x, y] = proj(ORIGINS[document.getElementById("flightFrom").value]);
    dot.setAttribute("cx", x); dot.setAttribute("cy", y);
}

function markVisited(id) {
    visited.add(id);
    document.querySelector(`.pin[data-id="${id}"]`)?.classList.add("visited");
    const c = document.getElementById("exploreCount");
    if (c) c.textContent = `🧳 Places explored: ${visited.size} / ${destinations.length}` +
        (visited.size === destinations.length ? "  🎉 You explored them all!" : "");
}

function startFlight() {
    try { runFlight(); }
    catch (err) {
        flying = false;
        document.getElementById("flightInfo").innerHTML =
            `<p class="flight-hint">⚠️ Something went wrong: ${err.message}</p>`;
    }
}

function runFlight() {
    if (flying) return;
    const from = document.getElementById("flightFrom").value;
    const id = document.getElementById("flightTo").value;
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;

    refreshModes();
    const mode = currentMode;
    const est = estimate(mode, from, id);
    const trip = { mode, est, from };

    const [x1, y1] = proj(ORIGINS[from]);
    const [x2, y2] = proj(DEST_COORDS[id]);
    const info = document.getElementById("flightInfo");
    info.classList.remove("show");
    info.innerHTML = `<p class="flight-hint">${MODES[mode].icon} Traveling from ${from} to ${dest.name}...</p>`;
    if (!est.avail) {
        info.innerHTML = `<p class="flight-hint">⚠️ ${MODES[mode].label} is not available: ${est.why}</p>`;
        return;
    }

    const svg = document.getElementById("phMap");
    const dot = svg.querySelector("#originDot");
    dot.setAttribute("cx", x1); dot.setAttribute("cy", y1);

    const path = svg.querySelector("#flightPath");
    const trail = svg.querySelector("#flightTrail");
    const plane = svg.querySelector("#plane");

    if (Math.hypot(x2 - x1, y2 - y1) < 8) {   // same place, no flight needed
        trail.setAttribute("d", "");
        plane.style.display = "none";
        showFlightInfo(dest, from, true, trip);
        return;
    }

    const bend = mode === "plane" ? 0.25 : 0.06;
    const cx = (x1 + x2) / 2 - (y2 - y1) * bend;
    const cy = (y1 + y2) / 2 + (x2 - x1) * bend - (mode === "plane" ? 30 : 0);
    const d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
    path.setAttribute("d", d);
    trail.setAttribute("d", d);

    const len = path.getTotalLength();
    const duration = mode === "plane" ? 3600 : mode === "car" ? 4800 : 5600;
    trail.setAttribute("class", "trail " + mode);
    plane.querySelector("#planeShape").style.display = mode === "plane" ? "block" : "none";
    const emoji = plane.querySelector("#vehicleEmoji");
    emoji.style.display = mode === "plane" ? "none" : "block";
    emoji.textContent = MODES[mode].icon;
    const t0 = performance.now();
    flying = true;
    plane.style.display = "block";
    document.getElementById("flyBtn").disabled = true;

    function frame(now) {
        const raw = Math.min((now - t0) / duration, 1);
        const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2; // ease in-out
        const p = path.getPointAtLength(t * len);
        const q = path.getPointAtLength(Math.min(t * len + 2, len));
        const angle = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
        plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${mode === "plane" ? angle : 0})`);
        trail.style.strokeDasharray = `${t * len} ${len}`;

        if (raw < 1) {
            requestAnimationFrame(frame);
        } else {
            flying = false;
            plane.style.display = "none";
            document.getElementById("flyBtn").disabled = false;
            showFlightInfo(dest, from, false, trip);
        }
    }
    requestAnimationFrame(frame);
}

function tripSummary(d, from, trip) {
    const rows = Object.entries(MODES).map(([m, info]) => {
        const e = estimate(m, from, d.id);
        return `<tr class="${m === trip.mode ? "picked" : ""}">
            <td>${info.icon} ${info.label}</td>
            <td>${e.avail ? fmtHours(e.hours) : "Not available"}</td></tr>`;
    }).join("");
    return `<div class="trip-box">
        <h4>${MODES[trip.mode].icon} Your trip: ${fmtHours(trip.est.hours)}</h4>
        <p>About ${Math.round(trip.est.km)} km • ${trip.est.note}</p>
        <table class="trip-table">${rows}</table>
        <p class="trip-small">Estimates only. Real travel time depends on traffic, weather, and schedules.</p>
    </div>`;
}

function showFlightInfo(d, from, same, trip) {
    const info = document.getElementById("flightInfo");
    markVisited(d.id);
    info.innerHTML = `
        <img class="flight-hero" src="${d.image}" alt="${d.name}"
             onerror="this.onerror=null;this.src=makePlaceholder(this.alt);">
        <h3>${same ? "📍 You're already in" : "🛬 Welcome to"} ${d.name}!</h3>
        <p class="flight-sub">${same ? "" : MODES[trip.mode].label + " from " + from + " • "}${d.category} • ⭐ ${d.rating}</p>
        <p>${d.description}</p>
        ${same ? "" : tripSummary(d, from, trip)}
        <div class="flight-facts">
            <span>📅 Best time: ${d.bestTime}</span>
            <span>💰 About ₱${d.budget.toLocaleString()} per day</span>
        </div>
        <h4>Things to do</h4>
        <div class="chips">${d.activities.map(a => `<span class="chip">${a}</span>`).join("")}</div>
        <h4>Tourist attractions</h4>
        <div class="attraction-gallery">
            ${d.attractions.map((a, i) => `
                <figure class="attraction-card pop" style="animation-delay:${i * 0.25}s">
                    <img src="${a.image}" alt="${a.name}"
                         onerror="this.onerror=null;this.src=makePlaceholder(this.alt);">
                    <figcaption>${a.name}</figcaption>
                </figure>`).join("")}
        </div>
        <button class="primary-btn" onclick="openDestination('${d.id}')">View full details</button>`;
    info.classList.add("show");
    info.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("flyBtn")) return;   // not the home page
    if (typeof destinations === "undefined") {
        document.getElementById("flightInfo").innerHTML =
            '<p class="flight-hint">⚠️ script/data.js did not load. Make sure data.js is inside the script folder.</p>';
        return;
    }
    const counter = document.createElement("div");
    counter.id = "exploreCount";
    counter.className = "explore-count";
    counter.textContent = `🧳 Places explored: 0 / ${destinations.length}`;
    document.querySelector(".flight-layout").before(counter);

    const groups = ["Luzon", "Visayas", "Mindanao"];
    document.getElementById("flightFrom").innerHTML =
        groups.map(g => `<optgroup label="${g}">` + destinations.filter(d => d.region === g)
            .map(d => `<option>${d.name}</option>`).join("") + "</optgroup>").join("") +
        `<optgroup label="Other cities">${Object.keys(EXTRA_CITIES).map(o => `<option>${o}</option>`).join("")}</optgroup>`;
    document.getElementById("flightTo").innerHTML =
        groups.map(g => `<optgroup label="${g}">` + destinations.filter(d => d.region === g)
            .map(d => `<option value="${d.id}">${d.name}</option>`).join("") + "</optgroup>").join("");
    document.getElementById("flightFrom").value = "Manila";

    const plan = document.getElementById("plannerDestination");
    if (plan) {
        plan.innerHTML = '<option value="">Select destination</option>' +
            destinations.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    }
    const count = document.getElementById("destCount");
    if (count) count.textContent = destinations.length + "+";
    document.getElementById("flightTo").value = "palawan";

    buildMap();
    document.getElementById("flightFrom").addEventListener("change", moveOrigin);
    moveOrigin();

    const modeBox = document.createElement("div");
    modeBox.className = "mode-wrap";
    modeBox.innerHTML = '<p class="mode-title">How do you want to travel?</p><div id="modeBar" class="mode-bar"></div><p id="modeHint" class="mode-hint"></p>';
    document.querySelector(".flight-controls").after(modeBox);
    document.getElementById("flightFrom").addEventListener("change", refreshModes);
    document.getElementById("flightTo").addEventListener("change", refreshModes);
    document.getElementById("flyBtn").textContent = "🧭 Start Trip";
    refreshModes();

    document.getElementById("flyBtn").addEventListener("click", startFlight);

    // Click anywhere on a place card to show its infos
    document.getElementById("destinationGrid").addEventListener("click", e => {
        const card = e.target.closest(".destination-card");
        if (card && !e.target.closest("button")) card.querySelector(".view-btn")?.click();
    });
});

window.startFlight = startFlight;
