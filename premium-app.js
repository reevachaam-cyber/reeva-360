
/* =========================================================
   REEVA RESIDENCE | PREMIUM VIRTUAL TOUR 360°
   ไฟล์: premium-app.js

   หน้าที่ของไฟล์:
   ควบคุมการทำงานของแผนผัง จุดบ้าน แผงข้อมูล
   และ Gallery ของหน้า Premium

   สารบัญ:
   01. ข้อมูลบ้าน
   02. เชื่อมต่อองค์ประกอบ HTML
   03. ตัวแปรควบคุมแผนผัง
   04. คำนวณขนาดแผนผัง
   05. อัปเดตตำแหน่งภาพและจุดบ้าน
   06. ซูมและรีเซ็ตแผนผัง
   07. เปิดและปิดแผงข้อมูลบ้าน
   08. สร้างจุดบ้านบนแผนผัง
   09. ปุ่มควบคุมการซูม
   10. ลากแผนผังด้วยเมาส์และนิ้ว
   11. ควบคุม Gallery
   12. แอนิเมชัน Gallery
   13. เริ่มต้นระบบ

   หมายเหตุ:
   - ดึงบ้านที่เผยแพร่จาก Supabase (ผ่าน REST API)
   - รักษาระบบแผนผัง Gallery และทัวร์เดิม
========================================================= */

"use strict";


/* =========================================================
   01. ข้อมูลบ้าน

   id       = รหัสบ้าน
   x        = ตำแหน่งแนวนอนบนภาพ (เปอร์เซ็นต์)
   y        = ตำแหน่งแนวตั้งบนภาพ (เปอร์เซ็นต์)
   preview  = ที่อยู่ภาพตัวอย่างบ้าน
   tourUrl  = ที่อยู่ทัวร์ 360°

   null หมายถึงยังไม่ได้เพิ่มข้อมูลส่วนนั้น

   หมายเหตุ:
   A28 / A29 เป็นข้อมูลตัวอย่างสำรองระหว่างยังไม่มีบ้านเผยแพร่
   เมื่อ Supabase มีบ้าน is_visible=true จะใช้ข้อมูลจริงแทน
========================================================= */

let houses = [
  {
    id: "A28",
    x: 53.30,
    y: 52,
    preview: null,
    tourUrl: "tour-viewer.html?house=A28"
  },

  {
    id: "A29",
    x: 53.46,
    y: 56.30,
    preview: null,
    tourUrl: null
  }
];


/* =========================================================
   01.1 ตั้งค่าการอ่านบ้านจาก Supabase

   ใช้ REST API โดยตรง จึงไม่ต้องเพิ่ม <script> ใน HTML
   ใช้ publishable key สำหรับข้อมูลสาธารณะที่ RLS อนุญาต
   ห้ามนำ secret / service_role key มาใส่ในไฟล์นี้
========================================================= */

const REEVA_PUBLIC_DB_URL = "https://mneqrawpnlklgwsojfhx.supabase.co";
const REEVA_PUBLIC_DB_KEY = "sb_publishable__9aKRmsOCfzeYYIF4wyt5Q_RFOScvIH";

/* ป้องกันลิงก์ที่ไม่ปลอดภัยจากข้อมูลภายนอก */
function safePublicUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const url = value.trim();
  if (/^(?:https:\/\/)/i.test(url)) return url;
  if (/^(?:\.\/)?[a-zA-Z0-9_-][a-zA-Z0-9_./?=&%#-]*$/.test(url) &&
      !url.includes("..")) return url;
  return null;
}

/* แปลงข้อมูลจากตาราง houses ให้ตรงกับหน้า Premium */
function formatPublishedHouse(row) {
  if (!row || typeof row.house_code !== "string") return null;

  const id = row.house_code.trim().toUpperCase();
  const x = Number(row.x);
  const y = Number(row.y);

  if (!id || !Number.isFinite(x) || !Number.isFinite(y) ||
      x < 0 || x > 100 || y < 0 || y > 100) return null;

  let tourUrl = safePublicUrl(row.tour_url);
  /* บ้าน A28 ที่ใช้ Marzipano ภายในโครงการเปิดผ่าน viewer เดิม */
  if (id === "A28" && tourUrl === "tours/A28/app-files/index.html") {
    tourUrl = "tour-viewer.html?house=A28";
  }

  return {
    id,
    x,
    y,
    preview: safePublicUrl(row.preview_url),
    tourUrl
  };
}

