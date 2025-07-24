// 分頁連結
document.getElementById('zone-search').addEventListener('click', () => {
  window.location.href = 'zone.html';
});
document.getElementById('keyword-search').addEventListener('click', () => {
  window.location.href = 'keyword.html';
});
document.getElementById('storage-list').addEventListener('click', () => {
  window.location.href = 'list.html';
});

// 新增物品 modal
document.getElementById('open-add-item').addEventListener('click', () => {
  document.getElementById('add-item-modal').style.display = 'flex';
});

document.getElementById('close-add-item').addEventListener('click', () => {
  document.getElementById('add-item-modal').style.display = 'none';
});

document.getElementById('confirm-add-item').addEventListener('click', () => {
  const inputs = document.querySelectorAll('#add-item-modal input');
  const name = inputs[0].value.trim();  // 第一個 input：物品名稱
  const zone = inputs[1].value.trim();  // 第二個 input：儲存區域
  const desc = inputs[2].value.trim();  // 第三個 input：備註（可留空）

  if (!name && !zone) {
    alert('你尚未填寫物品名稱與儲存區域');
  } else if (!name) {
    alert('你尚未填寫物品名稱');
  } else if (!zone) {
    alert('你尚未填寫儲存區域');
  } else {
    alert('新增成功');
    document.getElementById('add-item-modal').style.display = 'none';
  }

    const newItem = { name, zone, description: desc };
    const items = getItems();
    items.push(newItem);

    // ➤ 這裡加上排序
    items.sort(zoneCompare);

    saveItems(items);

    document.getElementById('item-name').value = '';
    document.getElementById('item-zone').value = '';
    document.getElementById('item-desc').value = '';
    renderItems();

});

// 儲存至localstorage
function getItems() {
  return JSON.parse(localStorage.getItem('storageItems') || '[]');
}

function saveItems(items) {
  localStorage.setItem('storageItems', JSON.stringify(items));
}

// 匯入/匯出 modal
document.getElementById('open-import-export').addEventListener('click', () => {
  document.getElementById('import-export-modal').style.display = 'flex';
});
document.getElementById('close-import-export').addEventListener('click', () => {
  document.getElementById('import-export-modal').style.display = 'none';
});

// 匯出 localStorage 中的 items 為 JSON 檔案
document.getElementById('export-json-btn').addEventListener('click', () => {
  const items = JSON.parse(localStorage.getItem('storageItems') || '[]');
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'storage-map.json';
  a.click();
  URL.revokeObjectURL(url);
});

// 匯入 JSON 檔案並存入 localStorage
document.getElementById('import-json-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = event => {
    try {
      const imported = JSON.parse(event.target.result);
      const current = JSON.parse(localStorage.getItem('storageItems') || '[]');
      const merged = current.concat(imported);
      localStorage.setItem('storageItems', JSON.stringify(merged));
      alert('匯入成功！');
    } catch {
      alert('匯入失敗，請確認 JSON 格式正確');
    }
  };
  reader.readAsText(file);
});


// 點擊圖片全螢幕
const fullscreenView = document.getElementById('fullscreen-view');
const fullscreenImg = document.getElementById('fullscreen-img');

document.querySelectorAll('.preview-image').forEach(img => {
  img.addEventListener('click', () => {
    fullscreenImg.src = img.src;
    fullscreenView.style.display = 'flex';
  });
});

document.getElementById('close-fullscreen').addEventListener('click', () => {
  fullscreenView.style.display = 'none';
});

fullscreenView.addEventListener('click', (e) => {
  if (e.target === fullscreenView) {
    fullscreenView.style.display = 'none';
  }
});


// 放大縮小拖曳
let zoomScale = 1;
const zoomStep = 0.05;
const minZoom = 0.5;
const maxZoom = 5;

const closeBtn = document.getElementById('close-fullscreen');
const previewImages = document.querySelectorAll('.preview-image');
// const fullscreenView = document.getElementById('fullscreen-view');
// const fullscreenImg = document.getElementById('fullscreen-img');

let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

