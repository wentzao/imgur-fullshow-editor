// ========== 文藻美語公告編輯器 JavaScript ==========

// 全域變數
let imageIds = [];

// ========== UI 輔助函數 ==========

// 卡片展開/收合
function toggleCard(header) {
    const body = header.nextElementSibling;
    const toggle = header.querySelector('.card-toggle');

    if (body.classList.contains('collapsed')) {
        body.classList.remove('collapsed');
        toggle.classList.remove('collapsed');
        header.classList.add('active');
    } else {
        body.classList.add('collapsed');
        toggle.classList.add('collapsed');
        header.classList.remove('active');
    }
}

// 背景類型選擇
function selectBgType(type) {
    // 更新按鈕狀態
    document.querySelectorAll('.btn-group-custom .btn-option').forEach(btn => {
        btn.classList.remove('active');
    });
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const label = document.querySelector(`label[for="bg${capitalizedType}"]`);
    if (label) label.classList.add('active');

    // 選中對應的 radio
    const radio = document.getElementById(`bg${capitalizedType}`);
    if (radio) radio.checked = true;

    // 顯示/隱藏相關輸入區
    updateBgTypeUI();
    updateUrl();
}

// 預覽縮放選擇
function setPreviewScale(scale, btn) {
    document.getElementById('scale').value = scale;

    // 更新按鈕狀態
    document.querySelectorAll('.preview-control-btn').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    updateScale();
}

// 拖放上傳處理
function setupDragDrop() {
    const uploadZone = document.getElementById('uploadZone');
    if (!uploadZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.style.borderColor = 'var(--primary)';
            uploadZone.style.background = 'var(--primary-light)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.style.borderColor = '';
            uploadZone.style.background = '';
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    uploadImageToImgur(file);
                }
            });
        }
    }, false);
}

// ========== 背景類型 UI 更新 ==========
function updateBgTypeUI() {
    const bgType = document.querySelector('input[name="bgType"]:checked')?.value || 'dots';
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgImageUpload = document.getElementById('bgImageUpload');

    if (bgColorPicker) bgColorPicker.style.display = bgType === 'color' ? 'block' : 'none';
    if (bgImageUpload) bgImageUpload.style.display = bgType === 'image' ? 'block' : 'none';
}

// ========== URL 相關函數 ==========

// 更新URL
function updateUrl() {
    const title = document.getElementById('title').value || '';
    const date = document.getElementById('date').value.replace(/-/g, '') || '';
    const primaryColor = document.getElementById('primaryColor').value || '#02a568';
    const secondaryColor = document.getElementById('secondaryColor').value || '#e6f7f0';
    const imageCount = document.getElementById('imageCount').value || '1';

    // 獲取控制項的值
    const showTitle = document.getElementById('showTitle').checked;
    const showFooter = document.getElementById('showFooter').checked;
    const imageRounded = document.getElementById('imageRounded').checked;
    const screenPaddingV = document.getElementById('screenPaddingVertical').value;
    const screenPaddingH = document.getElementById('screenPaddingHorizontal').value;
    const bgType = document.querySelector('input[name="bgType"]:checked')?.value || 'dots';
    const bgColorValue = document.getElementById('bgColorValue').value;
    const bgImageUrl = document.getElementById('bgImageUrl').value;
    const imageGapV = document.getElementById('imageGapVertical').value;
    const imageGapH = document.getElementById('imageGapHorizontal').value;

    // 構建URL參數（所有參數都是可選的）
    let url = '';

    if (title) url += `title=${encodeURIComponent(title)}&`;
    if (date) url += `date=${date}&`;
    url += `primaryColor=${encodeURIComponent(primaryColor)}&`;
    url += `secondaryColor=${encodeURIComponent(secondaryColor)}&`;
    url += `imageCount=${imageCount}`;

    // 添加新參數（只有非預設值才加入）
    if (!showTitle) url += `&st=0`;
    if (!showFooter) url += `&sf=0`;
    if (!imageRounded) url += `&br=0`;
    if (screenPaddingV !== '10') url += `&spv=${screenPaddingV}`;
    if (screenPaddingH !== '10') url += `&sph=${screenPaddingH}`;
    if (bgType !== 'dots') {
        url += `&bt=${bgType}`;
        if (bgType === 'color' && bgColorValue) {
            url += `&bc=${encodeURIComponent(bgColorValue)}`;
        } else if (bgType === 'image' && bgImageUrl) {
            url += `&bi=${encodeURIComponent(bgImageUrl)}`;
        }
    }
    if (imageGapV !== '10') url += `&igv=${imageGapV}`;
    if (imageGapH !== '10') url += `&igh=${imageGapH}`;

    if (imageIds.length > 0) {
        const encodedImageIds = imageIds.map(id => {
            if (id.startsWith('http')) {
                return encodeURIComponent(id);
            }
            return id;
        });
        url += `&id=${encodedImageIds.join(',')}`;
    }

    // 壓縮URL
    const compressedUrl = LZString.compressToEncodedURIComponent(url);

    // 更新URL顯示
    document.getElementById('url').value = `https://news.wentzao.com/?data=${compressedUrl}`;
    document.getElementById('lineurl').value = `https://liff.line.me/1660786685-j636WZpM?data=${compressedUrl}`;
    updatePreview();
}

