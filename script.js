let tips = [
  { tip: "Free pizza on 2 – UC", school: "uc", floor: "2", time: "3:15 PM" },
  { tip: "Quiet seats open – Lang 7", school: "lang", floor: "7", time: "2:10 PM" },
  { tip: "Printshop line 15 min – Parsons", school: "parsons", floor: "B", time: "1:45 PM" }
];

let currentFilter = "all";

const arenaChannels = {
  uc: "https://api.are.na/v3/channels/uc-npghtqxz8wi/contents",
  parsons: "https://api.are.na/v3/channels/parsons-vs1m3z46yw8/contents",
  lang: "https://api.are.na/v3/channels/lang-eps6ergks48/contents",
  nssr: "https://api.are.na/v3/channels/nssr-uvl_ripsnjg/contents",
  copa: "https://api.are.na/v3/channels/copa-1_xx1whfvcc/contents"
};

pa: "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://api.are.na/v3/channels/copa-1_xx1whfvcc/contents")
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
  if (!container || !feed) return;

  container.innerHTML = "";
  feed.innerHTML = "";

  const stackCount = { uc: 0, lang: 0, parsons: 0, nssr: 0, copa: 0 };

  for (let i = 0; i < tips.length; i++) {
    const item = tips[i];
    if (currentFilter !== "all" && item.school !== currentFilter) continue;

    const pos = getPosition(item.school);
    if (!pos) continue;

    const tipEl = document.createElement("div");
    tipEl.className = "tip";
    tipEl.textContent = item.tip;
    tipEl.style.top = (pos.top + stackCount[item.school] * 38) + "px";
    tipEl.style.left = pos.left + "px";
    stackCount[item.school]++;
    container.appendChild(tipEl);

    const feedEl = document.createElement("p");
    feedEl.textContent = item.tip + " — Floor " + item.floor + " (" + item.time + ")";
    feed.appendChild(feedEl);
  }
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

  if (bubble) bubble.textContent = messages[school] || messages.all;
  renderTips();
}

function openBuilding(building) {
  const screens = document.querySelectorAll(".screen");
  for (let i = 0; i < screens.length; i++) {
    screens[i].classList.remove("active");
  }

  document.getElementById("buildingScreen").classList.add("active");

  const title = document.getElementById("buildingTitle");
  title.className = "building-title title-" + building;
  title.textContent = building.toUpperCase();

  const floorList = document.getElementById("floorList");
  floorList.innerHTML = "";

  const activeFloors = [];
  for (let i = 0; i < tips.length; i++) {
    if (tips[i].school === building) activeFloors.push(tips[i].floor);
  }

  for (let i = 0; i < floors[building].length; i++) {
    const floor = floors[building][i];
    const floorCard = document.createElement("div");
    floorCard.className = "floor " + building;

    const floorNumber = floor.split(" ")[0];
    if (activeFloors.indexOf(floorNumber) !== -1) {
      floorCard.classList.add("active-tip");
    }

    floorCard.textContent = floor;
    floorList.appendChild(floorCard);
  }

  loadArena(building);
}

function updateFloorOptions() {
  const school = document.getElementById("tipSchool").value;
  const floorSelect = document.getElementById("tipFloor");
  floorSelect.innerHTML = "";

  for (let i = 0; i < floors[school].length; i++) {
    const floor = floors[school][i];
    const floorNum = floor.split(" ")[0];

    const option = document.createElement("option");
    option.value = floorNum;
    option.textContent = "Floor " + floorNum;
    floorSelect.appendChild(option);
  }
}

async function loadArena(building) {
  const container = document.getElementById("arena-content");
  container.innerHTML = "<div class='arena-card'>Loading references...</div>";

  try {
    const response = await fetch(arenaChannels[building]);
    const data = await response.json();
    const items = data.contents || data.items || data.data || [];

    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = "<div class='arena-card'>No references available.</div>";
      return;
    }

    for (let i = 0; i < Math.min(items.length, 5); i++) {
      const block = items[i];
      const card = document.createElement("div");
      card.className = "arena-card";

      const imageUrl =
        (block.image && block.image.display && block.image.display.url) ||
        (block.image && block.image.original && block.image.original.url);

      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        card.appendChild(img);
      }

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.style.marginBottom = "6px";
      title.textContent = block.title || block.generated_title || "Untitled";
      card.appendChild(title);

      if (block.content) {
        const text = document.createElement("p");
        text.textContent = block.content;
        card.appendChild(text);
      }

      container.appendChild(card);
    }
  } catch (error) {
    container.innerHTML = "<div class='arena-card'>No references available.</div>";
  }
}

function showHome() {
  const screens = document.querySelectorAll(".screen");
  for (let i = 0; i < screens.length; i++) {
    screens[i].classList.remove("active");
  }

  document.getElementById("homeScreen").classList.add("active");
  document.querySelector(".bubble").textContent = "Tap a building to explore live campus notes.";
  renderTips();
}

function showFeed() {
  const screens = document.querySelectorAll(".screen");
  for (let i = 0; i < screens.length; i++) {
    screens[i].classList.remove("active");
  }

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
