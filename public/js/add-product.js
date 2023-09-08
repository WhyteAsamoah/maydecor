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

// UPDATES: Pencode 
// GET IMAGE PREVIEW DOC 
let productImage = document.querySelector('.product-image');

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

addProductBtn.addEventListener('click', async () => {
    storeSizes();
    
    // save_product_images(productId)
    // return

    // validate form
    if(validateForm()){ // return true or false while validating form
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.id = productId;
        }
        let sendRespone = await sendData('/add-product', data);
        console.log(sendRespone)
        if (sendRespone){
            let product_id = sendRespone['product_id']
            save_product_images(product_id)
        }
    }
})

// save draft btn
saveDraft.addEventListener('click', async () => {
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
        await sendData('/add-product', data);
    }
})

// exisiting product data handler

const setFormsData = (data) => {
    
    // set up images
/*     imagePaths = data.images;
    imagePaths.forEach((url, i) => {
        let label = document.querySelector(`label[for=${uploadImages[i].id}]`);
        label.style.backgroundImage = `url(${url})`;
        let productImage = document.querySelector('.product-image');
        productImage.style.backgroundImage = `url(${url})`;
    }) */

    // UPDATES: Pencode
    (async() => {
        productName.value = data.name;
        shortLine.value = data.shortDes;
        des.value = data.des;
        actualPrice.value = data.actualPrice;
        discountPercentage.value = data.discount;
        sellingPrice.value = data.sellPrice;
        stock.value = data.stock;
        tags.value = data.tags;

        if (data.id){
            // FETCH PRODUCT IMAGES 
            let productImages = await getProductImages(data)
            // console.log(productImages)
            if (productImages && productImages.length > 0){
                
                // SET IMAGE PREVIEW TO FIRST PRODUCT IMAGE 
                productImage.style.backgroundImage = `url(${[productImages[0]]})`;
                productImage.style.backgroundPosition = 'center';
                productImage.style.backgroundSize = 'contain';
                productImage.style.backgroundRepeat = 'no-repeat';
                productImage.innerHTML = '';
                // GET ALL IMAGE FILE INPUT DOCS 
                let imageInputsDoc = document.querySelectorAll('input[type=file]');
                productImages.forEach(([url], i) => {
                    imageInputsDoc[i].src = `${url}`;
                    let inputLabel = imageInputsDoc[i].labels[0]
                    inputLabel.style.backgroundImage = `url(${url})`;
                    inputLabel.style.backgroundRepeat = 'no-repeat';

                    // let label = document.querySelector(`label[for=${uploadImages[i].id}]`);
                    // label.style.backgroundImage = `url(${url})`;
                    // let productImage = document.querySelector('.product-image');
                    // productImage.style.backgroundImage = `url(${url})`;
                });
            }
        }
        // setup sizes
        sizes = data.sizes;

        let sizeCheckBox = document.querySelectorAll('.size-checkbox');
        sizeCheckBox.forEach(item => {
            if(sizes.includes(item.value)){
                item.setAttribute('checked', '');
            }
        })
    })();    
}

const fetchProductData = (prod_id) => {
    // delete the tempProduct from session
    delete sessionStorage.tempProduct;
    fetch('/get-seller-products', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({email: user.email, id: prod_id})
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
    
    // let productDetail = JSON.parse(sessionStorage.tempProduct || null);
    // let productDetail = JSON.parse(sessionStorage.getItem(productId) || null);
    // fetch the data if product is not in session
    //if(productDetail == null){
        fetchProductData(productId);
    //}
}

// UPDATES: Pencode
// HELPERS 
// Convert object to FormData---------------------
function object_to_formdata(obj){
    const formData = new FormData();
    Object.entries(obj).forEach(([key, value]) => {
        formData.append(key, value)
    });

    return formData
}
// SAVE IMAGES 
async function save_product_images(product_id=''){
    
    product_id = product_id.replaceAll(/ /g , '_')
    // GET ALL IMAGE HTML DOCS BY CLASS NAME 
    let imagesDocs = document.getElementsByClassName('product-image-upload')
    // FORMDATA OBJECT
    let imageFilesData = new FormData();
    // console.log(imagesDocs.length)
    imageFilesData.append('product', product_id)
    // LOOP LIST OF IMAGE DOCUMENTS 
    for (var i = 0; i < imagesDocs.length; i++){
        let img = imagesDocs[i].files[0]
        // console.log(img)
        if (img !== undefined){
            let filetype = img.type
            let ext = filetype.split('/').slice(-1)[0]
            // CHANGE THE FILE NAME WITH APPENDED INDEX
            // let newFile = new File([img], `${product}-0${i}.${ext}`, { type: img.type})
            let newFile = new File([img], `${product_id}-0${i}.png`, { type: img.type})
            // APPEND UPLOADED IMAGE FILES TO FORMDATA OBJECT 
            imageFilesData.append('image_uploads', newFile)
        }
        // else if (imagesDocs[i].src){ }
    }
    
    // SEND FORMDATA TO BACKEND SERVER
    if (imageFilesData.has('image_uploads')){
        // console.log(imageFilesData.has('image_uploads'))
        sendFormData('/save-product-images', imageFilesData);
    }
    
}

// IMAGE INPUTS CLICK 
const imageInputs = document.querySelectorAll('input[type=file]');
imageInputs.forEach(input => {
    input.addEventListener("change", function(){
        console.log('....changed.....')
        let inputFile = input.files[0];
        if (inputFile){
            let imgUrl = URL.createObjectURL(inputFile);
            // SET IMAGE PREVIEW TO FIRST PRODUCT IMAGE 
            productImage.style.backgroundImage = `url(${imgUrl})`;
            for (let label of input.labels){
                label.style.backgroundImage = `url(${imgUrl})`;
            }
            // URL.revokeObjectURL(imgUrl);
        }
    })
    
    // label.style.backgroundImage = 'url(../assets/LogoMakr.png)';
});
// --------------------------------------------------