// 桌機中鍵點擊 → 拖動圖片
fullscreenImg.addEventListener('mousedown', (e) => {
  if (e.button !== 1) return;
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
  fullscreenImg.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const speed = 1.0; // 可調整拖曳靈敏度
  currentX = (e.clientX - startX) * speed;
  currentY = (e.clientY - startY) * speed;
  limitWithinBounds();
  updateTransform();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  fullscreenImg.style.cursor = 'grab';
});

// Ctrl + 滾輪縮放
document.addEventListener('wheel', (e) => {
  if (!e.ctrlKey || !fullscreenView.classList.contains('active')) return;
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomScale = Math.min(maxZoom, zoomScale + zoomStep);
  } else {
    zoomScale = Math.max(minZoom, zoomScale - zoomStep);
  }
  limitWithinBounds();
  updateTransform();
}, { passive: false });

// 雙擊圖片還原
fullscreenImg.addEventListener('dblclick', () => {
  resetTransform();
});

// 點擊預覽圖開啟全螢幕
previewImages.forEach(img => {
  img.addEventListener('click', () => {
    fullscreenImg.src = img.src;
    fullscreenView.classList.add('active');
    resetTransform();
  });
});

closeBtn.addEventListener('click', () => {
  fullscreenView.classList.remove('active');
});

function updateTransform() {
  fullscreenImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${zoomScale})`;
}

function resetTransform() {
  zoomScale = 1;
  currentX = 0;
  currentY = 0;
  updateTransform();
}

// 限制圖片在可視區域內
function limitWithinBounds() {
  const imgRect = fullscreenImg.getBoundingClientRect();
  const containerRect = fullscreenView.getBoundingClientRect();

  const offsetX = (imgRect.width - containerRect.width) / 2;
  const offsetY = (imgRect.height - containerRect.height) / 2;

  const maxX = Math.max(0, offsetX);
  const maxY = Math.max(0, offsetY);

  currentX = Math.min(maxX, Math.max(-maxX, currentX));
  currentY = Math.min(maxY, Math.max(-maxY, currentY));
}

//
// 👉 手機觸控拖曳與雙指縮放
//
let touchStartX = 0;
let touchStartY = 0;
let isTouchDragging = false;
let initialDistance = 0;
let initialZoom = 1;
let lastTapTime = 0;

fullscreenImg.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    // 單指拖曳
    isTouchDragging = true;
    touchStartX = e.touches[0].clientX - currentX;
    touchStartY = e.touches[0].clientY - currentY;

    // 檢查是否為雙擊
    const now = new Date().getTime();
    if (now - lastTapTime < 300) {
      resetTransform();
    }
    lastTapTime = now;

  } else if (e.touches.length === 2) {
    // 雙指縮放
    isTouchDragging = false;
    initialDistance = getTouchDistance(e.touches);
    initialZoom = zoomScale;
  }
}, { passive: false });

fullscreenImg.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (isTouchDragging && e.touches.length === 1) {
    currentX = e.touches[0].clientX - touchStartX;
    currentY = e.touches[0].clientY - touchStartY;
    limitWithinBounds();
    updateTransform();
  } else if (e.touches.length === 2) {
    const currentDistance = getTouchDistance(e.touches);
    let scaleFactor = currentDistance / initialDistance;
    zoomScale = Math.min(maxZoom, Math.max(minZoom, initialZoom * scaleFactor));
    limitWithinBounds();
    updateTransform();
  }
}, { passive: false });

fullscreenImg.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    isTouchDragging = false;
  }
});

// 計算雙指距離
function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// ➤ 自訂 zone 排序邏輯 //解決localstorage排序問題
function zoneCompare(a, b) {
  const order = ['A', 'B', 'C', 'D', 'M', 'MD', 'N', 'ND'];

  function parseZone(z) {
    const match = z.match(/^([A-Z]+)(\d+)(?:-(\d+))?$/);
    if (!match) return [999, 999, 999]; // 無法解析的放最後
    const [_, letter, num, sub] = match;
    const groupIndex = order.indexOf(letter);
    return [groupIndex === -1 ? 999 : groupIndex, parseInt(num), parseInt(sub) || 0];
  }

  const [groupA, numA, subA] = parseZone(a.zone);
  const [groupB, numB, subB] = parseZone(b.zone);

  if (groupA !== groupB) return groupA - groupB;
  if (numA !== numB) return numA - numB;
  return subA - subB;
}