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

fileInputs.forEach((fileInput, index) => {
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];

        if (file.type.includes('image')) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/imgurl', {
                method: 'POST',
                body: formData,
            })
                .then((res) => res.json())
                .then((data) => {
                    const { url } = data;
                    const imageUrl = url.split('?')[0];
                    imagePaths[index] = imageUrl;
                    console.log(imageUrl);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    });
});

