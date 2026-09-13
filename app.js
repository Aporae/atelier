const CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "landscape", label: "风景" },
  { id: "architecture", label: "建筑" },
  { id: "still", label: "静物" },
  { id: "portrait", label: "人像" },
  { id: "night", label: "夜色" },
];
const LABEL = {
  landscape: "风景",
  architecture: "建筑",
  still: "静物",
  portrait: "人像",
  night: "夜色",
};

const SEED = [
  { id: "kyoto", title: "京都晨雾", location: "京都", category: "landscape", src: "gallery/kyoto.jpg", width: 1200, height: 1600, prompt: "A quiet Kyoto temple garden at first light. Raked white gravel in precise waves, moss-covered stones, a single Japanese maple with deep red leaves, and a dark wooden veranda at the edge of the frame. Soft fog hanging low, cinematic natural light, medium-format photography, ultra-sharp, serene." },
  { id: "alpine", title: "阿尔卑斯倒影", location: "阿尔卑斯", category: "landscape", src: "gallery/alpine.jpg", width: 1792, height: 1008, prompt: "A mirror-still alpine lake at blue hour, snow-capped peaks inverted perfectly in the water, a small weathered wooden dock entering from the lower left. Ultra-clean composition, cold teal and slate tones, large-format landscape photography, crisp." },
  { id: "atrium", title: "混凝土光庭", location: "室内", category: "architecture", src: "gallery/atrium.jpg", width: 1200, height: 1600, prompt: "Sunlight cutting through a monumental brutalist concrete atrium, a single shaft of warm afternoon light striking the floor, visible dust motes, long geometric shadows, board-formed concrete texture. Architectural photography, 24mm, quiet and monumental." },
  { id: "ceramic", title: "陶与无花果", location: "工作室", category: "still", src: "gallery/ceramic.jpg", width: 1600, height: 1200, prompt: "A still life on a pale oak table: cream ceramic bowls, two ripe figs split open, a folded linen napkin, and a single white tulip in a small glass. Soft Nordic window light from the left, shallow depth of field, editorial food photography, calm." },
  { id: "dunes", title: "沙丘脊线", location: "撒哈拉", category: "landscape", src: "gallery/dunes.jpg", width: 1792, height: 1008, prompt: "Wind-carved Sahara dunes at golden hour, long S-curved ridgelines catching raking light, deep indigo shadows in the troughs, one tiny solitary figure walking the crest for scale. Aerial oblique, cinematic, vast." },
  { id: "tokyo", title: "东京夜雨", location: "东京", category: "night", src: "gallery/tokyo.jpg", width: 1200, height: 1600, prompt: "A rain-slicked Tokyo backstreet at night, neon signs reflecting in puddles on wet asphalt, a lone figure holding a transparent umbrella walking away, steam rising from a street grate. Cinematic teal and magenta practical lights, 35mm photography, moody." },
  { id: "cabin", title: "极光木屋", location: "挪威", category: "night", src: "gallery/cabin.jpg", width: 1600, height: 1200, prompt: "A small glass cabin in a snow-covered pine forest under the aurora borealis, warm amber interior light glowing through floor-to-ceiling windows, pine silhouettes against green-violet sky. Large-format night photography, quiet." },
  { id: "cliffs", title: "雾中悬崖", location: "大西洋岸", category: "landscape", src: "gallery/cliffs.jpg", width: 1792, height: 1008, prompt: "Steep coastal cliffs disappearing into dense morning fog, teal Atlantic water far below, slow-shutter silk waves wrapping dark rock. Cool desaturated palette, large-format landscape photography, monumental and quiet." },
  { id: "portrait", title: "窗光", location: "工作室", category: "portrait", src: "gallery/portrait.jpg", width: 1200, height: 1600, prompt: "Editorial portrait of a young East Asian woman in her late twenties, wearing a cream wool coat, standing by a tall window. Soft directional window light, shallow depth of field, film-like grain, muted beige and gray interior, calm expression looking slightly off-camera. Photorealistic, 85mm." },
  { id: "lotus", title: "一滴莲", location: "水庭", category: "still", src: "gallery/lotus.jpg", width: 1408, height: 1408, prompt: "Extreme close-up of a pale pink lotus blossom on still dark water, one clear dewdrop on a petal, a few circular ripples. Hasselblad medium-format look, exquisite detail, quiet." },
  { id: "pavilion", title: "大理石午前", location: "巴塞罗那馆", category: "architecture", src: "gallery/pavilion.jpg", width: 1600, height: 1200, prompt: "A Barcelona Pavilion-inspired modernist interior: honey onyx and green marble walls, chrome columns, a single leather Barcelona chair, morning sun stripes across a travertine floor. Architectural photography, serene." },
  { id: "milkyway", title: "盐湖星河", location: "盐滩", category: "night", src: "gallery/milkyway.jpg", width: 1792, height: 1008, prompt: "The Milky Way arching over silent salt flats at night, a single canvas tent with a warm lantern inside, perfectly still water reflecting stars. Ultra-wide astrophotography, deep navy and gold, crisp stars." },
];

