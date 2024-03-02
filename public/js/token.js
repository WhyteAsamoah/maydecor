let char = `123abcde.fmnopqlABCDE@FJKLMNOPQRSTUVWXYZ456789stuvwxyz0!#$%&ijkrgh'*+-/=?^_${'`'}{|}~`;

const generateToken = (key) => {
    let token = '';
    for(let i = 0; i < key.length; i++){
        let index = char.indexOf(key[i]) || char.length / 2;
        let randomIndex = Math.floor(Math.random() * index);
        token += char[randomIndex] + char[index - randomIndex];
    }
    
    return token;
}

const compareToken = (token, key) => {
    let string = '';
    for(let i = 0; i < token.length; i=i+2){
        let index1 = char.indexOf(token[i]);
        let index2 = char.indexOf(token[i+1]);
        string += char[index1 + index2];
    }
    if(string === key){
        return true;
    }
    return false;
}

// common functions
// send data function
const sendData = async (path, data) => {
    try{
        let res = await fetch(path, {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify(data)
        })

        let response = await res.json()
        // processData(response);
        if (await res.status == 200){
            return response
        }
        else {
            return false
        }
    }
    catch{
        return false
    }
}

const processData = async (data) => {
    loader.style.display = null;
    if (data.alert) {
        showAlert(data.alert);
    } else if(data.name) {
        // create authToken
        data.authToken = generateToken(data.email);
        // store authToken in localStorage
        sessionStorage.user = JSON.stringify(data);
        // redirect to home page
        location.replace('/');
    } else if(data == true){
        // seller page
        let user = JSON.parse(sessionStorage.user);
        user.seller = true;
        sessionStorage.user = JSON.stringify(user);
        location.reload();
    } else if(data.product){
        location.href = '/seller';
    }
}

// alert function
const showAlert = (msg) => {
    let alertBox = document.querySelector('.alert-box');
    let alertMsg = document.querySelector('.alert-msg');
    alertMsg.innerHTML = msg;
    alertBox.classList.add('show');
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 3000);
    return false;
}

// UPDATES: Pencode
// Send FormData -------------------------
const sendFormData = async (path, formData) => {
    try{
        const options = { method: 'post', body: formData };
        const resp = await fetch(path, options);
        // alert(await resp.text())
        if (resp.ok){
            const jResp = await resp.json()
            // alert(JSON.stringify(jResp));
            showAlert(JSON.stringify(jResp))
        }else{
            let rText = res.text();
            throw new Error(rText);
        }
    }catch (ex){
        showAlert(`Err: ${ex}`)
        console.log(ex)
    }
}

// UPDATES: Pencode
const getProductImages = async (product) => {
    try{
        let fetchtRes = await fetch('/get-product-images', {
                            method: 'POST',
                            headers: new Headers({"Content-Type": "application/json"}),
                            body: JSON.stringify({product: product.id})
                        })
    
        if (fetchtRes.status == 200){
            let jsonRes = await fetchtRes.json()
            let product_images = jsonRes['content']
            for (let i = 0; i < product_images.length; i++){
                product[`img_${i}`] = product_images[i]
            }
            return product_images;
        }
    }
    catch(e){
        console.error(e)
    }
}
// ----------------------------------------