async function loadPublishedHouses() {
  const endpoint = REEVA_PUBLIC_DB_URL +
    "/rest/v1/houses?select=house_code,x,y,preview_url,tour_url" +
    "&is_visible=eq.true&order=house_code.asc";

  try {
    const response = await fetch(endpoint, {
      headers: { apikey: REEVA_PUBLIC_DB_KEY },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Supabase ตอบกลับสถานะ " + response.status);
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("รูปแบบข้อมูลบ้านไม่ถูกต้อง");

    const loaded = rows.map(formatPublishedHouse).filter(Boolean);
    const uniqueHouses = new Map();
    loaded.forEach(house => uniqueHouses.set(house.id, house));

    if (uniqueHouses.size === 0) {
      /* รักษา A28/A29 ตัวอย่างไว้จนกว่าจะมีบ้านเผยแพร่จริง */
      console.info("REEVA: ยังไม่มีบ้านเผยแพร่ ใช้จุดบ้านตัวอย่าง A28/A29");
      return;
    }

    houses = [...uniqueHouses.values()];
    closePanel();
    markerElements.forEach(marker => marker.remove());
    markerElements.clear();
    buildMarkers();
    updateMap();
  } catch (error) {
    /* ข้อมูลตัวอย่างยังใช้ได้เมื่ออินเทอร์เน็ตหรือฐานข้อมูลขัดข้อง */
    console.warn("REEVA: โหลดบ้านจาก Supabase ไม่สำเร็จ ใช้ข้อมูลตัวอย่าง", error);
  }
}


/* =========================================================
   02. เชื่อมต่อองค์ประกอบ HTML

   document.getElementById()
   ใช้เรียกองค์ประกอบที่อยู่ใน premium-preview.html
========================================================= */

/* พื้นที่แผนผัง */
const stage = document.getElementById("map-stage");
const content = document.getElementById("map-content");
const mapImage = document.getElementById("project-map");

/* แผงข้อมูลบ้าน */
const panel = document.getElementById("house-panel");
const codeLabel = document.getElementById("house-code");
const tourButton = document.getElementById("tour-button");
const panelNote = document.getElementById("panel-note");

/* รูปตัวอย่างบ้าน */
const housePhoto = document.getElementById("house-photo");
const photoPlaceholder = document.getElementById("photo-placeholder");
const photoHouseName = document.getElementById("photo-house-name");

/* เก็บปุ่มจุดบ้านแต่ละหลัง */
const markerElements = new Map();


/* =========================================================
   03. ตัวแปรควบคุมแผนผัง

   zoom = ระดับซูม
   panX = ระยะเลื่อนแผนผังแนวนอน
   panY = ระยะเลื่อนแผนผังแนวตั้ง

   imageWidth / imageHeight
   = ขนาดภาพที่แสดงจริงภายในกรอบ
========================================================= */

let zoom = 1;

let panX = 0;
let panY = 0;

let imageWidth = 0;
let imageHeight = 0;

/* ตัวแปรสำหรับลากแผนผัง */
let dragging = false;
let activePointer = null;

let lastX = 0;
let lastY = 0;

/* ระดับซูมต่ำสุดและสูงสุด */
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;


/* =========================================================
   04. คำนวณขนาดแผนผัง

   ทำให้ภาพแผนผังแสดงเต็มพื้นที่เท่าที่ทำได้
   โดยรักษาสัดส่วนภาพเดิม

   เรียกอีกครั้งเมื่อขนาดหน้าจอเปลี่ยน
========================================================= */

function fitMap() {

  /* รอให้ภาพโหลดเสร็จก่อนคำนวณ */
  if (!mapImage.naturalWidth || !mapImage.naturalHeight) {
    return;
  }

  /* คำนวณอัตราย่อภาพให้พอดีกรอบ */
  const factor = Math.min(
    stage.clientWidth / mapImage.naturalWidth,
    stage.clientHeight / mapImage.naturalHeight
  );

  /* ขนาดภาพที่ใช้แสดงจริง */
  imageWidth = mapImage.naturalWidth * factor;
  imageHeight = mapImage.naturalHeight * factor;

  /* ส่งขนาดไปยังชั้นของภาพ */
  content.style.width = imageWidth + "px";
  content.style.height = imageHeight + "px";

  /* อัปเดตภาพและจุดบ้าน */
  updateMap();
}


/* =========================================================
   05. อัปเดตแผนผังและตำแหน่งจุดบ้าน

   เมื่อซูมหรือลาก:
   - ภาพแผนผังเคลื่อนที่
   - จุดบ้านเคลื่อนตามภาพ
   - ขนาดจุดบ้านยังคงเดิม

   ตำแหน่งจุดอิงจากเปอร์เซ็นต์ของภาพ
========================================================= */

function updateMap() {

  /* ย้ายและขยายภาพแผนผัง */
  content.style.transform =
    `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`;

  /* หาตำแหน่งกึ่งกลางกรอบแผนผัง */
  const centerX = stage.clientWidth / 2;
  const centerY = stage.clientHeight / 2;

  /* คำนวณจุดบ้านทีละหลัง */
  houses.forEach(house => {

    const marker = markerElements.get(house.id);

    if (!marker) {
      return;
    }

    /* ยังไม่แสดงจุดก่อนรู้ขนาดภาพ */
    if (!imageWidth || !imageHeight) {
      marker.hidden = true;
      return;
    }

    /* แปลงเปอร์เซ็นต์เป็นพิกัดบนภาพ */
    const imageX =
      (house.x / 100 - 0.5) * imageWidth;

    const imageY =
      (house.y / 100 - 0.5) * imageHeight;

    /* คำนวณตำแหน่งบนหน้าจอหลังซูม */
    const screenX =
      centerX + panX + imageX * zoom;

    const screenY =
      centerY + panY + imageY * zoom;

    /* ย้ายจุดบ้าน */
// เลื่อนจุดบ้านลง 14px เพื่อไม่ให้บังชื่อบ้าน
const markerOffsetY = 0;

marker.style.left = screenX + "px";
marker.style.top = (screenY + markerOffsetY * zoom) + "px";

    marker.hidden = false;

  });
}

/* =========================================================
   06. ระบบซูมและรีเซ็ตแผนผัง

   changeZoom()
   = ขยายหรือย่อภาพ

   resetMap()
   = กลับไปแสดงภาพที่ระดับเริ่มต้น
========================================================= */

function changeZoom(factor) {

  /* จำกัดระดับซูม */
  zoom = Math.max(
    MIN_ZOOM,
    Math.min(MAX_ZOOM, zoom * factor)
  );

  /* กลับสู่ตำแหน่งกลางเมื่อซูมเท่ากับ 1 */
  if (zoom === 1) {
    panX = 0;
    panY = 0;
  }

  updateMap();
}


/* กลับแผนผังไปจุดเริ่มต้น */
function resetMap() {

  zoom = 1;

  panX = 0;
  panY = 0;

  updateMap();
}


/* =========================================================
   07. แผงข้อมูลบ้าน

   closePanel()
   = ปิดแผงและยกเลิกสถานะจุดที่เลือก

   selectHouse()
   = แสดงข้อมูลของบ้านที่ผู้ใช้คลิก

   ถ้ายังไม่มีทัวร์ 360°
   ปุ่มเข้าชมจะถูกปิดการใช้งาน
========================================================= */

/* ปิดแผงข้อมูลบ้าน */
function closePanel() {

  panel.hidden = true;

  markerElements.forEach(marker => {
    marker.classList.remove("selected");
  });
}


/* เปิดแผงข้อมูลของบ้านที่เลือก */
function selectHouse(house) {

  /* ปิดสถานะบ้านที่เคยเลือก */
  closePanel();

  /* เปลี่ยนรหัสบ้านบนแผง */
  codeLabel.textContent = house.id;

  photoHouseName.textContent =
    "บ้าน " + house.id;

  /* แสดงสถานะจุดบ้านที่กำลังเลือก */
  const marker = markerElements.get(house.id);

  if (marker) {
    marker.classList.add("selected");
  }

  /* ตั้งค่ากรอบภาพเป็นสถานะรอรูป */
  housePhoto.hidden = true;
  photoPlaceholder.hidden = false;

  housePhoto.removeAttribute("src");

  /* ถ้ามีรูปตัวอย่างบ้าน */
  if (house.preview) {

    housePhoto.onload = () => {
      housePhoto.hidden = false;
      photoPlaceholder.hidden = true;
    };

    housePhoto.onerror = () => {
      housePhoto.hidden = true;
      photoPlaceholder.hidden = false;
    };

    housePhoto.src = house.preview;

    housePhoto.alt =
      "ภาพตัวอย่างบ้าน " + house.id;
  }

  /* ตั้งค่าปุ่มชมบ้าน 360° */
  tourButton.disabled = !house.tourUrl;

  tourButton.textContent = house.tourUrl
    ? "ชมบ้าน 360°"
    : "ชมบ้าน 360° (รอเชื่อมระบบ)";

  panelNote.textContent = house.tourUrl
    ? ""
    : "ทัวร์ของบ้านหลังนี้ยังไม่ได้เชื่อมกับเว็บไซต์";

  /* เปิดทัวร์เฉพาะบ้านที่มี URL */
  tourButton.onclick = house.tourUrl
    ? () => {
        window.location.href = house.tourUrl;
      }
    : null;

  /* แสดงแผง */
  panel.hidden = false;
}


/* =========================================================
   08. สร้างจุดบ้านบนแผนผัง

   นำข้อมูลจาก houses
   มาสร้างปุ่มจุดบ้านที่คลิกได้

   ขนาดและสีของจุดบ้าน
   แก้ไขจาก premium-style.css
========================================================= */

function buildMarkers() {

  houses.forEach(house => {

    /* สร้างปุ่ม */
    const marker = document.createElement("button");

    marker.type = "button";
    marker.className = "house-marker";

    /* กำหนดชื่อบ้าน */
    marker.dataset.house = house.id;

    marker.setAttribute(
      "aria-label",
      "เลือกบ้าน " + house.id
    );

    /* ซ่อนไว้จนกว่าจะคำนวณพิกัด */
    marker.hidden = true;

    /* ไม่ให้การแตะจุดบ้านเริ่มลากแผนผัง */
    marker.addEventListener("pointerdown", event => {
      event.stopPropagation();
    });

    /* คลิกเพื่อเปิดแผงข้อมูล */
    marker.addEventListener("click", event => {
      event.stopPropagation();
      selectHouse(house);
    });

    /* เพิ่มจุดเข้าไปในแผนผัง */
    stage.appendChild(marker);

    /* บันทึกจุดตามรหัสบ้าน */
    markerElements.set(house.id, marker);

  });
}


/* =========================================================
   09. ปุ่มควบคุมการซูมแผนผัง

   + = ซูมเข้า
   - = ซูมออก
   ↺ = รีเซ็ต

   สามารถใช้ล้อเมาส์ซูมได้ด้วย
========================================================= */

/* ปุ่มซูมเข้า */
document.getElementById("zoom-in")
  .addEventListener("click", () => {
    changeZoom(1.3);
  });


/* ปุ่มซูมออก */
document.getElementById("zoom-out")
  .addEventListener("click", () => {
    changeZoom(1 / 1.3);
  });


/* ปุ่มรีเซ็ต */
document.getElementById("reset-map")
  .addEventListener("click", resetMap);


/* ซูมด้วยล้อเมาส์ */
stage.addEventListener(
  "wheel",
  event => {

    /* ไม่แย่งการเลื่อนภายในแผงข้อมูลบ้าน */
    if (event.target.closest(".house-panel")) {
      return;
    }

    event.preventDefault();

    changeZoom(
      event.deltaY < 0 ? 1.15 : 1 / 1.15
    );

  },
  { passive: false }
);


/* =========================================================
   10. ระบบลากแผนผัง

   รองรับ:
   - การลากด้วยเมาส์
   - การลากด้วยนิ้วผ่าน Pointer Events

   ใช้ panX / panY ควบคุมตำแหน่งภาพ
========================================================= */

/* เริ่มลากแผนผัง */
stage.addEventListener("pointerdown", event => {

  /* ไม่เริ่มลากเมื่อกดปุ่มหรือแผงข้อมูล */
  if (
    event.target.closest("button") ||
    event.target.closest(".house-panel")
  ) {
    return;
  }

  /* เมาส์ให้ใช้คลิกซ้ายเท่านั้น */
  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  dragging = true;

  activePointer = event.pointerId;

  lastX = event.clientX;
  lastY = event.clientY;

  stage.classList.add("dragging");

  /* จับ Pointer เพื่อให้ลากได้ต่อเนื่อง */
  stage.setPointerCapture(event.pointerId);
});


/* ขยับภาพระหว่างลาก */
stage.addEventListener("pointermove", event => {

  if (
    !dragging ||
    event.pointerId !== activePointer
  ) {
    return;
  }

  /* คำนวณระยะที่เมาส์หรือนิ้วขยับ */
  panX += event.clientX - lastX;
  panY += event.clientY - lastY;

  lastX = event.clientX;
  lastY = event.clientY;

  updateMap();
});


/* หยุดลากเมื่อปล่อยเมาส์หรือนิ้ว */
function finishDrag(event) {

  if (event.pointerId !== activePointer) {
    return;
  }

  dragging = false;
  activePointer = null;

  stage.classList.remove("dragging");
}


/* เหตุการณ์ทั้งหมดที่ต้องหยุดลาก */
[
  "pointerup",
  "pointercancel",
  "lostpointercapture"
].forEach(type => {

  stage.addEventListener(type, finishDrag);

});


/* ปุ่ม X สำหรับปิดแผงข้อมูล */
document.getElementById("close-panel")
  .addEventListener("click", closePanel);


/* กด Escape เพื่อปิดแผงข้อมูล */
document.addEventListener("keydown", event => {

  if (
    event.key === "Escape" &&
    !panel.hidden
  ) {
    closePanel();
  }

});


/* =========================================================
   11. ระบบควบคุม Gallery

   มี:
   - ปุ่มเลื่อนซ้าย
   - ปุ่มเลื่อนขวา
   - เส้น Progress แสดงตำแหน่ง
   - การ์ดที่กำลังอยู่กลางพื้นที่เลื่อน

   ไม่มีการเลื่อนภาพอัตโนมัติ
========================================================= */

/* เรียกองค์ประกอบ Gallery */
const galleryTrack =
  document.getElementById("gallery-track");

const galleryPrev =
  document.getElementById("gallery-prev");

const galleryNext =
  document.getElementById("gallery-next");

const galleryProgress =
  document.getElementById("gallery-progress-thumb");

/* รายการการ์ดทั้งหมด */
const galleryCards = Array.from(
  galleryTrack.querySelectorAll(".gallery-card")
);

/* ตรวจการตั้งค่าลดภาพเคลื่อนไหว */
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);


/* อัปเดตสถานะ Gallery */
function updateGallery() {

  /* ระยะเลื่อนได้สูงสุด */
  const maxScroll = Math.max(
    0,
    galleryTrack.scrollWidth - galleryTrack.clientWidth
  );

  /* ระยะเลื่อนปัจจุบัน */
  const current = Math.max(
    0,
    Math.min(maxScroll, galleryTrack.scrollLeft)
  );

  /* เปิดหรือปิดปุ่มลูกศรตามตำแหน่ง */
  galleryPrev.disabled = current <= 2;
  galleryNext.disabled = current >= maxScroll - 2;

  /* สัดส่วนพื้นที่ที่มองเห็น */
  const widthRatio = Math.min(
    1,
    galleryTrack.clientWidth / galleryTrack.scrollWidth
  );

  /* ความคืบหน้าการเลื่อน */
  const progress = maxScroll > 0
    ? current / maxScroll
    : 0;

  /* อัปเดตเส้น Progress */
  galleryProgress.style.width =
    (widthRatio * 100) + "%";

  galleryProgress.style.left =
    (progress * (100 - widthRatio * 100)) + "%";

  /* หาจุดกึ่งกลางพื้นที่ Gallery */
  const center =
    galleryTrack.getBoundingClientRect().left +
    galleryTrack.clientWidth / 2;

  let closest = null;
  let best = Infinity;

  /* หาการ์ดที่อยู่ใกล้กึ่งกลางที่สุด */
  galleryCards.forEach(card => {

    const rect = card.getBoundingClientRect();

    const cardCenter =
      (rect.left + rect.right) / 2;

    const delta = Math.abs(cardCenter - center);

    if (delta < best) {
      best = delta;
      closest = card;
    }

  });

  /* ใส่สถานะการ์ดปัจจุบัน */
  galleryCards.forEach(card => {

    card.classList.toggle(
      "is-current",
      card === closest
    );

  });
}


/* เลื่อน Gallery ทีละการ์ด */
function scrollGallery(direction) {

  const firstCard = galleryCards[0];

  if (!firstCard) {
    return;
  }

  /* ความกว้างของการ์ด */
  const cardWidth =
    firstCard.getBoundingClientRect().width;

  /* ช่องว่างระหว่างการ์ด */
  const gap = parseFloat(
    getComputedStyle(galleryTrack).gap
  ) || 0;

  /* เลื่อนอย่างนุ่มนวล */
  galleryTrack.scrollBy({
    left: direction * (cardWidth + gap),
    behavior: reducedMotion.matches
      ? "auto"
      : "smooth"
  });
}


/* ปุ่มย้อนกลับ */
galleryPrev.addEventListener("click", () => {
  scrollGallery(-1);
});


/* ปุ่มไปข้างหน้า */
galleryNext.addEventListener("click", () => {
  scrollGallery(1);
});


/* อัปเดตเมื่อ Gallery ถูกเลื่อน */
galleryTrack.addEventListener(
  "scroll",
  updateGallery,
  { passive: true }
);


/* อัปเดตเมื่อหน้าจอเปลี่ยนขนาด */
window.addEventListener("resize", () => {

  fitMap();
  updateGallery();

});


/* =========================================================
   12. แอนิเมชัน Gallery

   เมื่อเลื่อนหน้าจอมาถึง Gallery:
   - ภาพค่อย ๆ ปรากฏ
   - การ์ดเคลื่อนขึ้นเล็กน้อย

   ใช้ IntersectionObserver
   เพื่อเล่นแอนิเมชันเมื่อการ์ดเข้าสู่หน้าจอ

   แอนิเมชันเล่นครั้งเดียวต่อการ์ด
========================================================= */

/* ใช้แอนิเมชันเมื่อเบราว์เซอร์รองรับ */
if (
  "IntersectionObserver" in window &&
  !reducedMotion.matches
) {

  const observer = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          /* แสดงการ์ด */
          entry.target.classList.add("is-revealed");

          /* ไม่ต้องเล่นซ้ำ */
          observer.unobserve(entry.target);

        }

      });

    },
    {
      root: null,
      threshold: .12
    }
  );

  /* เริ่มตรวจการ์ดทุกใบ */
  galleryCards.forEach(card => {
    observer.observe(card);
  });

  galleryTrack.classList.add("motion-ready");

}


