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

// 開關側邊選單
function openMenu() {
  document.getElementById('sideMenu').style.width = '250px';
}
function closeMenu() {
  document.getElementById('sideMenu').style.width = '0';
}

// DOM 元素
const searchBtn = document.getElementById('search-btn');
const input = document.getElementById('keyword-input');
const resultsArea = document.getElementById('results-area');

// 資料處理
function getAllItems() {
  const itemsJSON = localStorage.getItem('storageItems');
  if (!itemsJSON) return [];
  try {
    return JSON.parse(itemsJSON);
  } catch (e) {
    return [];
  }
}

// 比對關鍵字
function matchesKeyword(item, keyword) {
  const kw = keyword.toLowerCase();
  return (
    item.name?.toLowerCase().includes(kw) ||
    item.description?.toLowerCase().includes(kw) 
    // item.zone?.toLowerCase().includes(kw)
  );
}

// 顯示結果//在搜尋結果中highlight輸入的關鍵字
function highlightMatch(text, keyword) {
  if (!text) return '';
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape 特殊符號
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>'); 
}

function displayResults(matches) {
  resultsArea.innerHTML = ''; // 清空舊結果

  if (matches.length === 0) {
    const noResult = document.createElement('p');
    noResult.textContent = '查無符合的物品。';
    resultsArea.appendChild(noResult);
    return;
  }

  const keyword = input.value.trim();

  matches.slice(0, 50).forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const container = document.createElement('div');
    container.className = 'nz-container';

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.innerHTML = highlightMatch(item.name, keyword);

    const zoneEl = document.createElement('div');
    zoneEl.className = 'zone';
    zoneEl.textContent = item.zone;

    const descEl = document.createElement('div');
    descEl.className = 'description';
    descEl.innerHTML = highlightMatch(item.description, keyword);

    card.appendChild(container);
    card.appendChild(descEl);
    container.appendChild(nameEl);
    container.appendChild(zoneEl);
    resultsArea.appendChild(card);
  });
}


// 搜尋觸發
function performSearch() {
  const keyword = input.value.trim();
  if (!keyword) {
    resultsArea.innerHTML = '<p>請輸入關鍵字。</p>';
    return;
  }
  const allItems = getAllItems();
  const matched = allItems.filter(item => matchesKeyword(item, keyword));
  displayResults(matched);
}

// 綁定事件
searchBtn.addEventListener('click', performSearch);
input.addEventListener('keypress', e => {
  if (e.key === 'Enter') performSearch();
});
