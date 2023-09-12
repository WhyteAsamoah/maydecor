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

const getProductsInfo = async() => {
    let productsInfo = [];

    let fetchResponse = await fetch('/get-products', {
        method: 'POST',
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify()
    })
    
    if (fetchResponse.status == 200){
        let contentData = await fetchResponse.json();
        for (let i = 0; i < contentData.length; i++){
            // UPDATES: Pencode 
            await getProductImages(contentData[i])
            productsInfo.push(contentData[i])
        }
    }
    return productsInfo;
}

// send data function
const sendData = async (path, data) => {
    try{
        let res = await fetch(path, {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify(data)
        })

        let response = await res.json()
        
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