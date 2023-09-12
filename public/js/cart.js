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

const createCartProduct = (data) => {
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
                <h5 class="fw-normal mb-0">2</h5>
                </div>
                <div style="width: 80px;">
                <h5 class="mb-0">$${data.sellPrice}</h5>
                </div>
                <a href="#!" style="color: #cecece;"><i class="fas fa-trash-alt"></i></a>
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
            if(data.length > 0){
                data.forEach(product => {
                    createCartProduct(product)
                });
            }
        }
    })();
}