const DB = "atelier";
const STORE = "works";
let works = SEED.map((item) => ({ ...item }));
let query = "";
let category = "all";
const urls = [];

function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 1800);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readAll() {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    return await new Promise((resolve, reject) => {
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function writeAll(rows) {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    rows.forEach((row) => store.put(row));
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

function displaySrc(work) {
  if (work.image) {
    const url = URL.createObjectURL(work.image);
    urls.push(url);
    return url;
  }
  return work.staticSrc || work.src;
}

function publish(next) {
  urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  works = next.map((work) => ({
    ...work,
    src: displaySrc(work),
  }));
  render();
}

async function persist(next) {
  publish(next);
  try {
    await writeAll(next);
  } catch {
    /* in-memory still updated */
  }
}

async function ingestImage(file) {
  const bitmap = await createImageBitmap(file);
  const max = 1920;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("无法保存图片"))), "image/jpeg", 0.88);
  });
  return { blob, width, height };
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  return ok;
}

function visibleItems() {
  const q = query.trim().toLowerCase();
  return works.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return [item.title, item.location, item.prompt, item.category].join(" ").toLowerCase().includes(q);
  });
}

function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = CATEGORIES.map(
    (entry) =>
      `<button type="button" role="tab" data-id="${entry.id}" aria-selected="${category === entry.id}">${entry.label}</button>`,
  ).join("");
}

function render() {
  const items = visibleItems();
  document.getElementById("count").textContent = `${items.length} 件作品`;
  renderTabs();
  const grid = document.getElementById("grid");
  if (!items.length) {
    grid.innerHTML = `<div class="empty"><p>${works.length ? "没有找到相符的作品" : "还没有作品"}</p>${
      works.length ? "" : `<button type="button" id="empty-add">添加第一件作品</button>`
    }</div>`;
    return;
  }
  grid.innerHTML = items
    .map(
      (item, index) => `
      <figure class="card" style="animation-delay:${Math.min(index, 8) * 40}ms">
        <button class="card-photo" type="button" data-open="${item.id}" aria-label="放大查看 ${item.title}">
          <img src="${item.src}" alt="${item.title}" width="${item.width}" height="${item.height}" loading="${index < 4 ? "eager" : "lazy"}" />
        </button>
        <figcaption class="card-cap">
          <div class="card-top">
            <h2>${item.title}</h2>
            <span class="card-cat">${LABEL[item.category] || ""}</span>
          </div>
          <div class="card-prompt-head">
            <p>提示词</p>
            <div>
              <button class="ghost" type="button" data-edit="${item.id}">编辑</button>
              <button class="ghost" type="button" data-copy="${item.id}">复制</button>
            </div>
          </div>
          <p class="prompt">${item.prompt}</p>
        </figcaption>
      </figure>`,
    )
    .join("");
}

function seedRecords() {
  return SEED.map((item) => ({
    id: item.id,
    title: item.title,
    location: item.location,
    category: item.category,
    prompt: item.prompt,
    width: item.width,
    height: item.height,
    staticSrc: item.src,
  }));
}

