// script.js
console.log("script loaded");

let tips = [
  { tip: "Free pizza on 2 – UC", school: "uc", time: "3:15 PM" },
  { tip: "Quiet seats open – Lang 7", school: "lang", time: "2:10 PM" },
  { tip: "Printshop line 15 min – Parsons", school: "parsons", time: "1:45 PM" }
];

let currentFilter = "all";

const arenaChannels = {
  uc: "https://api.are.na/v3/channels/uc-npghtqxz8wi/contents",
  parsons: "https://api.are.na/v3/channels/parsons-vs1m3z46yw8/contents",
  lang: "https://api.are.na/v3/channels/lang-eps6ergks48/contents",
  nssr: "https://api.are.na/v3/channels/nssr-uvl_ripsnjg/contents",
  copa: "https://api.are.na/v3/channels/copa-1_xx1whfvcc/contents"
};

const floors = {
  uc: ["6 Quiet Study", "5 Study Lounge", "4 Classrooms", "3 Lounge", "2 Cafeteria", "1 Lobby"],
  parsons: ["12 Studios", "11 Studio", "10 Crit", "9 Studios", "8 Classrooms", "7 Classrooms", "6 Studios", "5 Studios", "4 Classrooms", "3 Classrooms", "2 Making Center", "1 Gallery", "B Printshop"],
  lang: ["9 Classrooms", "8 Classrooms", "7 Quiet Study", "6 Classrooms", "5 Wollman Hall", "4 Group Study", "3 Classrooms", "1 Auditorium / Cafe / Lobby"],
  nssr: ["11 Wolff Conference Room", "10 Seminar Rooms", "9 Graduate Study", "8 Classrooms", "7 Lecture Rooms", "6 Classrooms", "5 Lecture Rooms", "4 Seminar Rooms", "3 Reading Rooms", "2 Lecture Rooms", "1 Lobby"],
  copa: ["151 Bank Street — 3 Black Box Theatre", "151 Bank Street — 2 MFA Studio", "151 Bank Street — 1 MFA Studio", "55 W 13th — 9 Drama Studios", "Mannes / Jazz / Drama"]
};

function getPosition(school) {
  return {
    copa: { top: 120, left: 45 },
    lang: { top: 120, left: 270 },
    uc: { top: 360, left: 165 },
    nssr: { top: 585, left: 45 },
    parsons: { top: 585, left: 255 }
  }[school];
}

function renderTips() {
  const container = document.getElementById("tips-container");
  const feed = document.getElementById("feed-list");
  container.innerHTML = "";
  feed.innerHTML = "";

  tips.forEach(t => {
    if (currentFilter !== "all" && t.school !== currentFilter) return;

    const pos = getPosition(t.school);
    if (pos) {
      const div = document.createElement("div");
      div.className = "tip";
      div.innerText = t.tip;
      div.style.top = pos.top + "px";
      div.style.left = pos.left + "px";
      container.appendChild(div);
    }

    const p = document.createElement("p");
    p.innerText = `${t.tip} (${t.time})`;
    feed.appendChild(p);
  });
}

function filterTips(school) {
  currentFilter = school;
  renderTips();
}

function openBuilding(building) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("buildingScreen").classList.add("active");

  const title = document.getElementById("buildingTitle");
  title.className = "building-title title-" + building;
  title.innerText = building.toUpperCase();

  const floorList = document.getElementById("floorList");
  floorList.innerHTML = "";

  floors[building].forEach(f => {
    const div = document.createElement("div");
    div.className = "floor " + building;
    div.innerText = f;
    floorList.appendChild(div);
  });

  loadArena(building);
}

async function loadArena(building) {
  const container = document.getElementById("arena-content");
  container.innerHTML = "Loading references...";

  try {
    const response = await fetch(arenaChannels[building]);
    const result = await response.json();
    const items = result.contents || result.items || result.data || [];

    container.innerHTML = "";

    items.slice(0, 3).forEach(block => {
      const card = document.createElement("div");
      card.className = "arena-card";

      const imageUrl =
        block.image?.display?.url ||
        block.image?.original?.url ||
        block.attachment?.url;

      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        card.appendChild(img);
      }

      if (block.embed?.url) {
        const iframe = document.createElement("iframe");
        iframe.src = block.embed.url;
        iframe.height = "200";
        card.appendChild(iframe);
      }

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.style.marginBottom = "6px";
      title.innerText = block.title || block.generated_title || block.source?.title || "Untitled";
      card.appendChild(title);

      if (block.content) {
        const text = document.createElement("p");
        text.innerText = block.content;
        card.appendChild(text);
      }

      if (block.source?.url) {
        const link = document.createElement("a");
        link.href = block.source.url;
        link.target = "_blank";
        link.innerText = "Open Link";
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
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("homeScreen").classList.add("active");
}

function showFeed() {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("feedScreen").classList.add("active");
  renderTips();
}

function openModal() {
  document.getElementById("modal").classList.add("active");
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

function addTip() {
  const text = document.getElementById("tipText").value.trim();
  const school = document.getElementById("tipSchool").value;
  if (!text) return;

  tips.push({
    tip: text,
    school,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  document.getElementById("tipText").value = "";
  closeModal();
  renderTips();
}

renderTips();
