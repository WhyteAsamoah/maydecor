let loader = document.querySelector('.loader');
let user = JSON.parse(sessionStorage.user || null);

const becomeSellerElement = document.querySelector('.become-seller');
const productListingElement = document.querySelector('.product-listing');
const applyForm = document.querySelector('.apply-form');
const showApplyFormBtn = document.querySelector('#apply-btn');

window.onload = () => {
    if(sessionStorage.user) {
        if(compareToken(user.authToken, user.email)) {
            if(!user.seller) {
                becomeSellerElement.classList.remove('hide');
            } else{
                loader.style.display = 'block';
                setupProducts();
            }
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

const setupProducts = () => {
<<<<<<< HEAD
    fetch('/get-seller-products', {
=======
    fetch('/get-products', {
>>>>>>> 3a246fd836e619c317a2bc974dbd66dbdd979183
        method: 'POST',
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({email: user.email})
    })
    .then(res => res.json())
    .then(data => {
        loader.style.display = null;
        productListingElement.classList.remove('hide');
        if(data == 'No products found') {
            let emptySvg = document.querySelector('.no-product-image');
            emptySvg.classList.remove('hide');
        } else {
<<<<<<< HEAD
            data.forEach(product => {
                (async() => {
                    // UPDATES: Pencode 
                    await getProductImages(product)
                    // console.log(`NEW product: ${JSON.stringify(product)}`)
                    createProduct(product)
                })();
            });
        }
    });
}

// // UPDATES: Pencode
// const getProductImages = async (product) => {
//     try{
//     let fetchtRes = await fetch('/get-product-images', {
//                         method: 'POST',
//                         headers: new Headers({"Content-Type": "application/json"}),
//                         body: JSON.stringify({product: product.id})
//                     })
    
//         if (fetchtRes.status == 200){
//             let jsonRes = await fetchtRes.json()
//             let product_images = jsonRes['content']
//             for (let i = 0; i < product_images.length; i++){
//                 product[`img_${i}`] = product_images[i]
//             }
//         }

//         // .then((res) => {
//         //     if (res.status == 200){
//         //         return res.json()
//         //     }else {

//         //     }
//         // }).then(json => {
            
//         // })
//         // .catch(ex => {
//         //     console.log(ex)
//         // })
//     }
//     catch(e){
//         console.error(e)
//     }
// }
=======
            data.forEach(product => createProduct(product));
        }
    });
}
>>>>>>> 3a246fd836e619c317a2bc974dbd66dbdd979183