function openEditor(work) {
  const isEdit = Boolean(work);
  const wrap = document.createElement("div");
  wrap.className = "overlay";
  wrap.innerHTML = `
    <button class="overlay-bg" type="button" aria-label="关闭"></button>
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-head">
        <h2>${isEdit ? "编辑作品" : "添加作品"}</h2>
        <button class="close" type="button" aria-label="关闭">✕</button>
      </div>
      <div class="sheet-body">
        <div>
          <span class="field-label">图片</span>
          <input id="work-image" type="file" accept="image/*" hidden />
          <button class="pick" id="pick" type="button">
            ${work ? `<img src="${work.src}" alt="">` : `<span class="pick-empty">选择或拍摄一张图片</span>`}
          </button>
        </div>
        <label><span class="field-label">标题</span><input class="field" id="work-title" value="${work?.title || ""}" placeholder="例如：京都晨雾" /></label>
        <label><span class="field-label">地点</span><input class="field" id="work-location" value="${work?.location || ""}" placeholder="可选" /></label>
        <div>
          <span class="field-label">分类</span>
          <div class="tabs" id="edit-cats">
            ${CATEGORIES.filter((c) => c.id !== "all")
              .map(
                (c) =>
                  `<button type="button" data-cat="${c.id}" aria-selected="${(work?.category || "landscape") === c.id}">${c.label}</button>`,
              )
              .join("")}
          </div>
        </div>
        <label><span class="field-label">提示词</span><textarea class="field" id="work-prompt" rows="6" placeholder="生成这张图时用的提示词">${work?.prompt || ""}</textarea></label>
      </div>
      <div class="sheet-foot">
        <div class="row">
          <button class="btn btn-surface" type="button" data-cancel>取消</button>
          <button class="btn btn-primary" type="button" data-save>保存</button>
        </div>
        ${isEdit ? `<button class="btn btn-danger" type="button" data-delete>删除这件作品</button>` : ""}
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";

  let cat = work?.category || "landscape";
  let image;
  let preview = work?.src || "";

  function close() {
    wrap.remove();
    document.body.style.overflow = "";
  }

  wrap.querySelector(".overlay-bg").onclick = close;
  wrap.querySelectorAll(".close, [data-cancel]").forEach((el) => (el.onclick = close));
  wrap.querySelector("#pick").onclick = () => wrap.querySelector("#work-image").click();
  wrap.querySelector("#work-image").onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      image = await ingestImage(file);
      preview = URL.createObjectURL(image.blob);
      wrap.querySelector("#pick").innerHTML = `<img src="${preview}" alt="">`;
    } catch {
      toast("图片处理失败，请换一张试试");
    }
  };
  wrap.querySelector("#edit-cats").onclick = (event) => {
    const btn = event.target.closest("[data-cat]");
    if (!btn) return;
    cat = btn.dataset.cat;
    wrap.querySelectorAll("[data-cat]").forEach((el) => el.setAttribute("aria-selected", el === btn));
  };
  wrap.querySelector("[data-save]").onclick = async () => {
    const title = wrap.querySelector("#work-title").value.trim();
    const prompt = wrap.querySelector("#work-prompt").value.trim();
    const location = wrap.querySelector("#work-location").value.trim();
    if (!title) return toast("请填写标题");
    if (!prompt) return toast("请填写提示词");
    if (!isEdit && !image) return toast("请先选择图片");
    if (isEdit) {
      const next = works.map((item) => {
        if (item.id !== work.id) return item;
        const updated = { ...item, title, prompt, location, category: cat };
        if (image) {
          updated.image = image.blob;
          updated.width = image.width;
          updated.height = image.height;
          updated.staticSrc = undefined;
        }
        return updated;
      });
      await persist(next);
      toast("已保存");
    } else {
      const created = {
        id: crypto.randomUUID(),
        title,
        location,
        category: cat,
        prompt,
        width: image.width,
        height: image.height,
        image: image.blob,
      };
      await persist([created, ...works]);
      toast("已添加");
    }
    close();
  };
  const del = wrap.querySelector("[data-delete]");
  if (del) {
    del.onclick = async () => {
      if (!confirm("确定删除这件作品？")) return;
      await persist(works.filter((item) => item.id !== work.id));
      toast("已删除");
      close();
    };
  }
}

function openLightbox(item, img) {
  const origin = img.getBoundingClientRect();
  const items = visibleItems();
  const wrap = document.createElement("div");
  wrap.className = "lightbox";
  wrap.innerHTML = `
    <img alt="${item.title}" />
    <div class="lightbox-cap">
      <h2></h2>
      <p></p>
    </div>
    <button class="nav-btn prev" type="button" aria-label="上一张">‹</button>
    <button class="nav-btn next" type="button" aria-label="下一张">›</button>
    <button class="close" type="button" aria-label="关闭">✕</button>
  `;
  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";
  const photo = wrap.querySelector("img");
  const title = wrap.querySelector("h2");
  const prompt = wrap.querySelector("p");
  let current = item;

  function place(fromThumb) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(vw - 32, 1100);
    const maxH = vh - 48;
    const ratio = current.width / current.height;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    const left = (vw - w) / 2;
    const top = (vh - h) / 2;
    photo.src = current.src;
    photo.alt = current.title;
    title.textContent = current.title;
    prompt.textContent = current.prompt;
    photo.style.width = `${w}px`;
    photo.style.height = `${h}px`;
    photo.style.left = `${left}px`;
    photo.style.top = `${top}px`;
    if (fromThumb) {
      const sx = origin.width / w;
      const sy = origin.height / h;
      const ox = origin.left + origin.width / 2 - (left + w / 2);
      const oy = origin.top + origin.height / 2 - (top + h / 2);
      photo.style.transform = `translate(${ox}px, ${oy}px) scale(${sx}, ${sy})`;
      requestAnimationFrame(() => {
        photo.style.transform = "none";
      });
    } else {
      photo.style.transform = "none";
    }
  }

  function close() {
    wrap.remove();
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  }
  function step(dir) {
    const i = items.findIndex((x) => x.id === current.id);
    current = items[(i + dir + items.length) % items.length];
    place(false);
  }
  function onKey(event) {
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }
  wrap.querySelector(".close").onclick = close;
  wrap.querySelector(".prev").onclick = () => step(-1);
  wrap.querySelector(".next").onclick = () => step(1);
  wrap.addEventListener("click", (event) => {
    if (event.target === wrap) close();
  });
  window.addEventListener("keydown", onKey);
  place(true);
}

document.getElementById("tabs").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-id]");
  if (!btn) return;
  category = btn.dataset.id;
  render();
});
document.getElementById("search").addEventListener("input", (event) => {
  query = event.target.value;
  render();
});
document.getElementById("add-btn").onclick = () => openEditor(null);
document.getElementById("restore-btn").onclick = async () => {
  await persist(seedRecords());
  toast("已恢复示范作品");
};
document.getElementById("grid").addEventListener("click", async (event) => {
  const add = event.target.closest("#empty-add");
  if (add) return openEditor(null);
  const open = event.target.closest("[data-open]");
  if (open) {
    const item = works.find((w) => w.id === open.dataset.open);
    const img = open.querySelector("img");
    if (item && img) openLightbox(item, img);
    return;
  }
  const edit = event.target.closest("[data-edit]");
  if (edit) {
    const item = works.find((w) => w.id === edit.dataset.edit);
    if (item) openEditor(item);
    return;
  }
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    const item = works.find((w) => w.id === copy.dataset.copy);
    if (!item) return;
    const ok = await copyText(item.prompt);
    toast(ok ? "已复制提示词" : "复制失败，请手动选择文本");
  }
});

(async () => {
  try {
    let rows = await readAll();
    if (!rows.length) {
      rows = seedRecords();
      await writeAll(rows);
    }
    publish(rows);
  } catch {
    publish(seedRecords());
  }
})();
