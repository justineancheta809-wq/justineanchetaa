// Placeholder shown when a destination image file is missing
const imageFallback = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#14b8a6"/>' +
    '</linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>' +
    '<text x="300" y="215" font-size="42" text-anchor="middle" fill="white" ' +
    'font-family="sans-serif">LakbayPH</text></svg>'
);


// Convert an attraction name into a safe file name:  "Magellan's Cross" -> "magellans-cross"
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Each attraction gets its own picture: images/attractions/<name>.jpg
function attr(name) {
    return {
        name: name,
        image: "../images/attractions/" + slugify(name) + ".jpg"
    };
}

// Placeholder picture (shows the attraction's name) when the .jpg is missing
function makePlaceholder(label) {
    const safe = String(label || "LakbayPH")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;");
    return "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#14b8a6"/>' +
        '</linearGradient></defs><rect width="400" height="260" fill="url(#g)"/>' +
        '<text x="200" y="120" font-size="46" text-anchor="middle">📍</text>' +
        '<text x="200" y="170" font-size="24" font-weight="bold" text-anchor="middle" ' +
        'fill="white" font-family="sans-serif">' + safe + '</text></svg>'
    );
}

const destinations = [
    {
        id: "manila",
        name: "Manila",
        category: "City",
        image: "../images/manila.jpg",
        description: "Explore the historical, cultural, and modern attractions of the Philippine capital.",
        attractions: [
            attr("Intramuros"),
            attr("Rizal Park"),
            attr("National Museum"),
            attr("Manila Ocean Park")
        ],
        activities: [
            "Heritage Tour",
            "Museum Visit",
            "Food Trip",
            "City Sightseeing"
        ],
        bestTime: "November to February",
        budget: 1500,
        rating: 4.5
    },

    {
        id: "palawan",
        name: "Palawan",
        category: "Beach",
        image: "../images/palawan.jpg",
        description: "Discover beautiful beaches, clear waters, islands, and breathtaking natural scenery.",
        attractions: [
            attr("El Nido"),
            attr("Coron"),
            attr("Puerto Princesa"),
            attr("Nacpan Beach")
        ],
        activities: [
            "Island Hopping",
            "Snorkeling",
            "Beach Swimming",
            "Kayaking"
        ],
        bestTime: "November to May",
        budget: 3500,
        rating: 4.9
    },

    {
        id: "cebu",
        name: "Cebu",
        category: "Nature",
        image: "../images/cebu.jpg",
        description: "Experience a combination of beaches, waterfalls, history, food, and adventure.",
        attractions: [
            attr("Kawasan Falls"),
            attr("Moalboal"),
            attr("Magellan's Cross"),
            attr("Oslob")
        ],
        activities: [
            "Canyoneering",
            "Island Hopping",
            "Swimming",
            "Historical Tour"
        ],
        bestTime: "December to May",
        budget: 2800,
        rating: 4.8
    },

    {
        id: "baguio",
        name: "Baguio",
        category: "Mountain",
        image: "../images/baguio.jpg",
        description: "Enjoy the cool climate, mountain views, food, and relaxing atmosphere of the City of Pines.",
        attractions: [
            attr("Burnham Park"),
            attr("Camp John Hay"),
            attr("Mines View Park"),
            attr("Botanical Garden")
        ],
        activities: [
            "Sightseeing",
            "Cafe Hopping",
            "Nature Walk",
            "Food Trip"
        ],
        bestTime: "November to February",
        budget: 1800,
        rating: 4.7
    },

    {
        id: "siargao",
        name: "Siargao",
        category: "Beach",
        image: "../images/siargao.jpg",
        description: "A tropical destination known for surfing, islands, lagoons, and relaxed island life.",
        attractions: [
            attr("Cloud 9"),
            attr("Sugba Lagoon"),
            attr("Naked Island"),
            attr("Magpupungko Rock Pools")
        ],
        activities: [
            "Surfing",
            "Island Hopping",
            "Swimming",
            "Lagoon Tour"
        ],
        bestTime: "March to October",
        budget: 3200,
        rating: 4.9
    },

    {
        id: "boracay",
        name: "Boracay",
        category: "Beach",
        image: "../images/boracay.jpg",
        description: "Relax on famous white sand beaches and enjoy water activities and island experiences.",
        attractions: [
            attr("White Beach"),
            attr("Puka Beach"),
            attr("D'Mall"),
            attr("Willy's Rock")
        ],
        activities: [
            "Swimming",
            "Parasailing",
            "Island Hopping",
            "Sunset Watching"
        ],
        bestTime: "November to April",
        budget: 3500,
        rating: 4.8
    }
];

