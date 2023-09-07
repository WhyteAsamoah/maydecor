// let openEditor;
function openEditor(product_data){
    // sessionStorage.setItem(data.id, data)
    // sessionStorage.tempProduct = JSON.stringify(data);
    let decoded = decodeURIComponent(product_data)
    let decoded_data = JSON.parse(decoded)
    location.href = `/add-product/${decoded_data.id}`
}

const createProduct = (data) => {

    // openEditor = (product_data) => {
    //     sessionStorage.setItem(data.id, data)
    //     // sessionStorage.tempProduct = JSON.stringify(data);
    //     // location.href = `/add-product/${data.id}`
    // }
    
    // UPDATE: Pencode
    // SET IMAGE SOURCE 
    let img_source = data.img_0 ?? "../assets/no image.png"

    let productContainer = document.querySelector('.product-container');
    productContainer.innerHTML += `
    <div class="product-card col-md-6 col-lg-6">
        <div class="product-image">
            ${data.draft ? `<span class="tag">Draft</span>` : ''}
            <img src="${img_source}"  class="product-thumb" alt="">
            <button class="card-action-btn edit-btn" onclick="openEditor('${encodeURIComponent(JSON.stringify(data))}')"><img src="../assets/edit.png" alt=""></button>
            <button class="card-action-btn open-btn" onclick="location.href = '/${data.id}'"><img src="../assets/open.png" alt=""></button>
            <button class="card-action-btn delete-popup-btn" onclick="openDeletePopup('${data.id}')"><img src="../assets/delete.png" alt=""></button>
        </div>
        <div class="product-info">
            <h2 class="product-brand">${data.name}</h2>
            <p class="product-short-des">${data.shortDes}</p>
            <span class="price">$${data.sellPrice}</span><span class="actual-price">$${data.actualPrice}</span>
        </div>
    </div>
    `;
}

const openDeletePopup = (id) => {
    let deleteAlert = document.querySelector('.delete-alert');
    deleteAlert.style.display ='flex';

    let closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => deleteAlert.style.display = null);

    let deleteBtn = document.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteItem(id));
}

const deleteItem = (id) => {
    fetch('/delete-product', {
        method: 'POST',
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({id: id})
    }).then(res => res.json())
    .then(data => {
        if(data == 'success') {
            location.reload();
        } else{
            showAlert('Something went wrong. Please try again');
        }
    })
}