// 更新預覽（強制刷新）
function updatePreview() {
    const previewIframe = document.getElementById('previewIframe');
    const previewUrl = document.getElementById('url').value;

    // 添加時間戳強制刷新
    const urlWithTimestamp = previewUrl + (previewUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
    previewIframe.src = urlWithTimestamp;
}

// 更新預覽縮放比例
function updateScale() {
    const scale = document.getElementById('scale').value;
    const deviceSimulator = document.getElementById('deviceSimulator');
    const deviceScreen = document.getElementById('deviceScreen');
    const deviceLabel = document.getElementById('deviceLabel');
    const previewContainer = document.getElementById('previewContainer');

    // 移除所有設備類別
    deviceSimulator.className = 'device-simulator';
    deviceScreen.className = 'device-screen';

    let containerScale = 1;

    if (scale === '1') {
        deviceSimulator.classList.add('mobile');
        deviceScreen.classList.add('mobile');
        deviceLabel.textContent = 'iPhone 14 Pro (390×844)';
        containerScale = 0.85;
    } else if (scale === '0.75') {
        deviceSimulator.classList.add('tablet');
        deviceScreen.classList.add('tablet');
        deviceLabel.textContent = 'iPad Pro (820×1180)';
        containerScale = 0.65;
    } else {
        deviceSimulator.classList.add('desktop');
        deviceScreen.classList.add('desktop');
        deviceLabel.textContent = 'Desktop (1400×900)';
        containerScale = 0.55;
    }

    previewContainer.style.transform = `scale(${containerScale})`;
    updatePreview();
}

// ========== 顏色更新函數 ==========

function updatePrimaryColor(fromPicker = false) {
    const primaryColorInput = document.getElementById('primaryColor');
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const primaryColorPreview = document.getElementById('primaryColorPreview');

    let primaryColor;
    if (fromPicker && primaryColorPicker) {
        primaryColor = primaryColorPicker.value;
        primaryColorInput.value = primaryColor;
    } else {
        primaryColor = primaryColorInput.value;
        if (primaryColor && !primaryColor.startsWith('#')) {
            primaryColor = '#' + primaryColor;
            primaryColorInput.value = primaryColor;
        }
    }

    if (primaryColor) {
        primaryColorPreview.style.backgroundColor = primaryColor;
        if (primaryColorPicker) primaryColorPicker.value = primaryColor;
    }
    updateUrl();
}

function updateSecondaryColor(fromPicker = false) {
    const secondaryColorInput = document.getElementById('secondaryColor');
    const secondaryColorPicker = document.getElementById('secondaryColorPicker');
    const secondaryColorPreview = document.getElementById('secondaryColorPreview');

    let secondaryColor;
    if (fromPicker && secondaryColorPicker) {
        secondaryColor = secondaryColorPicker.value;
        secondaryColorInput.value = secondaryColor;
    } else {
        secondaryColor = secondaryColorInput.value;
        if (secondaryColor && !secondaryColor.startsWith('#')) {
            secondaryColor = '#' + secondaryColor;
            secondaryColorInput.value = secondaryColor;
        }
    }

    if (secondaryColor) {
        secondaryColorPreview.style.backgroundColor = secondaryColor;
        if (secondaryColorPicker) secondaryColorPicker.value = secondaryColor;
    }
    updateUrl();
}

// ========== 剪貼簿函數 ==========

function copyToClipboard() {
    const urlInput = document.getElementById('url');
    urlInput.select();
    document.execCommand('copy');
    showToast('公告網址已複製！');
}

function copyToClipboard2() {
    const urlInput = document.getElementById('lineurl');
    urlInput.select();
    document.execCommand('copy');
    showToast('LINE 網址已複製！');
}

function showToast(message) {
    // 創建 toast 元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ========== 圖片上傳函數 ==========

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function uploadImageToImgur(file) {
    // 創建上傳中的佔位元素
    const saveStatus = document.createElement('div');
    saveStatus.classList.add('img-container');
    saveStatus.style.cssText = 'display:flex;align-items:center;justify-content:center;background:var(--primary-light);border:2px dashed var(--primary);';
    saveStatus.innerHTML = '<div style="text-align:center;"><i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i><div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">上傳中...</div></div>';
    document.getElementById('imageList').appendChild(saveStatus);

    showToast('📤 正在上傳圖片...');

    const clientId = "a0a92307b538c2f";

    fileToBase64(file)
        .then((base64) => {
            return fetch("https://imgurproxy.dreamdomroy.workers.dev/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64,
                    clientId: clientId
                })
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('img-container');
                imgContainer.dataset.imageId = result.data.id;

                const img = document.createElement('img');
                img.src = result.data.link;
                img.classList.add('image-preview');

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.onclick = () => {
                    const index = imageIds.indexOf(result.data.id);
                    if (index > -1) {
                        imageIds.splice(index, 1);
                    }
                    imgContainer.remove();
                    updateUrl();
                    showToast('🗑️ 圖片已刪除');
                };

                imgContainer.appendChild(img);
                imgContainer.appendChild(deleteBtn);
                document.getElementById('imageList').appendChild(imgContainer);

                imageIds.push(result.data.id);
                showToast('✅ 圖片上傳成功！');
            } else {
                showToast('❌ 圖片上傳失敗，請重試');
            }
            saveStatus.remove();
            updateUrl();
            updateScale();
        })
        .catch(error => {
            console.error("Error:", error);
            saveStatus.remove();
            showToast('❌ 上傳失敗: ' + error.message);
        });
}

