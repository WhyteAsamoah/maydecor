let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector('.loader');

// check if user is logged in
window.onload = () => {
    if(user){
        if(!compareToken(user.authToken, user.email)){
            location.replace('/login');
        }
    } else{
        location.replace('/login');
    }
}

// price inputs

const actualPrice = document.querySelector('#actual-price');
const discountPercentage = document.querySelector('#discount');
const sellingPrice = document.querySelector('#sell-price');

discountPercentage.addEventListener('input', () => {
    if(discountPercentage.value > 100){
        discountPercentage.value = 90;
    } else {
        let discount = actualPrice.value * (discountPercentage.value / 100);
        sellingPrice.value = actualPrice.value - discount;
    }
})

sellingPrice.addEventListener('input', () => {
    let discount = (sellingPrice.value / actualPrice.value) * 100;
    discountPercentage.value = discount;
})

// upload image handler

// form submission

const productName = document.querySelector('#product-name');
const shortLine = document.querySelector('#short-des');
const des = document.querySelector('#des');

//will store all the sizes
let sizes = [];

const stock = document.querySelector('#stock');
const tags = document.querySelector('#tags');
const tac = document.querySelector('#tac');

// buttons
const addProductBtn = document.querySelector('#add-btn');
const saveDraft = document.querySelector('#save-btn');

// store size function
const storeSizes = () => {
    sizes = [];
    let sizeCheckBox = document.querySelectorAll('.size-checkbox');
    sizeCheckBox.forEach(item => {
        if(item.checked){
            sizes.push(item.value);
        }
    })
}

const validateForm = () => {
    if (!productName.value.length) {
        return showAlert('Product name is required');
    } else if (shortLine.value.length > 100 || shortLine.value.length < 10) {
        return showAlert('Short description should be between 10 to 100 characters');
    } else if (!des.value.length) {
        return showAlert('Description is required');
    }/*  else if(!imagePaths.length){ // imagePaths is an array
        return showAlert('Please upload atleast one image');
    }  */
    else if (!sizes.length) { // sizes is an array
        return showAlert('Please select atleast one size');
    } else if (!actualPrice.value.length || !discountPercentage.value.length || !sellingPrice.value.length) {
        return showAlert('Please enter price details');
    } else if (stock.value < 10) {
        return showAlert('You should have atleast 10 items in stock');
    } else if (!tags.value.length) {
        return showAlert('Please enter atleast one tag');
    } else if (!tac.checked) {
        return showAlert('Please accept terms and conditions');
    }

    return true;
}

const productData = () => {
    return data = {
        name: productName.value,
        shortDes: shortLine.value,
        des: des.value,
        /* images: imagePaths, */
        sizes: sizes,
        actualPrice: actualPrice.value,
        discount: discountPercentage.value,
        sellPrice: sellingPrice.value,
        stock: stock.value,
        tags: tags.value,
        tac: tac.checked,
        email: user.email
    }
}

addProductBtn.addEventListener('click', () => {
    storeSizes();
    // validate form
    if(validateForm()){ // return true or false while validating form
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.id = productId;
        }
        sendData('/add-product', data);
    }
})

// save draft btn
saveDraft.addEventListener('click', () => {
    // store sizes
    storeSizes();
    //check for prduct name
    if(!productName.value.length){
        showAlert('Enter product name');
    } else { // don't validate form
        let data = productData();
        data.draft = true;
        if(productId){
            data.id = productId;
        }
        sendData('/add-product', data);
    }
})

// exisiting product data handler

const setFormsData = (data) => {
    productName.value = data.name;
    shortLine.value = data.shortDes;
    des.value = data.des;
    actualPrice.value = data.actualPrice;
    discountPercentage.value = data.discount;
    sellingPrice.value = data.sellPrice;
    stock.value = data.stock;
    tags.value = data.tags;

    // set up images
/*     imagePaths = data.images;
    imagePaths.forEach((url, i) => {
        let label = document.querySelector(`label[for=${uploadImages[i].id}]`);
        label.style.backgroundImage = `url(${url})`;
        let productImage = document.querySelector('.product-image');
        productImage.style.backgroundImage = `url(${url})`;
    }) */

    // setup sizes
    sizes = data.sizes;

    let sizeCheckBox = document.querySelectorAll('.size-checkbox');
    sizeCheckBox.forEach(item => {
        if(sizes.includes(item.value)){
            item.setAttribute('checked', '');
        }
    })
}

const fetchProductData = () => {
    // delete the tempProduct from session
    delete sessionStorage.tempProduct;
    fetch('/get-products', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({email: user.email, id: productId})
    })
    .then((res) => res.json())
    .then(data => {
        setFormsData(data);
    })
    .catch(err => {
        console.log(err);
    })
}

let productId = null;
if(location.pathname != '/add-product'){
    productId = decodeURI(location.pathname.split('/').pop());

    let productDetail = JSON.parse(sessionStorage.tempProduct || null);
    // fetch the data if product is not in session
    //if(productDetail == null){
        fetchProductData();
    //}
}