/* =========================================================
   13. เริ่มต้นระบบ

   ทำงานเมื่อ premium-preview.html
   โหลด JavaScript ไฟล์นี้

   ขั้นตอน:
   1. แสดงจุดบ้านตัวอย่างระหว่างรอฐานข้อมูล
   2. โหลดบ้านที่เปิดแสดงจาก Supabase
   3. คำนวณแผนผังและอัปเดต Gallery
========================================================= */

/* สร้างจุดบ้านสำรอง แล้วโหลดบ้านจริงแบบไม่หยุดหน้าเว็บ */
buildMarkers();
loadPublishedHouses();

/* หากภาพโหลดเสร็จแล้ว ให้คำนวณทันที */
if (mapImage.complete) {
  fitMap();
}

/* หากภาพยังโหลดไม่เสร็จ ให้รอ */
mapImage.addEventListener("load", fitMap);

/* ตั้งค่า Gallery ครั้งแรก */
updateGallery();

/* ==========================================
   REEVA Premium - โหลดภาพจาก Supabase
   พื้นหลังเว็บไซต์ + Gallery 1-4
========================================== */

async function loadPremiumSiteImages() {
  const supabaseUrl = "https://mneqrawpnlklgwsojfhx.supabase.co";
  const supabaseKey = "sb_publishable__9aKRmsOCfzeYYIF4wyt5Q_RFOScvIH";

  try {
    const response = await fetch(
      supabaseUrl + "/rest/v1/site_images?select=slot,image_url,caption",
      {
        method: "GET",
        cache: "no-store",
        headers: {
          apikey: supabaseKey
        }
      }
    );

    if (!response.ok) {
      throw new Error("โหลดภาพไม่สำเร็จ: " + response.status);
    }

    const images = await response.json();

    images.forEach(function (item) {

      // เปลี่ยนพื้นหลังเว็บไซต์
      if (item.slot === "background" && item.image_url) {
        document.body.style.backgroundImage =
          'url("' + item.image_url + '")';
      }

      // เปลี่ยนภาพ Gallery ตามหมายเลขช่อง
      const match = /^gallery_([1-4])$/.exec(item.slot);

      if (match && item.image_url) {
        const index = Number(match[1]) - 1;
        const card = galleryCards[index];

        if (!card) return;

        const visual = card.querySelector(".gallery-visual");
        const caption = card.querySelector(".gallery-caption");

        if (visual) {
          const img = document.createElement("img");
          img.src = item.image_url;
          img.alt = item.caption || "ภาพบรรยากาศ REEVA";

          visual.replaceChildren(img);
        }

        if (caption) {
          caption.textContent =
            item.caption || "บรรยากาศ REEVA Residence";
        }
      }
    });

    updateGallery();

    console.log("โหลดภาพ REEVA Premium จาก Supabase สำเร็จ");

  } catch (error) {
    console.error("REEVA Site Images:", error);
  }
}

// เริ่มโหลดภาพจาก Supabase
loadPremiumSiteImages();

/* =================== END OF JAVASCRIPT =================== */