// ========== 從 URL 添加圖片 ==========

function isImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

function addImageFromUrl() {
    const urlInput = document.getElementById('imageUrl');
    const imageUrl = urlInput.value.trim();

    if (!imageUrl) {
        showToast('⚠️ 請輸入圖片網址');
        return;
    }

    try {
        new URL(imageUrl);
    } catch (e) {
        showToast('⚠️ 請輸入有效的網址格式');
        return;
    }

    const saveStatus = document.createElement('div');
    saveStatus.classList.add('img-container');
    saveStatus.style.cssText = 'display:flex;align-items:center;justify-content:center;background:var(--primary-light);border:2px dashed var(--primary);';
    saveStatus.innerHTML = '<div style="text-align:center;"><i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i><div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">載入中...</div></div>';
    document.getElementById('imageList').appendChild(saveStatus);

    showToast('🔗 正在載入圖片...');

    const testImg = new Image();
    testImg.onload = function () {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');
        imgContainer.dataset.imageId = imageUrl;

        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('image-preview');

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.onclick = () => {
            const index = imageIds.indexOf(imageUrl);
            if (index > -1) {
                imageIds.splice(index, 1);
            }
            imgContainer.remove();
            updateUrl();
            showToast('🗑️ 圖片已刪除');
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        document.getElementById('imageList').appendChild(imgContainer);

        imageIds.push(imageUrl);
        urlInput.value = '';
        saveStatus.remove();
        updateUrl();
        updateScale();
        showToast('✅ 圖片載入成功！');
    };

    testImg.onerror = function () {
        saveStatus.remove();
        showToast('❌ 無法載入圖片，請檢查網址');
    };

    testImg.src = imageUrl;
}

// ========== 解碼函數 ==========

function formatDateString(dateString) {
    if (!dateString) return '';
    if (dateString.length === 8) {
        return dateString.slice(0, 4) + '-' + dateString.slice(4, 6) + '-' + dateString.slice(6, 8);
    }
    return dateString;
}

function decodeAndApplyData() {
    try {
        const input = document.getElementById('decodedUrlInput');

        let dataParam = input.value;
        if (dataParam.includes('?data=')) {
            dataParam = dataParam.split('?data=')[1];
        } else if (dataParam.includes('data=')) {
            dataParam = dataParam.split('data=')[1];
        }
        if (dataParam.includes('&')) {
            dataParam = dataParam.split('&')[0];
        }
        if (dataParam.includes('#')) {
            dataParam = dataParam.split('#')[0];
        }

        const data = LZString.decompressFromEncodedURIComponent(dataParam);

        if (!data) {
            alert('解壓縮失敗，請確認網址格式正確');
            return;
        }

        const params = new URLSearchParams(data);

        document.getElementById('title').value = params.get('title') || '';
        document.getElementById('date').value = formatDateString(params.get('date'));
        document.getElementById('primaryColor').value = params.get('primaryColor') || '#02a568';
        document.getElementById('secondaryColor').value = params.get('secondaryColor') || '#e6f7f0';
        document.getElementById('imageCount').value = params.get('imageCount') || '1';

        document.getElementById('showTitle').checked = params.get('st') !== '0';
        document.getElementById('showFooter').checked = params.get('sf') !== '0';
        document.getElementById('imageRounded').checked = params.get('br') !== '0';

        document.getElementById('screenPaddingVertical').value = params.get('spv') || '10';
        document.getElementById('screenPaddingHorizontal').value = params.get('sph') || '10';
        document.getElementById('screenPaddingVerticalValue').textContent = params.get('spv') || '10';
        document.getElementById('screenPaddingHorizontalValue').textContent = params.get('sph') || '10';

        const bgType = params.get('bt') || 'dots';
        selectBgType(bgType);

        if (bgType === 'color') {
            document.getElementById('bgColorValue').value = params.get('bc') || '#FFFFFF';
        } else if (bgType === 'image') {
            document.getElementById('bgImageUrl').value = params.get('bi') ? decodeURIComponent(params.get('bi')) : '';
        }

        document.getElementById('imageGapVertical').value = params.get('igv') || '10';
        document.getElementById('imageGapHorizontal').value = params.get('igh') || '10';
        document.getElementById('imageGapVerticalValue').textContent = params.get('igv') || '10';
        document.getElementById('imageGapHorizontalValue').textContent = params.get('igh') || '10';

        const imageIdsDecoded = params.get('id');

        if (imageIdsDecoded) {
            document.getElementById('imageList').innerHTML = '';
            imageIds = [];

            const rawImageIds = imageIdsDecoded.split(',');

            const decodedImageIds = rawImageIds.map(id => {
                if (id.includes('%')) {
                    try {
                        const decodedId = decodeURIComponent(id);
                        if (decodedId.startsWith('http')) {
                            return decodedId;
                        }
                    } catch (e) { }
                }
                return id;
            });

            decodedImageIds.forEach(id => {
                if (id.startsWith('http')) {
                    fetchImageFromUrl(id);
                } else {
                    fetchImageFromImgur(id);
                }
            });
        }

        updatePrimaryColor();
        updateSecondaryColor();

        const modalElement = document.querySelector('#decodeModal');
        var modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

    } catch (error) {
        console.error('解碼錯誤:', error);
        alert('解碼過程發生錯誤: ' + error.message);
    }
}

function fetchImageFromImgur(id) {
    const clientId = "a0a92307b538c2f";
    fetch(`https://api.imgur.com/3/image/${id}`, {
        headers: {
            Authorization: "Client-ID " + clientId,
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('img-container');
                imgContainer.dataset.imageId = data.data.id;

                const img = document.createElement('img');
                img.src = data.data.link;
                img.classList.add('image-preview');

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.onclick = () => {
                    imgContainer.remove();
                    const index = imageIds.indexOf(data.data.id);
                    if (index > -1) {
                        imageIds.splice(index, 1);
                    }
                    updateUrl();
                    updatePreview();
                };

                imgContainer.appendChild(img);
                imgContainer.appendChild(deleteBtn);
                document.getElementById('imageList').appendChild(imgContainer);

                imageIds.push(data.data.id);
            }
        })
        .catch(error => {
            console.error("Error loading image from Imgur:", error);
        })
        .finally(() => {
            updateUrl();
            updatePreview();
        });
}

function fetchImageFromUrl(imageUrl) {
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('img-container');
    imgContainer.dataset.imageId = imageUrl;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.classList.add('image-preview');

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = () => {
        imgContainer.remove();
        const index = imageIds.indexOf(imageUrl);
        if (index > -1) {
            imageIds.splice(index, 1);
        }
        updateUrl();
        updatePreview();
    };

    imgContainer.appendChild(img);
    imgContainer.appendChild(deleteBtn);
    document.getElementById('imageList').appendChild(imgContainer);

    imageIds.push(imageUrl);
    updateUrl();
    updatePreview();
}

// ========== 背景圖片上傳 ==========

function uploadBgImageToImgur(file) {
    const clientId = "a0a92307b538c2f";
    const bgImageUrlInput = document.getElementById('bgImageUrl');

    bgImageUrlInput.value = '上傳中...';
    bgImageUrlInput.disabled = true;

    fileToBase64(file)
        .then((base64) => {
            return fetch("https://imgurproxy.dreamdomroy.workers.dev/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64,
                    type: "base64"
                })
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                bgImageUrlInput.value = result.data.link;
                updateUrl();
            } else {
                alert("背景圖片上傳失敗，請重試！");
                bgImageUrlInput.value = '';
            }
        })
        .catch(error => {
            console.error("Error:", error);
            bgImageUrlInput.value = '';
            alert("上傳失敗: " + error.message);
        })
        .finally(() => {
            bgImageUrlInput.disabled = false;
        });
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', function () {
    // 設置日期
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);

    // 初始化拖放
    setupDragDrop();

    // 圖片上傳監聽
    document.getElementById('upload').addEventListener('change', function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                uploadImageToImgur(file);
            });
        }
    });

    // 輸入監聽器
    document.getElementById('title').addEventListener('input', updateUrl);
    document.getElementById('date').addEventListener('input', updateUrl);
    document.getElementById('primaryColor').addEventListener('input', updatePrimaryColor);
    document.getElementById('secondaryColor').addEventListener('input', updateSecondaryColor);
    document.getElementById('imageCount').addEventListener('input', updateUrl);
    document.getElementById('scale').addEventListener('input', updateScale);

    // 顏色選擇器監聽
    document.getElementById('primaryColorPicker').addEventListener('input', function () {
        updatePrimaryColor(true);
    });
    document.getElementById('secondaryColorPicker').addEventListener('input', function () {
        updateSecondaryColor(true);
    });

    document.getElementById('imageUrl').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addImageFromUrl();
        }
    });

    updatePrimaryColor();
    updateSecondaryColor();

    // Sortable
    new Sortable(document.getElementById('imageList'), {
        animation: 150,
        ghostClass: 'blue-background-class',
        onEnd: function () {
            const containers = document.querySelectorAll('#imageList .img-container');
            imageIds = [];
            containers.forEach(container => {
                imageIds.push(container.dataset.imageId);
            });
            updateUrl();
        }
    });

    // 顯示選項監聽器
    document.getElementById('imageRounded').addEventListener('change', updateUrl);
    document.getElementById('showTitle').addEventListener('change', updateUrl);
    document.getElementById('showFooter').addEventListener('change', updateUrl);

    // 滑桿監聽器
    document.getElementById('screenPaddingVertical').addEventListener('input', function () {
        document.getElementById('screenPaddingVerticalValue').textContent = this.value;
        updateUrl();
    });
    document.getElementById('screenPaddingHorizontal').addEventListener('input', function () {
        document.getElementById('screenPaddingHorizontalValue').textContent = this.value;
        updateUrl();
    });
    document.getElementById('imageGapVertical').addEventListener('input', function () {
        document.getElementById('imageGapVerticalValue').textContent = this.value;
        updateUrl();
    });
    document.getElementById('imageGapHorizontal').addEventListener('input', function () {
        document.getElementById('imageGapHorizontalValue').textContent = this.value;
        updateUrl();
    });

    // 背景類型監聽
    document.querySelectorAll('input[name="bgType"]').forEach(radio => {
        radio.addEventListener('change', function () {
            updateBgTypeUI();
            updateUrl();
        });
    });

    document.getElementById('bgColorValue').addEventListener('input', function () {
        document.getElementById('bgColorPreview').style.backgroundColor = this.value;
        updateUrl();
    });
    document.getElementById('bgImageUrl').addEventListener('input', updateUrl);
    document.getElementById('bgImageFile').addEventListener('change', function (event) {
        if (event.target.files.length > 0) {
            uploadBgImageToImgur(event.target.files[0]);
        }
    });

    // 初始化
    updateBgTypeUI();
    updateScale();
});
