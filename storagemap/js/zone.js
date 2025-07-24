document.addEventListener('DOMContentLoaded', () => {
  initMenu();
});

// 漢堡選單
function initMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  const closeMenu = document.getElementById('close-menu');

  menuToggle.addEventListener('click', () => sideMenu.style.width = '250px');
  closeMenu.addEventListener('click', () => sideMenu.style.width = '0');
}

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.zone-btn');
  const displayArea = document.getElementById('zone-display');

  // 取得 localStorage 中所有資料
  function getItems() {
    return JSON.parse(localStorage.getItem('storageItems')) || [];
  }

  // 渲染右側名稱區（依照 zone）
  function renderZoneItems(zone) {
    const items = getItems().filter(item => item.zone === zone);
    displayArea.innerHTML = '';

    if (items.length === 0) {
      displayArea.textContent ='你還沒加東西進來啦！動作還不快點！';
      return;
    }

    // 建立 container，使用 grid 或 flex 呈現 2-3 column 左對齊
    const container = document.createElement('div');
    container.className = 'zone-items-container';

    items.forEach(item => {
      const nameDiv = document.createElement('div');
      nameDiv.className = 'zone-item-name';
      nameDiv.textContent = item.name;
      container.appendChild(nameDiv);
    });

    displayArea.appendChild(container);
  }

  // 點擊物品名稱時顯示浮動視窗
displayArea.addEventListener('click', function (e) {
  if (e.target.classList.contains('zone-item-name')) {
    const clickedName = e.target.textContent;
    const allItems = getItems();
    const matchedItem = allItems.find(item => item.name === clickedName);
    if (matchedItem) {
      document.getElementById('modal-item-name').textContent = matchedItem.name;
      document.getElementById('modal-item-description').textContent = matchedItem.description || '無備註';
      document.getElementById('item-modal').style.display = 'block';
    }
  }
});

// 關閉浮動視窗
document.getElementById('item-modal-close').addEventListener('click', () => {
  document.getElementById('item-modal').style.display = 'none';
});

// 點擊背景也可關閉
document.getElementById('item-modal').addEventListener('click', (e) => {
  if (e.target.id === 'item-modal') {
    document.getElementById('item-modal').style.display = 'none';
  }
});


  // 管理 active 按鈕樣式
  function setActiveButton(clickedBtn) {
    buttons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  // 綁定按鈕事件
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const zone = button.getAttribute('data-zone');
      setActiveButton(button);
      renderZoneItems(zone);
    });
  });

});



