const ITEMS_PER_PAGE = 60;
let currentPage = 1;
let editIndex = null; // ➤ 用來記錄要編輯的項目索引

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  renderItems();
  setupAddModal();
  setupEditModal(); // ➤ 設定編輯 modal
  setupInfoModal(); // ➤ 點擊後的資訊 modal
  zoneCompare();
});

// 漢堡選單
function initMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  const closeMenu = document.getElementById('close-menu');

  menuToggle.addEventListener('click', () => sideMenu.style.width = '250px');
  closeMenu.addEventListener('click', () => sideMenu.style.width = '0');
}

// 渲染卡片
function renderItems() {
  const items = getItems();
  const container = document.getElementById('item-container');
  const emptyMsg = document.getElementById('empty-message');
  const pagination = document.getElementById('pagination');

  container.innerHTML = '';
  pagination.innerHTML = '';

  if (items.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  const sorted = [...items].sort(zoneCompare); //解決localstorage排序問題
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = sorted.slice(start, start + ITEMS_PER_PAGE);

  pageItems.forEach((item, index) => {
    const realIndex = start + index;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-content">
        <div class="card-zone-num">
          <div class="card-item-info">
            <h3>${item.name}</h3>
          </div>
          <p>${item.zone}</p>
        </div>
        <div class="note-container">
          <p class="card-item-info-note">${item.description}</p>
        </div>
        <div class="card-buttons">
          <span class="material-symbols-outlined edit-btn" data-index="${realIndex}">edit</span>
          <span class="material-symbols-outlined delete-btn" data-index="${realIndex}">delete_forever</span>
        </div>
      </div>
    `;


    card.addEventListener('click', () => {
      showInfoModal(item);
    });


    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editIndex = parseInt(e.target.dataset.index);
      const item = getItems()[editIndex];
      document.getElementById('edit-item-name').value = item.name;
      document.getElementById('edit-item-zone').value = item.zone;
      document.getElementById('edit-item-desc').value = item.description;
      document.getElementById('edit-item-modal').style.display = 'block';
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      deleteItem(index);
    });



    container.appendChild(card);
  });

  // 加入編輯按鈕事件
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      editIndex = parseInt(btn.dataset.index);
      const item = getItems()[editIndex];
      document.getElementById('edit-item-name').value = item.name;
      document.getElementById('edit-item-zone').value = item.zone;
      document.getElementById('edit-item-desc').value = item.description;
      document.getElementById('edit-item-modal').style.display = 'block';
      
    });
    
  });

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === currentPage ? 'active' : '';
    btn.addEventListener('click', () => {
      currentPage = i;
      renderItems();
    });
    pagination.appendChild(btn);
  }
}

function getItems() {
  return JSON.parse(localStorage.getItem('storageItems') || '[]');
}

function saveItems(items) {
  localStorage.setItem('storageItems', JSON.stringify(items));
}

function deleteItem(index) {
  const items = getItems();
  items.splice(index, 1);
  saveItems(items);
  renderItems();
}

// ➤ 新增功能 modal
function setupAddModal() {
  const openBtn = document.getElementById('open-add-item');
  const closeBtn = document.getElementById('close-add-item');
  const modal = document.getElementById('add-item-modal');
  const confirmBtn = document.getElementById('confirm-add-item');

  openBtn.addEventListener('click', () => modal.style.display = 'block');
  closeBtn.addEventListener('click', () => modal.style.display = 'none');

  confirmBtn.addEventListener('click', () => {
    const name = document.getElementById('item-name').value.trim();
    const zone = document.getElementById('item-zone').value.trim();
    const desc = document.getElementById('item-desc').value.trim();

    if (!name && !zone) {
      alert('你為什麼不寫填寫物品名稱和儲存區域？？？？');
      return;
    } else if (!name) {
      alert('沒寫物品名稱啦！！！');
      return;
    } else if (!zone) {
      alert('沒寫儲存區域啦！！！');
      return;
    }

    //解決localstorage排序問題
    const newItem = { name, zone, description: desc };
    const items = getItems();
    items.push(newItem);

    // ➤ 這裡加上排序
    items.sort(zoneCompare);

    saveItems(items);
    //解決localstorage排序問題//

    // alert('新增成功');
    modal.style.display = 'none';

    document.getElementById('item-name').value = '';
    document.getElementById('item-zone').value = '';
    document.getElementById('item-desc').value = '';
    renderItems();
  });
}

// ➤ 編輯功能 modal
function setupEditModal() {
  const closeBtn = document.getElementById('close-edit-item');
  const modal = document.getElementById('edit-item-modal');
  const confirmBtn = document.getElementById('confirm-edit-item');

  closeBtn.addEventListener('click', () => modal.style.display = 'none');

  confirmBtn.addEventListener('click', () => {
    const name = document.getElementById('edit-item-name').value.trim();
    const zone = document.getElementById('edit-item-zone').value.trim();
    const desc = document.getElementById('edit-item-desc').value.trim();

    if (!name && !zone) {
      alert('漏寫一個就算了，兩個都不寫是想造反啊？');
      return;
    } else if (!name) {
      alert('他是不配擁有一個名稱嗎？');
      return;
    } else if (!zone) {
      alert('沒地方收嗎？好啦垃圾桶統一處理。');
      return;
    }

    const items = getItems();
    if (editIndex !== null && items[editIndex]) {
    //解決localstorage排序問題
    items[editIndex] = { name, zone, description: desc };

    // ➤ 編輯完也排序
    items.sort(zoneCompare);

    saveItems(items);
    //解決localstorage排序問題//

      // alert('更新成功');
      modal.style.display = 'none';
      renderItems();
    } else {
      alert('更新失敗：找不到項目');
    }
  });
}

// 浮動資訊視窗邏輯
function setupInfoModal() {
  const modal = document.getElementById('info-modal');
  const overlay = document.getElementById('info-modal-overlay');
  const closeBtn = document.getElementById('info-close');
  const nameEl = document.getElementById('info-name');
  const zoneEl = document.getElementById('info-zone');
  const descEl = document.getElementById('info-description');

  // 顯示浮動視窗
  window.showInfoModal = function(item) {
    
    nameEl.textContent = item.name;
    zoneEl.textContent = item.zone;
    descEl.textContent = item.description || '（無備註）';

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滾動
  };

  // 關閉視窗
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
}
setupInfoModal(); // 初始化



// 限制字數
$(function (){
    var len = 100; // 超過50個字以"..."取代
    $(".card-item-info-note").each(function(i){
        if($(this).text().length>len){
            $(this).attr("title",$(this).text());
            var text=$(this).text().substring(0,len-1)+"...";
            $(this).text(text);
        }
    });
});


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
