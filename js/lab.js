/* =====================================================
   SMART TRIP LAB: 10 trip-planning features
   Uses destinations (data.js) + estimate() (flight.js)
   ===================================================== */
(function () {
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CATS = ["Beach", "Mountain", "City", "Nature"];
const PACE = {
    relaxed:  { label: "Relaxed",  per: 2, block: 2.5, brk: 90, walk: 3, free: 4,   val: 20, pen: 0 },
    balanced: { label: "Balanced", per: 3, block: 2,   brk: 60, walk: 5, free: 2.5, val: 50, pen: 5 },
    packed:   { label: "Packed",   per: 4, block: 1.5, brk: 30, walk: 8, free: 1,   val: 85, pen: 15 }
};

/* ---- Indicator tables (editorial / preliminary: verify with DOT, LGU, NTC before publishing) ---- */
const CROWD = { boracay:5, cebu:5, palawan:5, manila:4, baguio:4, siargao:4, bohol:4, coron:4, tagaytay:4, "puerto-princesa":4,
    vigan:3, batangas:3, "hundred-islands":3, pagudpud:3, sagada:3, banaue:3, davao:3, clark:3, dumaguete:3, camiguin:3, siquijor:3,
    mayon:3, pinatubo:3, "puerto-galera":3, batanes:3, caramoan:2, donsol:2, baler:2, iloilo:2, bacolod:2, tacloban:2, zamboanga:2,
    "cagayan-de-oro":2, "surigao-del-sur":2, biliran:1, samar:1, catanduanes:1, romblon:1, palaui:1, sarangani:1, "lake-sebu":1, iligan:1, bukidnon:1 };
const CONN = { manila:3, cebu:3, davao:3, iloilo:3, bacolod:3, "cagayan-de-oro":3, clark:3, baguio:3, zamboanga:3, dumaguete:3, tacloban:3,
    batanes:1, palaui:1, sagada:1, banaue:1, donsol:1, caramoan:1, biliran:1, samar:1, "lake-sebu":1, "surigao-del-sur":1, catanduanes:1, romblon:1, sarangani:1 };
// [community-based tourism, local guides, locally operated activities]
const LOCAL = { banaue:[1,1,1], sagada:[1,1,1], donsol:[1,1,1], dumaguete:[1,1,1], batanes:[1,1,1], "lake-sebu":[1,1,1], palaui:[1,1,1],
    pinatubo:[1,1,1], coron:[1,1,1], "puerto-princesa":[0,1,1], "hundred-islands":[0,1,1], camiguin:[0,1,1], siquijor:[0,0,1],
    "surigao-del-sur":[0,1,1], caramoan:[0,1,1], baler:[0,0,1], biliran:[0,1,1], samar:[0,1,1], cebu:[0,1,1], bohol:[0,1,1], vigan:[0,1,1] };
const LW = [0.4, 0.3, 0.3];
const EVENTS = [
    { id:"cebu", name:"Sinulog Festival", m:[0] }, { id:"baguio", name:"Panagbenga Flower Festival", m:[1] },
    { id:"iloilo", name:"Dinagyang Festival", m:[0] }, { id:"bacolod", name:"MassKara Festival", m:[9] },
    { id:"davao", name:"Kadayawan Festival", m:[7] }, { id:"siargao", name:"Siargao International Surfing Cup", m:[8, 9] },
    { id:"tacloban", name:"Pintados-Kasadyaan Festival", m:[5] }, { id:"bohol", name:"Sandugo Festival", m:[6] },
    { id:"vigan", name:"Longganisa Festival", m:[0] }, { id:"zamboanga", name:"Hermosa Festival", m:[9] },
    { id:"dumaguete", name:"Sandurot Festival", m:[8] }, { id:"manila", name:"Feast of the Black Nazarene", m:[0] }
];
const CHECKS = ["Download offline map", "Save directions and transport schedule", "Screenshot bookings and tickets", "Save emergency and host contacts", "Prepare cash (ATMs / e-wallet may be limited)"];

const LAB = {
    origin: "Manila", month: new Date().getMonth(), pref: "plane", pace: "balanced", lodge: "standard",
    slot: "A", trips: { A: [], B: [] }, tab: "builder",
    ripIdx: 0, ripMode: "", flowSrc: "boracay", cut: 1000, pacePref: 50,
    fair: { n: 3, N: 3, prefs: [[5,1,2,3],[5,2,1,3],[1,5,2,4],[3,3,3,3]] },
    rec: { budget: 2500, cat: "Any", maxH: 12 }, checks: {}
};
try { Object.assign(LAB, JSON.parse(localStorage.getItem("lakbayph_lab") || "{}")); } catch (e) {}
LAB.people = LAB.people || 2; LAB.pack = LAB.pack || {};
const save = () => { try { localStorage.setItem("lakbayph_lab", JSON.stringify(LAB)); } catch (e) {} };
function toast(msg) {
    const t = document.createElement("div"); t.className = "lab-toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
}
const TABS = [["builder","🧳 Trip Builder"],["ripple","1 RippleTrip"],["resil","2 Resilience"],["flow","3 Flow Balancer"],["pace","4 Pace"],
    ["trade","5 Trade-Offs"],["local","6 Local Benefit"],["fair","7 FairTrip"],["season","8 Season"],["conn","9 Connectivity"],["explain","10 Explainable"]];

const $ = id => document.getElementById(id);
const dest = id => destinations.find(d => d.id === id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const peso = n => (n < 0 ? "-" : "") + "₱" + Math.round(Math.abs(n)).toLocaleString();
const sg = (n, f) => (n > 0 ? "+" : n < 0 ? "−" : "±") + f(Math.abs(n));
const trip = () => LAB.trips[LAB.slot];
const bar = (label, v) => `<div class="bar"><span>${label}</span><div class="bar-track"><i style="width:${clamp(v,0,100)}%"></i></div><b>${Math.round(v)}</b></div>`;
const destOpts = (sel, skip = []) => destinations.filter(d => !skip.includes(d.id)).map(d => `<option value="${d.id}" ${d.id === sel ? "selected" : ""}>${d.name}</option>`).join("");
const km = (a, b) => haversine([a.lat, a.lon], [b.lat, b.lon]);

/* ---------- core engine ---------- */
function leg(from, toId, pref, cheap) {
    const to = dest(toId);
    if (from === to.name) return { from, to: to.name, ok: true, same: true, hours: 0, cost: 0, modes: 3, mode: "-" };
    const opts = Object.keys(MODES).map(m => {
        const e = estimate(m, from, toId);
        if (!e.avail) return null;
        const cost = m === "plane" ? 2500 + 4 * e.km : m === "bus" ? 1.8 * e.roadKm + 400 * e.crossings : 7 * e.roadKm + 1000 * e.crossings;
        return { mode: m, hours: e.hours, cost, km: e.km };
    }).filter(Boolean);
    if (!opts.length) return { from, to: to.name, ok: false, hours: 0, cost: 0, modes: 0 };
    const pick = cheap ? opts.sort((a, b) => a.cost - b.cost)[0] : (opts.find(o => o.mode === pref) || opts[0]);
    return { from, to: to.name, ok: true, modes: opts.length, ...pick };
}

function evalTrip(stops, o = {}) {
    const pace = PACE[o.pace || LAB.pace], lf = (o.lodge || LAB.lodge) === "budget" ? 0.85 : 1;
    let prev = LAB.origin, legs = [], travelH = 0, travelCost = 0, stay = 0, att = 0, days = 0, bad = 0;
    stops.forEach(s => {
        const d = dest(s.id), l = leg(prev, s.id, o.pref || LAB.pref, o.cheap);
        const dd = Math.max(1, s.days - (o.trim || 0));
        legs.push(l); if (!l.ok) bad++;
        travelH += l.hours; travelCost += l.cost; stay += d.budget * dd * lf; days += dd;
        att += Math.min(d.attractions.length, pace.per * dd); prev = d.name;
    });
    const comfort = clamp(100 - travelH * 1.5 - pace.pen - (lf < 1 ? 10 : 0), 0, 100);
    return { legs, travelH, travelCost, stay, total: travelCost + stay, days, att, comfort, bad, n: stops.length };
}

function bestSet(str) {
    const [a, b] = str.split(" to ").map(x => MONTHS.findIndex(m => x.trim().startsWith(m)));
    const set = new Set(); let i = a;
    for (let k = 0; k < 12; k++) { set.add(i); if (i === b) break; i = (i + 1) % 12; }
    return set;
}
function seasonScore(d, m) {
    const inBest = bestSet(d.bestTime).has(m);
    const typhoon = m >= 5 && m <= 10 && (d.lat >= 12 || d.lon >= 124.5);
    const ev = EVENTS.filter(e => e.id === d.id && e.m.includes(m));
    return { score: clamp((inBest ? 100 : 40) - (typhoon ? 15 : 0) + (ev.length ? 10 : 0), 0, 100), inBest, typhoon, ev };
}
const localIdx = id => { const f = LOCAL[id]; return f ? f.reduce((s, v, i) => s + v * LW[i], 0) : 0; };
const needsTrip = () => trip().length ? "" : `<p class="lab-empty">Add at least one stop in the <a href="lab-01-builder.html">Trip Builder</a> first (or load the sample trip there).</p>`;
const note = t => `<p class="lab-note">${t}</p>`;

/* ---------- builder ---------- */
function pBuilder() {
    const ev = evalTrip(trip());
    const rows = trip().map((s, i) => { const d = dest(s.id), l = ev.legs[i];
        return `<tr><td>${i + 1}. ${d.name}</td><td><input type="number" min="1" max="7" value="${s.days}" data-bind="days" data-i="${i}" class="num"> day(s)</td>
        <td>${l.ok ? (l.same ? "Starting point" : MODES[l.mode].icon + " " + fmtHours(l.hours)) : "⚠️ No route"}</td>
        <td><button data-act="up" data-i="${i}">▲</button><button data-act="down" data-i="${i}">▼</button><button data-act="del" data-i="${i}">✕</button></td></tr>`; }).join("");
    return `<div class="lab-grid">
      <label>Starting point<select data-bind="origin">${Object.keys(ORIGINS).map(o => `<option ${o === LAB.origin ? "selected" : ""}>${o}</option>`).join("")}</select></label>
      <label>Travel month<select data-bind="month">${MONTHS.map((m, i) => `<option value="${i}" ${i === LAB.month ? "selected" : ""}>${m}</option>`).join("")}</select></label>
      <label>Preferred transport<select data-bind="pref">${Object.entries(MODES).map(([k, v]) => `<option value="${k}" ${k === LAB.pref ? "selected" : ""}>${v.icon} ${v.label}</option>`).join("")}</select></label>
      <label>Pace<select data-bind="pace">${Object.entries(PACE).map(([k, v]) => `<option value="${k}" ${k === LAB.pace ? "selected" : ""}>${v.label}</option>`).join("")}</select></label>
      <label>Lodging<select data-bind="lodge"><option value="standard" ${LAB.lodge === "standard" ? "selected" : ""}>Standard</option><option value="budget" ${LAB.lodge === "budget" ? "selected" : ""}>Budget</option></select></label>
    </div>
    <div class="slot-row">Itinerary: <button data-act="slot" data-s="A" class="${LAB.slot === "A" ? "on" : ""}">Trip A</button><button data-act="slot" data-s="B" class="${LAB.slot === "B" ? "on" : ""}">Trip B</button>
      <span class="lab-small">Two slots so you can compare itineraries (Feature 2).</span></div>
    <div class="add-row"><select id="addStop">${destOpts("")}</select><button class="primary-btn" data-act="add">+ Add stop</button><button data-act="sample" class="ghost-btn">✨ Load sample trip</button></div>
    ${trip().length ? `<table class="lab-table"><tr><th>Stop</th><th>Stay</th><th>Getting there</th><th></th></tr>${rows}</table>
    <div class="kpis"><div><b>${peso(ev.total)}</b><span>Total estimate</span></div><div><b>${fmtHours(ev.travelH)}</b><span>Travel time</span></div>
      <div><b>${ev.days}</b><span>Days at stops</span></div><div><b>${ev.att}</b><span>Attractions</span></div><div><b>${Math.round(ev.comfort)}/100</b><span>Comfort</span></div></div>
    ${note("Cost = daily budget × days + transport estimate (plane ₱2,500 + ₱4/km; bus ₱1.8/road-km + ₱400/ferry; car ₱7/road-km + ₱1,000/ferry). All figures are estimates.")}` : needsTrip()}`;
}

/* ---------- 1. RippleTrip ---------- */
const dlt = (a, b) => `<td>${peso(a.total)} → ${peso(b.total)} <em>(${sg(b.total - a.total, peso)})</em></td><td>${fmtHours(a.travelH)} → ${fmtHours(b.travelH)}</td><td>${a.att} → ${b.att}</td><td>${a.days} → ${b.days}</td>`;
function pRipple() {
    if (!trip().length) return needsTrip();
    const t = trip(), i = Math.min(LAB.ripIdx, t.length - 1), cur = t[i], before = evalTrip(t);
    let out = "";
    if (LAB.ripMode === "remove") {
        const after = evalTrip(t.filter((_, k) => k !== i));
        const nxt = t[i + 1] ? dest(t[i + 1].id).name : "end of trip", prv = i ? dest(t[i - 1].id).name : LAB.origin;
        const nl = after.legs[i];
        out = `<h4>Impact of removing ${dest(cur.id).name}</h4><table class="lab-table"><tr><th>Metric</th><th>Total budget</th><th>Travel time</th><th>Attractions</th><th>Days</th></tr><tr><td>Before → After</td>${dlt(before, after)}</tr></table>
        <p>Schedule effect: ${t[i + 1] ? `${prv} now connects directly to ${nxt} (${nl.ok ? MODES[nl.mode].icon + " " + fmtHours(nl.hours) : "no route"}).` : "This was the last stop, so the trip simply ends earlier."}</p>`;
    } else if (LAB.ripMode === "replace") {
        const c = dest(cur.id), cands = destinations.filter(d => !t.some(s => s.id === d.id)).map(d => {
            const nt = t.map((s, k) => k === i ? { id: d.id, days: s.days } : s), a = evalTrip(nt);
            if (a.bad) return null;
            const pen = Math.abs(a.total - before.total) / Math.max(1, before.total) * 40 + Math.max(0, a.travelH - before.travelH) * 1.5 + (d.category === c.category ? 0 : 12) + Math.max(0, before.att - a.att) * 3;
            return { d, a, fit: clamp(100 - pen, 0, 100) };
        }).filter(Boolean).sort((x, y) => y.fit - x.fit).slice(0, 5);
        out = `<h4>Best replacements for ${c.name} (${c.category})</h4><table class="lab-table"><tr><th>Candidate</th><th>Fit</th><th>Budget</th><th>Travel</th><th>Attractions</th><th></th></tr>
        ${cands.map(x => `<tr><td>${x.d.name} <small>${x.d.category}</small></td><td>${Math.round(x.fit)}</td><td>${peso(x.a.total)} <em>(${sg(x.a.total - before.total, peso)})</em></td><td>${fmtHours(x.a.travelH)}</td><td>${x.a.att}</td><td><button data-act="apply" data-id="${x.d.id}">Apply</button></td></tr>`).join("")}</table>
        ${note("Fit starts at 100 and loses points for budget change, extra travel time, a different category, and fewer attractions.")}`;
    }
    return `<p>Change one stop and see how it ripples through the whole trip.</p><div class="add-row"><select data-bind="ripIdx">${t.map((s, k) => `<option value="${k}" ${k === i ? "selected" : ""}>${k + 1}. ${dest(s.id).name}</option>`).join("")}</select>
    <button data-act="rmode" data-m="remove">Analyze removal</button><button class="primary-btn" data-act="rmode" data-m="replace">Find replacement</button></div>${out}`;
}

/* ---------- 2. Trip Resilience Score ---------- */
function resilience(stops) {
    if (!stops.length) return null;
    const ev = evalTrip(stops), pace = PACE[LAB.pace];
    let alt = 0, dep = 0, unused = 0;
    stops.forEach((s, i) => {
        const d = dest(s.id), l = ev.legs[i];
        alt += Math.min(100, destinations.filter(x => x.id !== d.id && x.category === d.category && km(d, x) <= 300 && !stops.some(t => t.id === x.id)).length * 25);
        const modeScore = l.ok ? [0, 45, 80, 100][Math.min(3, l.modes)] : 0;
        dep += (modeScore + (NO_ROAD_LINK.includes(LANDMASS[d.id] || d.id) ? 0 : 100)) / 2;
        unused += (1 - Math.min(d.attractions.length, pace.per * s.days) / d.attractions.length) * 100;
    });
    const n = stops.length, a = alt / n, dp = dep / n, flex = 0.5 * Math.min(100, pace.free / 4 * 100) + 0.5 * Math.min(100, unused / n * 1.5);
    return { score: 0.35 * a + 0.3 * flex + 0.35 * dp, a, flex, dp };
}
function pResil() {
    const A = resilience(LAB.trips.A), B = resilience(LAB.trips.B);
    if (!A && !B) return needsTrip();
    const card = (n, r) => r ? `<div class="score-card"><h4>Trip ${n}</h4><div class="big">${Math.round(r.score)}<small>/100</small></div>
        ${bar("Alternative options", r.a)}${bar("Schedule flexibility", r.flex)}${bar("Low dependency", r.dp)}</div>` : `<div class="score-card"><h4>Trip ${n}</h4><p class="lab-small">Empty. Build it in the Trip Builder.</p></div>`;
    let verdict = "";
    if (A && B) verdict = `<p class="verdict">Trip ${A.score >= B.score ? "A" : "B"} is more resilient by ${Math.abs(Math.round(A.score - B.score))} points. ${(A.score >= B.score ? A : B).a > (A.score >= B.score ? B : A).a ? "It has more backup destinations nearby." : "It depends less on a single route or island."}</p>`;
    return `<p>How well does an itinerary survive unexpected changes? Higher = better backup options.</p><div class="score-row">${card("A", A)}${card("B", B)}</div>${verdict}
    ${note("Score = 35% alternatives (same-category places within 300 km), 30% flexibility (free time + unused attractions), 35% low dependency (number of available transport modes + not on an isolated island).")}`;
}

/* ---------- 3. Tourist Flow Balancer ---------- */
function pFlow() {
    const src = dest(LAB.flowSrc), act = new Set(src.activities.map(a => a.toLowerCase()));
    const rows = destinations.filter(d => d.id !== src.id).map(d => {
        const dact = d.activities.map(a => a.toLowerCase()), jac = dact.filter(a => act.has(a)).length / new Set([...act, ...dact]).size;
        const sim = 0.5 * (d.category === src.category ? 1 : 0) + 0.5 * jac, dist = km(src, d);
        const crowdGain = clamp(((CROWD[src.id] || 2) - (CROWD[d.id] || 2)) / 4, 0, 1);
        const score = 40 * sim + 20 * (1 - Math.min(dist / 600, 1)) + 15 * (d.budget <= src.budget ? 1 : Math.max(0, 1 - (d.budget - src.budget) / src.budget)) + 25 * crowdGain;
        return { d, sim, dist, crowdGain, score };
    }).sort((a, b) => b.score - a.score).slice(0, 6);
    return `<p>Instead of the same popular spots, find similar experiences with fewer crowds.</p>
    <div class="add-row"><label>I was going to: <select data-bind="flowSrc">${destOpts(LAB.flowSrc)}</select></label></div>
    <p class="lab-small">${src.name}: ${src.category} • crowd level ${CROWD[src.id] || 2}/5 • ${peso(src.budget)}/day</p>
    <table class="lab-table"><tr><th>Alternative</th><th>Similarity</th><th>Distance</th><th>Cost/day</th><th>Crowd</th><th>Score</th><th></th></tr>
    ${rows.map(r => `<tr><td>${r.d.name} <small>${r.d.category}</small></td><td>${Math.round(r.sim * 100)}%</td><td>${Math.round(r.dist)} km</td><td>${peso(r.d.budget)}</td><td>${CROWD[r.d.id] || 2}/5</td><td><b>${Math.round(r.score)}</b></td><td><button data-act="addid" data-id="${r.d.id}">+ Trip</button></td></tr>`).join("")}</table>
    ${note("⚠️ Crowd levels are editorial estimates for this demo. For truly crowd-aware results, replace the CROWD table in features.js with official visitor-arrival data (DOT or local government units).")}`;
}

/* ---------- 4. Travel Pace Personalizer ---------- */
const hm = h => { const m = Math.round(h * 60); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
function pPace() {
    const p = PACE[LAB.pace];
    const fits = Object.entries(PACE).map(([k, v]) => [k, 100 - Math.abs(LAB.pacePref - v.val)]).sort((a, b) => b[1] - a[1]);
    let sched = "";
    trip().forEach(s => { const d = dest(s.id);
        for (let day = 0; day < s.days; day++) {
            let t = 8, lunch = false, rows = [];
            const list = d.attractions.slice(day * p.per, day * p.per + p.per);
            if (!list.length) rows.push(["Free day", "Rest, revisit favorites, or explore on your own"]);
            list.forEach((a, k) => {
                if (t >= 11.5 && !lunch) { rows.push([hm(t) + "–" + hm(t + 1), "🍽 Lunch"]); t += 1; lunch = true; }
                rows.push([hm(t) + "–" + hm(t + p.block), "📍 " + a.name]); t += p.block;
                if (k < list.length - 1) { rows.push([hm(t) + "–" + hm(t + p.brk / 60), "☕ Break (" + p.brk + " min)"]); t += p.brk / 60; }
            });
            sched += `<div class="day-card"><h5>${d.name} • Day ${day + 1}</h5>${rows.map(r => `<div><b>${r[0]}</b> ${r[1]}</div>`).join("")}<small>Free time: about ${Math.max(0, 18 - t).toFixed(1)} h • walking ≈ ${p.walk} km</small></div>`;
        }
    });
    return `<p>Pick how you like to travel. The schedule adjusts attractions per day, breaks, walking, and free time.</p>
    <div class="pace-cards">${Object.entries(PACE).map(([k, v]) => `<button data-act="pace" data-k="${k}" class="pace-card ${LAB.pace === k ? "on" : ""}"><b>${v.label}</b><span>${v.per} attractions/day</span><span>${v.brk}-min breaks</span><span>~${v.walk} km walking</span><span>~${v.free} h free time</span></button>`).join("")}</div>
    <label>More rest ↔ more attractions: <input type="range" min="0" max="100" step="5" value="${LAB.pacePref}" data-bind="pacePref"> ${LAB.pacePref}</label>
    <p class="verdict">Best match for your preference: <b>${PACE[fits[0][0]].label}</b> (${Math.round(fits[0][1])}% fit). ${fits.map(f => PACE[f[0]].label + " " + Math.round(f[1]) + "%").join(" • ")}</p>
    ${trip().length ? `<div class="day-grid">${sched}</div>` : needsTrip()}`;
}

/* ---------- 5. Trade-Off Explorer ---------- */
function pTrade() {
    const t = trip(); if (!t.length) return needsTrip();
    const base = evalTrip(t), target = base.total - LAB.cut;
    const priciest = t.map((s, i) => [i, dest(s.id).budget * s.days]).sort((a, b) => b[1] - a[1])[0][0];
    const sc = [["Current plan", base], ["Cheaper transport", evalTrip(t, { cheap: true })], ["Budget lodging", evalTrip(t, { lodge: "budget" })],
        ["One less day per stop", evalTrip(t, { trim: 1 })], t.length > 1 ? ["Drop " + dest(t[priciest].id).name, evalTrip(t.filter((_, i) => i !== priciest))] : null,
        ["Combo: cheaper transport + budget lodging + less days", evalTrip(t, { cheap: true, lodge: "budget", trim: 1 })]].filter(Boolean);
    const give = (n, b) => { const g = [];
        if (n.travelH - b.travelH > 0.5) g.push("+" + fmtHours(n.travelH - b.travelH) + " travel");
        if (b.att - n.att > 0) g.push("−" + (b.att - n.att) + " attractions");
        if (b.comfort - n.comfort > 1) g.push("comfort −" + Math.round(b.comfort - n.comfort));
        return g.join(", ") || "nothing major"; };
    return `<p>See what you must give up when your budget drops.</p><label>Reduce budget by: <select data-bind="cut">${[500,1000,2000,3000,5000].map(v => `<option value="${v}" ${v == LAB.cut ? "selected" : ""}>${peso(v)}</option>`).join("")}</select></label>
    <p class="lab-small">Target: ${peso(target)} or less (current ${peso(base.total)})</p>
    <table class="lab-table"><tr><th>Scenario</th><th>Total</th><th>Saved</th><th>Meets target?</th><th>Travel</th><th>Attractions</th><th>Comfort</th><th>You give up</th></tr>
    ${sc.map(([n, e]) => `<tr class="${e.total <= target ? "ok" : ""}"><td>${n}</td><td>${peso(e.total)}</td><td>${peso(base.total - e.total)}</td><td>${e.total <= target ? "✅ Yes" : "❌ No"}</td><td>${fmtHours(e.travelH)}</td><td>${e.att}</td><td>${Math.round(e.comfort)}</td><td>${n === "Current plan" ? "-" : give(e, base)}</td></tr>`).join("")}</table>`;
}

/* ---------- 6. Local Benefit Index ---------- */
function pLocal() {
    const rows = destinations.map(d => ({ d, f: LOCAL[d.id], idx: localIdx(d.id) })).sort((a, b) => b.idx - a.idx || a.d.name.localeCompare(b.d.name));
    const tr = trip().map(s => localIdx(s.id)), avg = tr.length ? tr.reduce((a, b) => a + b, 0) / tr.length * 100 : null;
    const tick = v => v ? "✅" : "–";
    return `<p>Destinations with documented community-based tourism, local guides, and locally operated activities score higher.</p>
    <p class="verdict">Formula: 40% community-based tourism + 30% local guides + 30% locally operated activities. ${avg === null ? "" : `Your Trip ${LAB.slot} average: <b>${Math.round(avg)}/100</b>.`}</p>
    <div class="scroll"><table class="lab-table"><tr><th>Destination</th><th>Community-based</th><th>Local guides</th><th>Local operators</th><th>Index</th></tr>
    ${rows.map(r => `<tr><td>${r.d.name}</td>${r.f ? r.f.map(v => `<td>${tick(v)}</td>`).join("") : '<td colspan="3" class="lab-small">Not yet documented</td>'}<td><b>${Math.round(r.idx * 100)}</b></td></tr>`).join("")}</table></div>
    ${note("⚠️ Preliminary indicators for classroom demo. 'Not yet documented' means no data entered, not that a place has no local benefit. Verify each flag with DOT or LGU sources before publishing.")}`;
}

/* ---------- 7. FairTrip ---------- */
function fairPlan() {
    const F = LAB.fair, P = F.prefs.slice(0, F.n), org = Object.assign({}, ORIGINS)[LAB.origin];
    const pool = destinations.filter(d => haversine(org, [d.lat, d.lon]) <= 800 && d.name !== LAB.origin);
    const sat = (p, d) => P[p][CATS.indexOf(d.category)] / 5 * 100;
    const metrics = ch => P.map((_, p) => ch.reduce((s, d) => s + sat(p, d), 0) / ch.length);
    const maj = pool.slice().sort((a, b) => P.reduce((s, _, p) => s + sat(p, b) - sat(p, a), 0) || b.rating - a.rating).slice(0, F.N);
    const fair = []; let left = pool.slice();
    for (let k = 0; k < F.N && left.length; k++) {
        const best = left.map(d => { const cum = P.map((_, p) => fair.reduce((s, x) => s + sat(p, x), 0) + sat(p, d)).map(v => v / (k + 1));
            return { d, sc: 0.5 * Math.min(...cum) + 0.5 * cum.reduce((a, b) => a + b, 0) / cum.length + d.rating }; }).sort((a, b) => b.sc - a.sc)[0].d;
        fair.push(best); left = left.filter(x => x !== best);
    }
    return { P, maj, fair, mm: metrics(maj), mf: metrics(fair) };
}
function pFair() {
    const F = LAB.fair, r = fairPlan();
    const sum = (n, ch, m) => `<div class="score-card"><h4>${n}</h4><p>${ch.map(d => d.name).join(" → ")}</p>${m.map((v, p) => bar("Traveler " + (p + 1), v)).join("")}
        <p class="lab-small">Lowest: ${Math.round(Math.min(...m))} • Gap: ${Math.round(Math.max(...m) - Math.min(...m))}</p></div>`;
    const worst = r.mm.indexOf(Math.min(...r.mm));
    return `<p>Rate how much each traveler likes each type of place (0 to 5). FairTrip checks that nobody is always left out.</p>
    <div class="lab-grid"><label>Travelers<select data-bind="fn">${[2,3,4].map(v => `<option ${v === F.n ? "selected" : ""}>${v}</option>`).join("")}</select></label>
    <label>Stops<select data-bind="fN">${[2,3,4,5].map(v => `<option ${v === F.N ? "selected" : ""}>${v}</option>`).join("")}</select></label></div>
    <table class="lab-table"><tr><th></th>${CATS.map(c => `<th>${c}</th>`).join("")}</tr>
    ${r.P.map((pr, p) => `<tr><td>Traveler ${p + 1}</td>${pr.map((v, c) => `<td><input type="number" min="0" max="5" value="${v}" class="num" data-bind="fp" data-p="${p}" data-c="${c}"></td>`).join("")}</tr>`).join("")}</table>
    <div class="score-row">${sum("Majority-pleasing plan", r.maj, r.mm)}${sum("Fair plan", r.fair, r.mf)}</div>
    <p class="verdict">${Math.min(...r.mf) > Math.min(...r.mm) ? `The fair plan raises the least-satisfied traveler from ${Math.round(Math.min(...r.mm))} to ${Math.round(Math.min(...r.mf))}. In the majority plan, Traveler ${worst + 1} is the most left out.` : "Preferences are already balanced, so both plans are equally fair."}
    <button data-act="usefair">Use fair plan as Trip ${LAB.slot}</button></p>${note("Satisfaction = the traveler's rating for the destination's category. Fair plan picks stops that maximize the lowest cumulative score (50%) plus the group average (50%). Destinations within 800 km of your starting point.")}`;
}

/* ---------- 8. Season-Sensitive Matcher ---------- */
function pSeason() {
    const m = LAB.month;
    const rows = destinations.map(d => ({ d, s: seasonScore(d, m) })).sort((a, b) => b.s.score - a.s.score || b.d.rating - a.d.rating);
    const row = r => `<tr><td>${r.d.name}</td><td>${r.d.bestTime}</td><td>${r.s.inBest ? "✅ In season" : "Off-season"}</td><td>${r.s.ev.map(e => "🎉 " + e.name).join(", ") || "-"}</td><td>${r.s.typhoon ? "⚠️ Higher typhoon-risk period" : "-"}</td><td><b>${Math.round(r.s.score)}</b></td></tr>`;
    const head = "<tr><th>Destination</th><th>Best months</th><th>Season</th><th>Documented event</th><th>Caution</th><th>Score</th></tr>";
    const mine = trip().map(s => ({ d: dest(s.id), s: seasonScore(dest(s.id), m) }));
    return `<p>Which destinations fit <b>${MONTHS[m]}</b> best? (Change the month in the Trip Builder.)</p>
    ${mine.length ? `<h4>Your Trip ${LAB.slot} in ${MONTHS[m]}</h4><table class="lab-table">${head}${mine.map(row).join("")}</table>` : ""}
    <h4>Top matches for ${MONTHS[m]}</h4><table class="lab-table">${head}${rows.slice(0, 10).map(row).join("")}</table>
    ${note("Score: in best months 100, otherwise 40; −15 in Jun–Nov for northern or eastern areas (typical typhoon season); +10 for a documented local event. Based on general seasonal patterns, not a weather forecast. Check PAGASA and local advisories before traveling.")}`;
}

/* ---------- 9. Connectivity-Aware Planner ---------- */
function connStats() {
    const t = trip(); if (!t.length) return null;
    const ev = evalTrip(t); let w = 0, c = 0, need = 0, done = 0;
    t.forEach(s => { const lvl = CONN[s.id] || 2; w += s.days; c += ((lvl - 1) / 2 * 100) * s.days;
        const req = lvl === 3 ? 3 : lvl === 2 ? 4 : 5; need += req;
        done += CHECKS.slice(0, req).filter((_, k) => LAB.checks[s.id + k]).length; });
    const conn = c / w, ready = need ? done / need * 100 : 0;
    return { conn, ready, risk: (100 - conn) * (1 - ready / 100 * 0.8), ev };
}
function pConn() {
    const t = trip(), st = connStats(); if (!st) return needsTrip();
    const lbl = { 1: "Weak signal", 2: "Fair signal", 3: "Good signal" };
    const sorted = t.map(s => s).sort((a, b) => (CONN[a.id] || 2) - (CONN[b.id] || 2));
    return `<p>Check how much your trip depends on internet, and prepare offline.</p>
    <div class="kpis"><div><b>${Math.round(st.conn)}</b><span>Connectivity of destinations</span></div><div><b>${Math.round(st.ready)}%</b><span>Offline readiness</span></div>
      <div><b>${st.risk < 25 ? "Low" : st.risk < 50 ? "Medium" : "High"}</b><span>Internet-dependency risk (${Math.round(st.risk)})</span></div></div>
    ${sorted.map(s => { const d = dest(s.id), lvl = CONN[s.id] || 2, req = lvl === 3 ? 3 : lvl === 2 ? 4 : 5;
        return `<div class="day-card"><h5>${d.name} <small>${lbl[lvl]}${lvl === 1 ? " – prepare first!" : ""}</small></h5>
        ${CHECKS.slice(0, req).map((c, k) => `<label class="chk"><input type="checkbox" data-bind="chk" data-key="${s.id}${k}" ${LAB.checks[s.id + k] ? "checked" : ""}> ${c}</label>`).join("")}</div>`; }).join("")}
    <button class="primary-btn" data-act="offline">⬇ Download offline trip info (.txt)</button>
    ${note("Signal levels are editorial estimates for this demo. Replace the CONN table with NTC coverage maps or verified user reports. Risk = (100 − connectivity) reduced by up to 80% when you finish the offline checklist.")}`;
}
function offlineText() {
    const ev = evalTrip(trip());
    return `LakbayPH offline trip info (Trip ${LAB.slot})\nFrom: ${LAB.origin}   Month: ${MONTHS[LAB.month]}\nEstimated total: ${peso(ev.total)}\n\n` +
        trip().map((s, i) => { const d = dest(s.id), l = ev.legs[i];
            return `${i + 1}. ${d.name} (${s.days} day/s)\n   Getting there: ${l.ok ? (l.same ? "start" : MODES[l.mode].label + ", about " + fmtHours(l.hours)) : "no route found"}\n   Best time: ${d.bestTime}\n   Attractions: ${d.attractions.map(a => a.name).join(", ")}\n   Signal: ${["", "weak", "fair", "good"][CONN[s.id] || 2]}\n`; }).join("\n") +
        "\nEstimates only. Confirm schedules and prices before traveling.";
}

/* ---------- 10. Explainable Recommender ---------- */
const FACTORS = [["Budget fit", 20], ["Category match", 20], ["Season fit", 20], ["Travel time", 20], ["Local benefit", 10], ["Connectivity", 10]];
function recommend() {
    const R = LAB.rec;
    return destinations.filter(d => d.name !== LAB.origin).map(d => {
        const modes = Object.keys(MODES).map(m => estimate(m, LAB.origin, d.id)).filter(e => e.avail), h = modes.length ? Math.min(...modes.map(e => e.hours)) : null;
        const f = [d.budget <= R.budget ? 100 : Math.max(0, 100 - (d.budget - R.budget) / R.budget * 200),
            R.cat === "Any" || d.category === R.cat ? 100 : 20, seasonScore(d, LAB.month).score,
            h === null ? 0 : h <= R.maxH ? 100 : Math.max(0, 100 - (h - R.maxH) / R.maxH * 100), localIdx(d.id) * 100, ((CONN[d.id] || 2) - 1) / 2 * 100];
        return { d, h, f, total: f.reduce((s, v, i) => s + v * FACTORS[i][1], 0) / 100 };
    }).sort((a, b) => b.total - a.total);
}
function pExplain() {
    const R = LAB.rec, rs = recommend().slice(0, 5), top = rs[0];
    const why = (r, i) => { const ok = [], no = [], se = seasonScore(r.d, LAB.month);
        if (r.f[0] === 100) ok.push(`it is within your budget (${peso(r.d.budget)}/day)`); else no.push(`over budget by ${peso(r.d.budget - R.budget)}/day`);
        if (R.cat !== "Any" && r.f[1] === 100) ok.push(`it matches ${R.cat}`); else if (r.f[1] < 100) no.push(`it is ${r.d.category}, not ${R.cat}`);
        if (se.inBest) ok.push(`${MONTHS[LAB.month]} is in season`); else no.push(`${MONTHS[LAB.month]} is outside the best months`);
        if (se.typhoon) no.push("it falls in the Jun–Nov typhoon-risk period for this area");
        if (r.h === null) no.push("no transport route from your starting point"); else if (r.f[3] === 100) ok.push(`it is reachable in about ${fmtHours(r.h)}`); else no.push(`travel takes about ${fmtHours(r.h)} (limit ${R.maxH} h)`);
        if (r.f[4] > 0) ok.push("it has documented local-benefit indicators");
        let txt = i === 0 ? `Ranked first because ${ok.join(", ") || "it scores best overall"}.` : `Ranked #${i + 1}, ${(top.total - r.total).toFixed(1)} points below #1.`;
        if (i > 0) { const diffs = r.f.map((v, k) => [FACTORS[k][0], (top.f[k] - v) * FACTORS[k][1] / 100]).sort((x, y) => y[1] - x[1]); if (diffs[0][1] > 0) txt += ` Biggest gap: ${diffs[0][0]} (−${diffs[0][1].toFixed(1)}).`; }
        return txt + (no.length ? ` Not met: ${no.join("; ")}.` : " All constraints met."); };
    return `<div class="lab-grid"><label>Budget per day (₱)<input type="number" min="500" step="100" value="${R.budget}" data-bind="rbudget" class="num wide"></label>
    <label>Category<select data-bind="rcat">${["Any", ...CATS].map(c => `<option ${c === R.cat ? "selected" : ""}>${c}</option>`).join("")}</select></label>
    <label>Max travel time (hours)<input type="number" min="1" value="${R.maxH}" data-bind="rmaxh" class="num"></label></div>
    <p class="lab-small">From ${LAB.origin} in ${MONTHS[LAB.month]} (change in Trip Builder). Weights: ${FACTORS.map(f => f[0] + " " + f[1] + "%").join(", ")}.</p>
    ${rs.map((r, i) => `<div class="rec-card"><h4>#${i + 1} ${r.d.name} <span class="big-sm">${r.total.toFixed(1)}</span> <button data-act="addid" data-id="${r.d.id}">+ Trip</button></h4>
      <p>${why(r, i)}</p>${FACTORS.map((f, k) => bar(f[0], r.f[k])).join("")}</div>`).join("")}`;
}


/* ---------- 12. Journey Preview (animated multi-stop map) ---------- */
const NS = "http://www.w3.org/2000/svg";
let playing = false;
function pJourney() {
    const t = trip(); if (!t.length) return needsTrip();
    const land = ISLANDS.map(poly => `<polygon class="land" points="${poly.map(([lo, la]) => proj([la, lo]).join(",")).join(" ")}"/>`).join("");
    const [ox, oy] = proj(ORIGINS[LAB.origin]);
    const pins = t.map((s, i) => { const d = dest(s.id), [x, y] = proj([d.lat, d.lon]);
        return `<g class="jpin" data-i="${i}" transform="translate(${x} ${y})"><circle r="9"/><text y="4" text-anchor="middle">${i + 1}</text><text class="jlabel" x="12" y="-8">${d.name}</text></g>`; }).join("");
    return `<p>Watch your whole trip play out on the map of the Philippines.</p>
    <div class="journey"><svg id="jMap" viewBox="0 0 480 720" class="jmap">${land}<g id="jTrail"></g>
      <circle cx="${ox}" cy="${oy}" r="7" class="origin-dot"/><text x="${ox + 10}" y="${oy + 4}" class="jlabel">${LAB.origin}</text>${pins}
      <text id="jVeh" text-anchor="middle" font-size="24" y="8" style="display:none"></text></svg>
      <div><button class="primary-btn" data-act="play">▶ Play journey</button><div id="jInfo" class="flight-info show"><p class="flight-hint">Press play to start from ${LAB.origin}.</p></div></div></div>`;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
async function playJourney() {
    if (playing) return; playing = true;
    const svg = $("jMap"), t = trip(), ev = evalTrip(t), veh = svg.querySelector("#jVeh"), trailBox = svg.querySelector("#jTrail"), info = $("jInfo");
    trailBox.innerHTML = ""; svg.querySelectorAll(".jpin").forEach(p => p.classList.remove("hit"));
    let prev = ORIGINS[LAB.origin];
    for (let k = 0; k < t.length; k++) {
        const d = dest(t[k].id), l = ev.legs[k], a = proj(prev), b = proj([d.lat, d.lon]);
        info.innerHTML = `<p class="flight-hint">${l.ok && !l.same ? MODES[l.mode].icon + " Traveling to " + d.name + " (" + fmtHours(l.hours) + ")..." : l.same ? "Starting in " + d.name : "⚠️ No route to " + d.name}</p>`;
        if (l.ok && !l.same) {
            const bend = l.mode === "plane" ? 0.25 : 0.06, cx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, cy = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend - (l.mode === "plane" ? 30 : 0);
            const path = document.createElementNS(NS, "path"); path.setAttribute("d", `M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}`);
            path.setAttribute("class", "trail " + l.mode); trailBox.appendChild(path);
            const len = path.getTotalLength(), t0 = performance.now(), dur = l.mode === "plane" ? 2200 : 3000;
            veh.style.display = "block"; veh.textContent = MODES[l.mode].icon;
            await new Promise(res => { (function f(now) { const r = Math.min((now - t0) / dur, 1), e = r < .5 ? 2 * r * r : 1 - Math.pow(-2 * r + 2, 2) / 2, pt = path.getPointAtLength(e * len);
                veh.setAttribute("x", pt.x); veh.setAttribute("y", pt.y + 8); path.style.strokeDasharray = `${e * len} ${len}`; r < 1 ? requestAnimationFrame(f) : res(); })(t0); });
        }
        svg.querySelector(`.jpin[data-i="${k}"]`).classList.add("hit");
        info.innerHTML = `<h3>📍 ${d.name} <small>(${t[k].days} day/s)</small></h3><p>${d.description}</p><div class="attraction-gallery">${d.attractions.map(x => `<figure class="attraction-card pop"><img src="${x.image}" alt="${x.name}" onerror="this.onerror=null;this.src=makePlaceholder(this.alt);"><figcaption>${x.name}</figcaption></figure>`).join("")}</div>`;
        prev = [d.lat, d.lon]; await wait(1800);
    }
    veh.style.display = "none"; info.innerHTML += `<p class="verdict">🎉 Journey complete! ${peso(ev.total)} • ${fmtHours(ev.travelH)} of travel.</p>`; playing = false;
}

/* ---------- 13. Budget Breakdown ---------- */
function pBudget() {
    const t = trip(); if (!t.length) return needsTrip();
    const ev = evalTrip(t), n = LAB.people;
    const parts = [["Transport", ev.travelCost, "#0ea5e9"], ["Lodging", ev.stay * .45, "#14b8a6"], ["Food", ev.stay * .30, "#f59e0b"], ["Activities", ev.stay * .15, "#8b5cf6"], ["Miscellaneous", ev.stay * .10, "#ef4444"]];
    const total = parts.reduce((a, p) => a + p[1], 0); let acc = 0;
    const grad = parts.map(p => { const s0 = acc / total * 100; acc += p[1]; return `${p[2]} ${s0}% ${acc / total * 100}%`; }).join(",");
    return `<div class="budget-grid"><div class="donut" style="background:conic-gradient(${grad})"><div><b>${peso(total)}</b><span>per person</span></div></div>
    <div>${parts.map(p => `<div class="legend"><i style="background:${p[2]}"></i><span>${p[0]}</span><b>${peso(p[1])}</b><small>${Math.round(p[1] / total * 100)}%</small></div>`).join("")}
    <label class="inline">Travelers <select data-bind="people">${[1,2,3,4,5,6].map(v => `<option ${v === n ? "selected" : ""}>${v}</option>`).join("")}</select></label>
    <div class="kpis"><div><b>${peso(total * n)}</b><span>Group total (${n})</span></div><div><b>${peso(total * 1.1)}</b><span>With 10% contingency (per person)</span></div><div><b>${peso(total / ev.days)}</b><span>Average per day</span></div></div></div></div>
    ${note("Assumes each destination's daily budget is per person, split 45% lodging, 30% food, 15% activities, 10% miscellaneous (assumed ratios). Transport uses the same estimates as the Trip Builder.")}`;
}

/* ---------- 14. Smart Packing List ---------- */
function packItems() {
    const t = trip(), m = LAB.month, it = new Set(["Valid ID", "Phone + charger", "Power bank", "Personal medicines", "Face mask / hand sanitizer"]);
    const cats = new Set(t.map(s => dest(s.id).category)), ev = evalTrip(t);
    if (cats.has("Beach")) ["Sunscreen (reef-safe)", "Swimwear", "Quick-dry towel", "Waterproof phone pouch", "Water shoes"].forEach(x => it.add(x));
    if (cats.has("Mountain")) ["Light jacket", "Trekking shoes", "Reusable water bottle"].forEach(x => it.add(x));
    if (cats.has("City")) ["Comfortable walking shoes", "Small day bag", "Umbrella"].forEach(x => it.add(x));
    if (cats.has("Nature")) ["Insect repellent", "Hat and sunglasses", "Dry bag", "Hiking sandals"].forEach(x => it.add(x));
    if (m >= 5 && m <= 10) ["Raincoat / poncho", "Dry bag for electronics"].forEach(x => it.add(x));
    if ([11, 0, 1].includes(m) && t.some(s => ["baguio","sagada","banaue","tagaytay","bukidnon","lake-sebu"].includes(s.id))) it.add("Warm sweater (cool highlands)");
    if (ev.legs.some(l => l.mode === "plane")) ["Boarding pass / e-ticket", "Check baggage rules"].forEach(x => it.add(x));
    if (ev.legs.some(l => l.crossings || (l.mode && l.mode !== "plane" && l.mode !== "-" && l.hours > 8))) ["Motion-sickness tablets", "Neck pillow"].forEach(x => it.add(x));
    if (t.some(s => (CONN[s.id] || 2) === 1)) ["Offline maps", "Extra cash", "Spare power bank"].forEach(x => it.add(x));
    return [...it];
}
function pPacking() {
    if (!trip().length) return needsTrip();
    const items = packItems(), done = items.filter(x => LAB.pack[x]).length;
    return `<p>A checklist generated from your destinations' categories, the month (${MONTHS[LAB.month]}), your transport, and signal strength.</p>
    ${bar("Packed", done / items.length * 100)}<div class="pack-grid">${items.map(x => `<label class="chk pack ${LAB.pack[x] ? "done" : ""}"><input type="checkbox" data-bind="pack" data-key="${x}" ${LAB.pack[x] ? "checked" : ""}> ${x}</label>`).join("")}</div>`;
}

/* ---------- 15. Trip Report (scorecard + boarding passes) ---------- */
function reportScores() {
    const t = trip(), ev = evalTrip(t), r = resilience(t), cs = connStats();
    const season = t.reduce((a, s) => a + seasonScore(dest(s.id), LAB.month).score, 0) / t.length;
    const local = t.reduce((a, s) => a + localIdx(s.id) * 100, 0) / t.length;
    const daily = ev.stay / ev.days, b = LAB.rec.budget, value = daily <= b ? 100 : Math.max(0, 100 - (daily - b) / b * 200);
    return [["Resilience", r.score], ["Season fit", season], ["Local benefit", local], ["Connectivity", cs.conn], ["Comfort", ev.comfort], ["Value", value]];
}
function pReport() {
    const t = trip(); if (!t.length) return needsTrip();
    const sc = reportScores(), ev = evalTrip(t), avg = sc.reduce((a, x) => a + x[1], 0) / sc.length;
    const grade = avg >= 85 ? "A" : avg >= 70 ? "B" : avg >= 55 ? "C" : "D";
    const C = 150, R = 110, pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / sc.length; return [C + R * v / 100 * Math.cos(a), C + R * v / 100 * Math.sin(a)]; };
    const ring = f => sc.map((_, i) => pt(i, f).join(",")).join(" ");
    const best = sc.slice().sort((a, b) => b[1] - a[1])[0], worst = sc.slice().sort((a, b) => a[1] - b[1])[0];
    const radar = `<svg viewBox="0 0 300 300" class="radar">${[25, 50, 75, 100].map(f => `<polygon points="${ring(f)}" class="ring"/>`).join("")}
        <polygon points="${sc.map((x, i) => pt(i, x[1]).join(",")).join(" ")}" class="shape"/>
        ${sc.map((x, i) => { const [lx, ly] = pt(i, 122); return `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="10">${x[0]}</text>`; }).join("")}</svg>`;
    const passes = ev.legs.map((l, i) => `<div class="pass"><div class="pass-main"><small>LEG ${i + 1}</small><h4>${l.from} ➜ ${l.to}</h4>
        <p>${l.ok ? (l.same ? "Start here" : MODES[l.mode].icon + " " + MODES[l.mode].label + " • " + fmtHours(l.hours) + " • ~" + peso(l.cost)) : "⚠️ No route available"}</p></div><div class="pass-stub"><span class="barcode"></span><small>${t[i].days} day(s)</small></div></div>`).join("");
    return `<div class="report-grid"><div>${radar}</div><div><div class="grade">${grade}</div><p class="verdict">Overall score <b>${Math.round(avg)}/100</b>.<br>Strongest: <b>${best[0]}</b> (${Math.round(best[1])}). Weakest: <b>${worst[0]}</b> (${Math.round(worst[1])}). Try the matching page above to improve it.</p>
      <div class="kpis"><div><b>${peso(ev.total)}</b><span>Total estimate</span></div><div><b>${fmtHours(ev.travelH)}</b><span>Travel</span></div><div><b>${ev.days}</b><span>Days</span></div></div></div></div>
    <h4>🎫 Your travel passes</h4>${passes}<button class="primary-btn no-print" data-act="print">🖨 Print / Save as PDF</button>
    ${note("Scores combine the analyses from the previous pages. All numbers are estimates for planning, not bookings.")}`;
}

/* ---------- pages + events ---------- */
const PAGES = [["builder","Trip Builder","Build your itinerary"],["ripple","RippleTrip","See how one change affects the whole trip"],["resil","Trip Resilience Score","How well does your trip survive surprises?"],
    ["flow","Tourist Flow Balancer","Similar experiences, fewer crowds"],["pace","Travel Pace Personalizer","Relaxed, balanced, or packed"],["trade","Travel Trade-Off Explorer","What you give up for a lower budget"],
    ["local","Local Benefit Index","Support local communities"],["fair","FairTrip","A fair plan for the whole group"],["season","Season-Sensitive Matcher","Best places for your travel month"],
    ["conn","Connectivity-Aware Planner","Be ready when the signal is weak"],["explain","Explainable Recommender","See exactly why each place is ranked"],
    ["journey","Journey Preview","Watch your whole trip on the map"],["budget","Budget Breakdown","Where your money goes"],["packing","Smart Packing List","What to bring for this trip"],["report","Trip Report","Your final scorecard and travel passes"]];
const fileOf = i => `lab-${String(i + 1).padStart(2, "0")}-${PAGES[i][0]}.html`;
const PANELS_EXTRA = { journey: pJourney, budget: pBudget, packing: pPacking, report: pReport };
const PANELS = { builder: pBuilder, ripple: pRipple, resil: pResil, flow: pFlow, pace: pPace, trade: pTrade, local: pLocal, fair: pFair, season: pSeason, conn: pConn, explain: pExplain, ...PANELS_EXTRA };
let firstDraw = true;
function draw() {
    const key = document.body.dataset.page, i = PAGES.findIndex(p => p[0] === key), root = $("labRoot"); if (!root || i < 0) return;
    save();
    const t = trip(), ev = t.length ? evalTrip(t) : null;
    $("labTop").innerHTML = t.length ? `<b>Trip ${LAB.slot}:</b> ${LAB.origin} ➜ ${t.map(s => dest(s.id).name).join(" ➜ ")} <span>• ${peso(ev.total)} • ${fmtHours(ev.travelH)} travel</span>` : "<b>No trip yet.</b> Start in the Trip Builder.";
    root.innerHTML = `<div class="stepper">${PAGES.map((p, k) => `<a href="${fileOf(k)}" class="step ${k === i ? "on" : k < i ? "done" : ""}" title="${p[1]}">${k + 1}</a>`).join("")}</div>
    <div class="lab-page ${firstDraw ? "enter" : ""}"><p class="step-label">Page ${i + 1} of ${PAGES.length}</p><h2>${PAGES[i][1]}</h2><p class="lab-sub">${PAGES[i][2]}</p>
    <div class="lab-panel">${PANELS[key]()}</div>
    <div class="lab-nav no-print">${i ? `<a class="nav-btn" data-go="${fileOf(i - 1)}" href="${fileOf(i - 1)}">← Back</a>` : `<a class="nav-btn" href="index.html">← Home</a>`}
    ${i < PAGES.length - 1 ? `<a class="nav-btn next" data-go="${fileOf(i + 1)}" href="${fileOf(i + 1)}">Next: ${PAGES[i + 1][1]} →</a>` : `<a class="nav-btn next" href="index.html">Finish ✔</a>`}</div></div>`;
    firstDraw = false;
}
function addStop(id) { if (!trip().some(s => s.id === id)) trip().push({ id, days: 2 }); }

document.addEventListener("DOMContentLoaded", () => {
    try { loadSavedTheme(); } catch (e) {}
    const root = $("labRoot"); if (!root || typeof destinations === "undefined") return;
    document.addEventListener("click", e => {
        const g = e.target.closest("[data-go]");
        if (g) { e.preventDefault(); document.querySelector(".lab-page")?.classList.add("leaving"); setTimeout(() => location.href = g.dataset.go, 280); }
    });
    root.addEventListener("click", e => {
        const b = e.target.closest("[data-act]"); if (!b) return;
        const a = b.dataset.act, i = +b.dataset.i, t = trip();
        if (a === "play") { playJourney(); return; }
        if (a === "print") { window.print(); return; }
        if (a === "slot") LAB.slot = b.dataset.s;
        else if (a === "add") addStop($("addStop").value);
        else if (a === "sample") LAB.trips[LAB.slot] = ["baguio", "boracay", "cebu"].map(id => ({ id, days: 2 }));
        else if (a === "addid") { addStop(b.dataset.id); toast(dest(b.dataset.id).name + " added to Trip " + LAB.slot); }
        else if (a === "del") t.splice(i, 1);
        else if (a === "up" && i > 0) [t[i - 1], t[i]] = [t[i], t[i - 1]];
        else if (a === "down" && i < t.length - 1) [t[i + 1], t[i]] = [t[i], t[i + 1]];
        else if (a === "rmode") LAB.ripMode = b.dataset.m;
        else if (a === "apply") { t[Math.min(LAB.ripIdx, t.length - 1)].id = b.dataset.id; LAB.ripMode = ""; }
        else if (a === "pace") LAB.pace = b.dataset.k;
        else if (a === "usefair") { const r = fairPlan(); LAB.trips[LAB.slot] = r.fair.map(d => ({ id: d.id, days: 2 })); toast("Fair plan loaded into Trip " + LAB.slot); }
        else if (a === "offline") {
            const url = URL.createObjectURL(new Blob([offlineText()], { type: "text/plain" }));
            const l = document.createElement("a"); l.href = url; l.download = "lakbayph-offline-trip.txt"; l.click(); URL.revokeObjectURL(url); return;
        }
        draw();
    });
    root.addEventListener("change", e => {
        const el = e.target, k = el.dataset.bind; if (!k) return;
        const v = el.value;
        if (k === "days") trip()[+el.dataset.i].days = clamp(+v || 1, 1, 7);
        else if (k === "origin" || k === "pref" || k === "pace" || k === "lodge") LAB[k] = v;
        else if (k === "month") LAB.month = +v;
        else if (k === "ripIdx") { LAB.ripIdx = +v; LAB.ripMode = ""; }
        else if (k === "flowSrc") LAB.flowSrc = v;
        else if (k === "cut" || k === "pacePref" || k === "people") LAB[k] = +v;
        else if (k === "fn") LAB.fair.n = +v;
        else if (k === "fN") LAB.fair.N = +v;
        else if (k === "fp") LAB.fair.prefs[+el.dataset.p][+el.dataset.c] = clamp(+v || 0, 0, 5);
        else if (k === "chk") LAB.checks[el.dataset.key] = el.checked;
        else if (k === "pack") LAB.pack[el.dataset.key] = el.checked;
        else if (k === "rbudget") LAB.rec.budget = Math.max(500, +v || 500);
        else if (k === "rcat") LAB.rec.cat = v;
        else if (k === "rmaxh") LAB.rec.maxH = Math.max(1, +v || 1);
        draw();
    });
    draw();
});
window.LAB_DEBUG = { LAB };
})();