/* =========================================
   MORE DESTINATIONS (all regions of the Philippines)
   place(id, name, category, region, lat, lon, description,
         [attractions], [activities], bestTime, budget per day, rating)
   ========================================= */

function place(id, name, category, region, lat, lon, description, attractions, activities, bestTime, budget, rating) {
    return {
        id, name, category, region, lat, lon, description,
        image: "../images/" + id + ".jpg",
        attractions: attractions.map(attr),
        activities, bestTime, budget, rating
    };
}

// Coordinates + island group for the first 6 destinations
const baseInfo = {
    manila: ["Luzon", 14.6, 121.0], palawan: ["Luzon", 11.2, 119.4], cebu: ["Visayas", 10.3, 123.9],
    baguio: ["Luzon", 16.4, 120.6], siargao: ["Mindanao", 9.85, 126.05], boracay: ["Visayas", 11.97, 121.92]
};
destinations.forEach(d => {
    const [region, lat, lon] = baseInfo[d.id];
    d.region = region; d.lat = lat; d.lon = lon;
});

destinations.push(
    // ---------------- LUZON ----------------
    place("batanes", "Batanes", "Nature", "Luzon", 20.45, 121.97, "Rolling green hills, stone houses, and dramatic cliffs at the northern edge of the Philippines.",
        ["Marlboro Hills", "Basco Lighthouse", "Sabtang Island", "Honesty Coffee Shop"], ["Island Tour", "Photography", "Cycling"], "March to June", 4500, 4.9),
    place("pagudpud", "Pagudpud", "Beach", "Luzon", 18.56, 120.79, "White sand beaches and windmills in Ilocos Norte.",
        ["Saud Beach", "Bangui Windmills", "Kapurpurawan Rock Formation", "Patapat Viaduct"], ["Swimming", "Road Trip", "Surfing"], "November to May", 2500, 4.6),
    place("vigan", "Vigan", "City", "Luzon", 17.57, 120.39, "A UNESCO World Heritage city with Spanish-era cobblestone streets.",
        ["Calle Crisologo", "Vigan Cathedral", "Hidden Garden", "Pagburnayan Pottery"], ["Kalesa Ride", "Heritage Tour", "Food Trip"], "November to April", 1800, 4.7),
    place("hundred-islands", "Hundred Islands", "Beach", "Luzon", 16.2, 120.0, "A national park of 124 islands in Pangasinan, great for island hopping.",
        ["Governor's Island", "Quezon Island", "Children's Island", "Lucap Wharf"], ["Island Hopping", "Kayaking", "Snorkeling"], "November to May", 2000, 4.5),
    place("banaue", "Banaue", "Mountain", "Luzon", 16.92, 121.06, "Home of the 2,000-year-old Ifugao Rice Terraces.",
        ["Banaue Rice Terraces", "Batad Rice Terraces", "Tappiya Falls", "Banaue Museum"], ["Trekking", "Photography", "Cultural Tour"], "April to June", 1800, 4.8),
    place("sagada", "Sagada", "Mountain", "Luzon", 17.08, 120.9, "Cool mountain town known for hanging coffins, caves, and sea of clouds.",
        ["Hanging Coffins", "Sumaguing Cave", "Kiltepan Viewpoint", "Bomod-ok Falls"], ["Caving", "Hiking", "Sunrise Viewing"], "November to May", 1800, 4.8),
    place("palaui", "Palaui Island", "Nature", "Luzon", 18.52, 122.15, "A remote protected island in Cagayan with turquoise water and a lighthouse.",
        ["Cape Engano Lighthouse", "Punta Verde", "Anguib Beach", "Callao Cave"], ["Trekking", "Snorkeling", "Camping"], "March to June", 2200, 4.6),
    place("baler", "Baler", "Beach", "Luzon", 15.76, 121.56, "The birthplace of surfing in the Philippines, in Aurora.",
        ["Sabang Beach", "Ditumabo Mother Falls", "Digisit Beach", "Baler Church"], ["Surfing", "Waterfall Visit", "Beach Camping"], "October to March", 2000, 4.5),
    place("pinatubo", "Mt. Pinatubo", "Nature", "Luzon", 15.13, 120.35, "A 4x4 ride and short trek to a stunning blue crater lake.",
        ["Pinatubo Crater Lake", "Capas Trail", "Anawangin Cove", "Lahar Canyon"], ["4x4 Ride", "Trekking", "Camping"], "November to April", 2500, 4.7),
    place("clark", "Clark, Pampanga", "City", "Luzon", 15.18, 120.56, "Known as the culinary capital of the Philippines, with museums and parks.",
        ["Clark Museum", "Dinosaurs Island", "Mt. Arayat", "Pampanga Food Trail"], ["Food Trip", "Hot Air Balloon", "Museum Visit"], "November to April", 2200, 4.4),
    place("tagaytay", "Tagaytay", "Mountain", "Luzon", 14.1, 120.96, "Cool highlands with a view of Taal Volcano.",
        ["Taal Volcano View", "People's Park in the Sky", "Sky Ranch", "Picnic Grove"], ["Sightseeing", "Cafe Hopping", "Zipline"], "November to February", 1800, 4.5),
    place("batangas", "Batangas", "Beach", "Luzon", 13.76, 121.05, "Dive spots, coves, and beach resorts close to Manila.",
        ["Anilao Dive Sites", "Taal Heritage Town", "Calatagan Beach", "Laiya Beach"], ["Diving", "Beach Camping", "Heritage Tour"], "November to May", 2200, 4.5),
    place("puerto-galera", "Puerto Galera", "Beach", "Luzon", 13.5, 120.95, "A UNESCO Biosphere Reserve in Mindoro with coves and coral reefs.",
        ["White Beach", "Sabang Beach", "Tamaraw Falls", "Big La Laguna Beach"], ["Diving", "Snorkeling", "Island Hopping"], "November to May", 2500, 4.5),
    place("coron", "Coron", "Beach", "Luzon", 12.0, 120.2, "Limestone cliffs, shipwreck dives, and clear lakes in Busuanga.",
        ["Kayangan Lake", "Twin Lagoon", "Barracuda Lake", "Mt. Tapyas"], ["Island Hopping", "Wreck Diving", "Hot Springs"], "November to May", 3500, 4.9),
    place("puerto-princesa", "Puerto Princesa", "Nature", "Luzon", 9.74, 118.73, "Home of the Underground River, a New7Wonders of Nature.",
        ["Underground River", "Honda Bay", "Iwahig Firefly Watching", "Baker's Hill"], ["Cave Tour", "Island Hopping", "Firefly Watching"], "November to May", 2800, 4.8),
    place("caramoan", "Caramoan", "Beach", "Luzon", 13.8, 123.85, "Rock formations and white beaches in Camarines Sur.",
        ["Matukad Island", "Lahos Island", "Gota Beach", "Caramoan Limestone Cliffs"], ["Island Hopping", "Snorkeling", "Photography"], "March to June", 2800, 4.6),
    place("mayon", "Legazpi & Mayon", "Mountain", "Luzon", 13.26, 123.69, "Home of the near-perfect cone of Mayon Volcano.",
        ["Mayon Volcano View", "Cagsawa Ruins", "Lignon Hill", "Sumlang Lake"], ["Photography", "ATV Ride", "Food Trip"], "February to May", 2000, 4.7),
    place("donsol", "Donsol", "Nature", "Luzon", 12.9, 123.6, "One of the best places to swim with gentle whale sharks.",
        ["Whale Shark Interaction", "Firefly Watching", "Manta Bowl", "Donsol River"], ["Whale Shark Watching", "Snorkeling", "River Cruise"], "November to June", 2500, 4.6),
    place("catanduanes", "Catanduanes", "Beach", "Luzon", 13.7, 124.2, "The Happy Island, with surf breaks and quiet coasts.",
        ["Puraran Beach", "Binurong Point", "Maribina Falls", "Bote Lighthouse"], ["Surfing", "Hiking", "Beach Hopping"], "April to October", 2200, 4.5),
    place("romblon", "Romblon", "Beach", "Luzon", 12.55, 122.27, "The marble capital with hidden beaches and quiet island towns.",
        ["Bonbon Beach", "Cobrador Island", "Fort San Andres", "Romblon Marble Shops"], ["Island Hopping", "Beach Camping", "Marble Craft Visit"], "November to May", 2300, 4.5),

    // ---------------- VISAYAS ----------------
    place("bohol", "Bohol", "Nature", "Visayas", 9.85, 124.14, "Famous for the Chocolate Hills, tarsiers, and beautiful beaches.",
        ["Chocolate Hills", "Tarsier Sanctuary", "Panglao Beach", "Loboc River Cruise"], ["Countryside Tour", "Diving", "River Cruise"], "December to May", 2800, 4.8),
    place("siquijor", "Siquijor", "Nature", "Visayas", 9.2, 123.5, "The mystical island with waterfalls, old churches, and white beaches.",
        ["Cambugahay Falls", "Salagdoong Beach", "Lazi Convent", "Century-Old Balete Tree"], ["Waterfall Swimming", "Island Ride", "Beach Visit"], "November to May", 2000, 4.6),
    place("dumaguete", "Dumaguete & Apo Island", "City", "Visayas", 9.31, 123.3, "A university town known for the Rizal Boulevard and sea turtles of Apo Island.",
        ["Apo Island", "Rizal Boulevard", "Casaroro Falls", "Twin Lakes of Balinsasayao"], ["Snorkeling", "Diving", "Food Trip"], "November to May", 2200, 4.7),
    place("bacolod", "Bacolod", "City", "Visayas", 10.67, 122.95, "The City of Smiles, known for the MassKara Festival and sweet treats.",
        ["The Ruins", "San Sebastian Cathedral", "Campuestohan Highland", "Mambukal Resort"], ["Food Trip", "Heritage Tour", "Festival"], "October to April", 1800, 4.5),
    place("iloilo", "Iloilo City", "City", "Visayas", 10.7, 122.56, "A heritage city with old churches, a river esplanade, and famous batchoy.",
        ["Miagao Church", "Esplanade", "Jaro Cathedral", "Molo Church"], ["Heritage Tour", "Food Trip", "Church Visit"], "November to April", 1800, 4.6),
    place("tacloban", "Tacloban & Leyte", "City", "Visayas", 11.24, 125.0, "A resilient city with historical landmarks and the San Juanico Bridge.",
        ["San Juanico Bridge", "Sto. Nino Shrine", "MacArthur Landing Memorial", "Kalanggaman Island"], ["History Tour", "Island Visit", "Food Trip"], "March to May", 2000, 4.4),
    place("biliran", "Biliran", "Nature", "Visayas", 11.55, 124.45, "Waterfalls, hot springs, and quiet beaches.",
        ["Ulan-Ulan Falls", "Sambawan Island", "Tinago Falls", "Bagongbong Falls"], ["Waterfall Hopping", "Island Hopping", "Hot Springs"], "March to June", 1800, 4.5),
    place("samar", "Samar", "Nature", "Visayas", 11.55, 125.4, "Caves, rivers, and the Sohoton Natural Bridge National Park.",
        ["Sohoton Natural Bridge", "Langun-Gobingob Caves", "Calbayog Waterfalls", "Biri Rock Formations"], ["Caving", "River Tour", "Trekking"], "March to June", 2000, 4.5),

    // ---------------- MINDANAO ----------------
    place("camiguin", "Camiguin", "Nature", "Mindanao", 9.17, 124.72, "The Island Born of Fire, with volcanoes, springs, and a sandbar.",
        ["White Island Sandbar", "Sunken Cemetery", "Katibawasan Falls", "Mantigue Island"], ["Island Hopping", "Hot Spring Soaking", "Waterfall Visit"], "March to June", 2200, 4.7),
    place("cagayan-de-oro", "Cagayan de Oro", "City", "Mindanao", 8.48, 124.65, "The white-water rafting capital of the Philippines.",
        ["Macahambus Adventure Park", "Gaston Park", "Divisoria Night Market", "Cagayan River Rapids"], ["White Water Rafting", "Zipline", "Food Trip"], "May to October", 2200, 4.5),
    place("davao", "Davao City", "City", "Mindanao", 7.07, 125.6, "Home of Mt. Apo, the Philippine Eagle, and the durian.",
        ["Philippine Eagle Center", "Eden Nature Park", "Samal Island", "Mt. Apo"], ["Nature Tour", "Fruit Tasting", "Island Visit"], "March to October", 2200, 4.6),
    place("zamboanga", "Zamboanga City", "City", "Mindanao", 6.91, 122.07, "The Asia's Latin City, with Spanish heritage and a pink-sand island.",
        ["Fort Pilar", "Great Santa Cruz Island", "Paseo del Mar", "Merloquet Falls"], ["Island Visit", "Heritage Tour", "Seafood Trip"], "November to May", 2000, 4.5),
    place("surigao-del-sur", "Surigao del Sur", "Nature", "Mindanao", 8.75, 126.15, "Home of Tinuy-an Falls, the Niagara of the Philippines, and the Enchanted River.",
        ["Tinuy-an Falls", "Enchanted River", "Hagonoy Island", "Bislig Bay"], ["Waterfall Visit", "Swimming", "Island Visit"], "March to June", 2000, 4.8),
    place("sarangani", "Sarangani", "Beach", "Mindanao", 5.95, 125.3, "Whale shark sightings, beaches, and the Tuna Capital of the Philippines.",
        ["Maasim Beach", "Gumasa Beach", "Lake Holon", "General Santos Fish Port"], ["Beach Visit", "Diving", "Seafood Trip"], "March to September", 2200, 4.4),
    place("lake-sebu", "Lake Sebu", "Mountain", "Mindanao", 6.2, 124.7, "Seven falls and a highland lake, home to the T'boli culture.",
        ["Seven Falls", "Lake Sebu", "T'boli Museum", "Zipline Over Hikong Alo"], ["Zipline", "Cultural Visit", "Boat Ride"], "November to April", 1800, 4.6),
    place("iligan", "Iligan City", "Nature", "Mindanao", 8.23, 124.24, "The City of Majestic Waterfalls.",
        ["Maria Cristina Falls", "Tinago Falls", "Dodiongan Falls", "Mimbalot Falls"], ["Waterfall Hopping", "Swimming", "Sightseeing"], "March to June", 1800, 4.6),
    place("bukidnon", "Bukidnon", "Mountain", "Mindanao", 8.15, 125.1, "Highland plains, pineapple farms, and adventure parks.",
        ["Dahilayan Adventure Park", "Mt. Kitanglad", "Del Monte Pineapple Plantation", "Lake Apo"], ["Zipline", "Hiking", "Farm Visit"], "November to April", 2000, 4.5)
);
