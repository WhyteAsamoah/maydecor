let loader = document.querySelector('.loader');
let user = JSON.parse(sessionStorage.user || null);

const becomeSellerElement = document.querySelector('.become-seller');
const productListingElement = document.querySelector('.product-listing');
const applyForm = document.querySelector('.apply-form');
const showApplyFormBtn = document.querySelector('#apply-btn');

window.onload = () => {
    if(sessionStorage.user) {
        if(compareToken(user.authToken, user.email)) {
            // if(!user.seller) {
            //     becomeSellerElement.classList.remove('hide');
            // } else{
            //     loader.style.display = 'block';
            //     setupProducts();
            // }
            loader.style.display = 'block';
            getUserCart(user.email);
            productListingElement.classList.remove('hide');
        } else {
            location.replace('/login');
        }
    } else {
        location.replace('/login');
    }
}

showApplyFormBtn.addEventListener('click', () => {
    becomeSellerElement.classList.add('hide');
    applyForm.classList.remove('hide');
})

// form submission
const applyFormButton = document.querySelector('#apply-form-btn');
const businessName = document.querySelector('#business-name');
const address = document.querySelector('#business-add');
const about = document.querySelector('#about');
const number = document.querySelector('#number');
const tac = document.querySelector('#terms-and-cond');
const legitInfo = document.querySelector('#legitInfo');

applyFormButton.addEventListener('click', () => {
    if (!businessName.value.length || !address.value.length || !about.value.length || !number.value.length) {
        showAlert('Please fill all the fields');
    } else if (!tac.checked || !legitInfo.checked) {
        showAlert('Please agree to the terms and conditions'); 
    } else{
        // making server request
        loader.style.display = 'block';
        sendData('/seller', {
            name: businessName.value, 
            address: address.value, 
            about: about.value, 
            number: number.value,
            tac: tac.checked,
            legit: legitInfo.checked,
            email: JSON.parse(sessionStorage.user).email
        })
    }
})

const createCartProduct = (data, count) => {
    // UPDATE: Pencode
    // SET IMAGE SOURCE 
    let img_source = data.img ?? "../assets/no image.png"

    let productContainer = document.querySelector('.cart-container');
    productContainer.innerHTML += 
    `<div class="card mb-3">
        <div class="card-body">
            <div class="d-flex justify-content-between">
            <div class="d-flex flex-row align-items-center">
                <div>
                    <img src="${img_source}" class="img-fluid rounded-3" alt="Shopping item" style="width: 65px;">
                </div>
                <div class="ms-3">
                <h3>${data.name}</h3>
                <h4 class="mb-0">${data.shortDes}</h4>
                </div>
            </div>
            <div class="d-flex flex-row align-items-center">
                <div style="width: 50px;">
                    <h5 class="fw-normal mb-0">${count}</h5>
                </div>
                
                <div style="width: 80px;">
                <h4 class="mb-0">$${ count * Number(data.sellPrice)}</h4>
                </div>
                <a href="#!" style="color: #cecece;" onclick="remoteCartItem('${data.id}')"><i class="fas fa-trash-alt fa-lg"></i></a>
            </div>
            </div>
        </div>
    </div>
    `
}

const getUserCart = (email) => {
    (async() => {
        let cart = await sendData('/get-user-cart', {email: email})
        
        if (cart){
            let data = cart['content'];
            setCartItems(data);
        }
    })();
}

const remoteCartItem = (product_id) => {
    (async () => {
        let confirmText = "You are about remove cart Item. \nPress OK to confirm!"
        if (confirm(confirmText) == true){
            let data = {email: user.email, product_id: product_id}
            let resp = await sendData('/remove-cart-item', data);
            let cartData = resp['content'];
            // CLEAR CART CONTENT 
            document.querySelector('.cart-container').innerHTML = '';
            setCartItems(cartData);
        }
    })();
    
}

const setCartItems = (data = []) => {
    if(data.length > 0){
        let totalAmount = data.reduce((tot, cur) => tot + Number(cur['sellPrice']), 0);
        let grouped = groupBy(data, 'id');
        Object.keys(grouped).forEach((key) => {
            let keyObject = grouped[key];
            let count = keyObject.length;
            // CREATE PRODUCT CART 
            createCartProduct(keyObject[0], count)
        });
        // SET CART ITEMS COUNT 
        let items_count_elem = document.querySelector('.cart-items-count');
        let total_amountDoc = document.querySelector('.cart-total-amount')
        items_count_elem.innerHTML = `Items: ${data.length} <br />`
        total_amountDoc.innerHTML = `$${totalAmount}`
    }
}

const groupBy = (arr, key) => {
    let reduced = arr.reduce((tot, cur) => {
        let gKey = cur[key];
        if (!tot[gKey]){
            tot[gKey] = [];
        }
        tot[gKey].push(cur);
        return tot;
    }, {});
    return reduced;
}