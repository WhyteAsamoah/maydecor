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
const fileInputs = document.querySelectorAll('.fileupload');
const imagePaths = []; // array to store image paths

fileInputs.forEach((fileupload, index) => {
    fileupload.addEventListener('change', () => {
        const file = fileupload.files[0];

        if (file.type.includes('image')) {
            const formData = new FormData();
            formData.append('uploadImage', file);

            fetch('/imgurl', {
                method: 'POST',
                body: formData,
            })
                .then((res) => res.json())
                .then((data) => {
                    const { url } = data;
                    const imageUrl = url.split('?')[0];
                    imagePaths[index] = imageUrl;
                    let label = document.querySelector(`label[for=${fileupload.id}]`);
                    label.style.backgroundImage = `url(${imageUrl})`;
                    let productImage = document.querySelector('.product-image');
                    productImage.style.backgroundImage = `url(${imageUrl})`;
                    // console.log(imageUrl);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            showAlert('Only images are allowed');
        }
    })
})

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
    } else if (!shortLine.value.length > 100 || shortLine.value.length < 10) {
        return showAlert('Short description should be between 10 to 100 characters');
    } else if (!des.value.length) {
        return showAlert('Description is required');
    } else if(!imagePaths.length){ // imagePaths is an array
        return showAlert('Please upload atleast one image');
    } else if (!sizes.length) { // sizes is an array
        return showAlert('Please select atleast one size');
    } else if (!actualPrice.value.length || !discount.value.length || !sellingPrice.value.length) {
        return showAlert('Please enter price details');
    } else if (stock.value < 20) {
        return showAlert('You should have atleast 20 items in stock');
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
        images: imagePaths,
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
        sendData('/add-product', data);
    }
})
