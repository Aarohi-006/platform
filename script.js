let tips = [
  { tip: "Free pizza on 2 – UC", school: "uc", floor: "2", time: "3:15 PM" },
  { tip: "Quiet seats open – Lang 7", school: "lang", floor: "7", time: "2:10 PM" },
  { tip: "Printshop line 15 min – Parsons", school: "parsons", floor: "B", time: "1:45 PM" }
];

let currentFilter = "all";

const arenaChannels = {
  uc: "https://api.allorigins.win/raw?url=https://api.are.na/v3/channels/uc-npghtqxz8wi/contents",
  parsons: "https://api.allorigins.win/raw?url=https://api.are.na/v3/channels/parsons-vs1m3z46yw8/contents",
  lang: "https://api.allorigins.win/raw?url=https://api.are.na/v3/channels/lang-eps6ergks48/contents",
  nssr: "https://api.allorigins.win/raw?url=https://api.are.na/v3/channels/nssr-uvl_ripsnjg/contents",
  copa: "https://api.allorigins.win/raw?url=https://api.are.na/v3/channels/copa-1_xx1whfvcc/contents"
};

const floors = {
  uc: ["6 Quiet Study", "5 Study Lounge", "4 Classrooms", "3 Lounge", "2 Cafeteria", "1 Lobby"],
  parsons: ["12 Studios", "11 Studio", "10 Crit", "9 Studios", "8 Classrooms", "7 Classrooms", "6 Studios", "5 Studios", "4 Classrooms", "3 Classrooms", "2 Making Center", "1 Gallery", "B Printshop"],
  lang: ["9 Classrooms", "8 Classrooms", "7 Quiet Study", "6 Classrooms", "5 Wollman Hall", "4 Group Study", "3 Classrooms", "1 Auditorium / Cafe / Lobby"],
  nssr: ["11 Wolff Conference Room", "10 Seminar Rooms", "9 Graduate Study", "8 Classrooms", "7 Lecture Rooms", "6 Classrooms", "5 Lecture Rooms", "4 Seminar Rooms", "3 Reading Rooms", "2 Lecture Rooms", "1 Lobby"],
  copa: ["3 Black Box Theatre", "2 MFA Studio", "1 MFA Studio"]
};

function getPosition(school) {
  const positions = {
    copa: { top: 90, left: 35 },
    lang: { top: 90, left: 290 },
    uc: { top: 280, left: 170 },
    nssr: { top: 455, left: 35 },
    parsons: { top: 455, left: 270 }
  };
  return positions[school];
}

function renderTips() {
  const container = document.getElementById("tips-container");
  const feed = document.getElementById("feed-list");

  container.innerHTML = "";
  feed.innerHTML = "";

  const stackCount = { uc: 0, lang: 0, parsons: 0, nssr: 0, copa: 0 };

  tips.forEach(function(item) {
    if (currentFilter !== "all" && item.school !== currentFilter) return;

    const pos = getPosition(item.school);

    const tipEl = document.createElement("div");
    tipEl.className = "tip";
    tipEl.textContent = item.tip;
    tipEl.style.top = pos.top + stackCount[item.school] * 38 + "px";
    tipEl.style.left = pos.left + "px";
    stackCount[item.school]++;
    container.appendChild(tipEl);

    const feedEl = document.createElement("p");
    feedEl.textContent = item.tip + " — Floor " + item.floor + " (" + item.time + ")";
    feed.appendChild(feedEl);
  });
}

function filterTips(school) {
  currentFilter = school;

  const bubble = document.querySelector(".bubble");
  const messages = {
    all: "Tap a building to explore live campus notes.",
    uc: "Live updates around UC.",
    parsons: "Studios, labs, and print access.",
    lang: "Quiet study and lecture notes.",
    nssr: "Seminars and reading spaces.",
    copa: "Performance and rehearsal updates."
  };

  bubble.textContent = messages[school];
  renderTips();
}

function openBuilding(building) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });

  document.getElementById("buildingScreen").classList.add("active");

  const title = document.getElementById("buildingTitle");
  title.className = "building-title title-" + building;
  title.textContent = building.toUpperCase();

  const floorList = document.getElementById("floorList");
  floorList.innerHTML = "";

  const activeFloors = tips
    .filter(function(item) {
      return item.school === building;
    })
    .map(function(item) {
      return item.floor;
    });

  floors[building].forEach(function(floor) {
    const floorCard = document.createElement("div");
    floorCard.className = "floor " + building;

    const floorNumber = floor.split(" ")[0];
    if (activeFloors.includes(floorNumber)) {
      floorCard.classList.add("active-tip");
    }

    floorCard.textContent = floor;
    floorList.appendChild(floorCard);
  });

 async function loadArena(building) {
  const container = document.getElementById("arena-content");
  container.innerHTML = "Loading references...";

  try {
    const response = await fetch(arenaChannels[building]);
    const data = await response.json();

    // Are.na can return blocks in different keys depending on endpoint
    const items = data.contents || data.items || data.data || [];

    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = "<div class='arena-card'>No references available.</div>";
      return;
    }

    items.slice(0, 5).forEach(function(block) {
      const card = document.createElement("div");
      card.className = "arena-card";

      // image
      const imageUrl =
        block.image?.display?.url ||
        block.image?.original?.url ||
        block.attachment?.url;

      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        card.appendChild(img);
      }

      // embed
      if (block.embed?.url) {
        const frame = document.createElement("iframe");
        frame.src = block.embed.url;
        frame.width = "100%";
        frame.height = "200";
        frame.style.border = "none";
        frame.style.borderRadius = "10px";
        frame.style.marginBottom = "8px";
        card.appendChild(frame);
      }

      // title
      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.style.marginBottom = "6px";
      title.textContent =
        block.title ||
        block.generated_title ||
        block.source?.title ||
        "Untitled";
      card.appendChild(title);

      // text
      if (block.content) {
        const text = document.createElement("p");
        text.textContent = block.content;
        card.appendChild(text);
      }

      // links
      const linkUrl =
        block.source?.url ||
        block.url ||
        block.embed?.url;

      if (linkUrl) {
        const link = document.createElement("a");
        link.href = linkUrl;
        link.target = "_blank";
        link.textContent = "Open Link";
        link.style.display = "block";
        link.style.marginTop = "8px";
        link.style.fontWeight = "bold";
        card.appendChild(link);
      }

      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = "<div class='arena-card'>No references available.</div>";
    console.error(error);
  }
}

function showHome() {
  document.querySelectorAll(".screen").forEach(function(screen) {
    screen.classList.remove("active");
  });

  document.getElementById("homeScreen").classList.add("active");
  document.querySelector(".bubble").textContent = "Tap a building to explore live campus notes.";
  renderTips();
}

function showFeed() {
  document.querySelectorAll(".screen").forEach(function(screen) {
    screen.classList.remove("active");
  });

  document.getElementById("feedScreen").classList.add("active");
  renderTips();
}

function openModal() {
  document.getElementById("modal").classList.add("active");
  updateFloorOptions();
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

function addTip() {
  const text = document.getElementById("tipText").value.trim();
  const school = document.getElementById("tipSchool").value;
  const floor = document.getElementById("tipFloor").value;

  if (!text) return;

  tips.unshift({
    tip: text,
    school: school,
    floor: floor,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  document.getElementById("tipText").value = "";
  closeModal();
  showHome();
}

renderTips();
