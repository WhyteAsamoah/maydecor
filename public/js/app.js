// UPDATES: Pencode 
let productsInfo = [];
// pop up modal when click on the product card
let previewContainer = document.querySelector('.products-preview');

// UPDATE: Pencode
// CREATE PRODUCT CARD 
const createProductItem = (product) => {
    let img_source = product.img_0 ?? "../assets/no image.png"

    let productContainer = document.querySelector('.products-container');
    productContainer.innerHTML += 
    `
        <div class="product store-item chairs" data-name="p-1" data-item="chairs">
            <img src="${img_source}" alt="">
            <div class="card-body">
                <div class="card-text d-flex justify-content-between text-capitalize">
                    <h3 id="store-item-name">${product.name}</h3>
                    <div class="price">$${product.sellPrice}</div>
                </div>
            </div>
        </div>
    `
}

async function onBuyNow(product_id){
    if (sessionStorage.user){
        let {email} = JSON.parse(sessionStorage.user);
        let product = productsInfo.find(pro => pro.id == product_id)
        product = {
            id: product.id,
            name: product.name,
            stock: product.stock,
            sellPrice: product.sellPrice,
            shortDes: product.shortDes,
            img: product.img_0
        }
        if (email){
            let data = {email: email, product: product}
            let res = await sendData('/add-to-cart', data)
            if (res){
                let cart = res['content'];
                let cart_badge = document.querySelector('.cart-badge');
                cart_badge.innerHTML = cart.length
            }
        }else{
            alert('Login to add to cart')
            location.replace('/login');
        }
    }else {
        alert('Login to add to cart')
        location.replace('/login');
    }
}

// UPDATE: Pencode 
// POP UP PREVIEW FOR PRODUCT INFO 
const createProductPreview = (product) => {
    let img_source = product.img_0 ?? "../assets/no image.png"

    previewContainer.innerHTML += 
        `
        <div class="preview" data-target="p-1">
            <br>
            <i class="fas fa-times"></i>
            <div class="img-container">
                <img src="${img_source}" class="store-img" alt="">
                <span class="store-item-icon">
                <i class="fas fa-shopping-cart"></i>
                </span>
            </div>
            <br>
            <h3>${product.name}</h3>
            <div class="stars">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star-half-alt"></i>
            <span>( 250 )</span>
            </div>
            <p>${product.shortDes}</p>
            <div class="price">$${product.sellPrice}</div>
            <div class="buttons">
                <a href="#" class="btn btn-outline-secondary btn-black text-uppercase buy" onclick="onBuyNow('${product.id}')">buy now</a>
                <a href="#" class="btn btn-outline-secondary btn-black text-uppercase enterAR">View in Room</a>
            </div>
        </div>
        `;
}


// UPDATE: Pencode
// GET PRODUCTS INFORMATION 
(async function(){
    productsInfo = await getProductsInfo();
    // console.log(productsInfo)
    productsInfo.forEach(product => {
        createProductItem(product);
        createProductPreview(product);
    });

    let previewBox = previewContainer.querySelectorAll('.preview');

    document.querySelectorAll('.products-container .product').forEach((productItem, i) => {
        // product.onclick = () => {
        //     console.log('clicked....')
        //     previewContainer.style.display = 'flex';
        //     let name = product.getAttribute('data-name');
        //     previewBox.forEach(preview =>{
        //         let target = preview.getAttribute('data-target');
        //         if (name == target) {
        //             preview.classList.add('active');
        //         } 
        //     });
        // }
        let previewBoxItem = previewBox.item(i);

        productItem.addEventListener("click", function(event){
            // console.log('clicked....')
            previewContainer.style.display = 'flex';
            // let name = productItem.getAttribute('data-name');
            // previewBox.forEach(preview =>{
            //     let target = preview.getAttribute('data-target');
            //     if (name == target) {
            //         preview.classList.add('active');
            //     } 
            // });
            previewBoxItem.classList.add('active');
        }) 

        // close modal when click on the close button
        // previewBox.forEach(close => {
        //     close.querySelector('.fa-times').onclick = () => {
        //         close.classList.remove('active');
        //         previewContainer.style.display = 'none';
        //     }
        // });
        previewBoxItem.querySelector('.fa-times').onclick = () => {
            previewBoxItem.classList.remove('active');
            previewContainer.style.display = 'none';
        }
    });
})();



//show cart toggle
(function(){
    // const cartInfo = document.getElementById('cart-info');
    // const cart = document.getElementById('cart');

    // cartInfo.addEventListener('click', function(){
    //     cart.classList.toggle('show-cart');
    // })
})();


// How much items selected and what total price before selecting any items
(function(){
    const total = [];
    const items = document.querySelectorAll('.cart-item-price');
    items.forEach(function(item){
        total.push(parseFloat(item.textContent));
    })
    
    const totalMoney = total.reduce((total, item) => {
        total += item;
        return total;
    }, 0)
    const finalMoney = totalMoney.toFixed(2);
    // document.getElementById('cart-total').textContent = finalMoney;
    // document.querySelector('.item-total').textContent = finalMoney;
    // document.getElementById('item-count').textContent = total.length
    
})();

// add items to the cart
(function(){
    const cartBtn = document.querySelectorAll('.store-item-icon');

    cartBtn.forEach(function(btn){
        btn.addEventListener('click', function(event){
            if (event.target.parentElement.classList.contains('store-item-icon')) {
                let fullPath = 
                event.target.parentElement.previousElementSibling.src;
                
                let pos = fullPath.indexOf('img') + 3;
                let partPath = fullPath.slice(pos);

                const item = {};
                item.img = `img-cart${partPath}`;

                let name = event.target.parentElement.parentElement.nextElementSibling
                .children[0].children[0].textContent;
                item.name = name;

                let price = event.target.parentElement.parentElement.nextElementSibling
                .children[0].children[1].textContent;

                let finalPrice = price.slice(1).trim();
                item.price = finalPrice;

                const cartItem = document.createElement('div');
                cartItem.classList.add(
                    'cart-item',
                    'd-flex', 
                    'justify-content-between',
                    'text-capitalize',
                    'my-3');

                cartItem.innerHTML = `
                  <img src="${item.img}" class="img-fluid rounded-circle" id="item-img" alt="">
                  <div class="item-text">
      
                    <p id="cart-item-title" class="font-weight-bold mb-0">${item.name}</p>
                    <span>$</span>
                    <span id="cart-item-price" class="cart-item-price" class="mb-0">${item.price}</span>
                  </div>
                  <a href="#" id='cart-item-remove' class="cart-item-remove">
                    <i class="fas fa-trash"></i>
                  </a>
                </div>
                `;

                // select  cart
                const cart = document.getElementById('cart');
                const total = document.querySelector('.cart-total-container');

                cart.insertBefore(cartItem, total);
                alert('Item added to the cart');
                
                showTotals();
            }
        })
    })

    // show Totals after selecting any items
    function showTotals(){
        const total = [];
        const items = document.querySelectorAll('.cart-item-price');
        items.forEach(function(item){
            total.push(parseFloat(item.textContent));
        })
        
        const totalMoney = total.reduce((total, item) => {
            total += item;
            return total;
        }, 0)
        const finalMoney = totalMoney.toFixed(2);
        // document.getElementById('cart-total').textContent = finalMoney;
        // document.querySelector('.item-total').textContent = finalMoney;
        // document.getElementById('item-count').textContent = total.length
        
    }
})();
