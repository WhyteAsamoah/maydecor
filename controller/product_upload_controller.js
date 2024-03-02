const { getStorage } = require('firebase-admin/storage')

const storage = getStorage()
let bucket = null

async function imageUpload(imgFile){
    try {
        
        // const bucket = getStorage().bucket(product)
        
        // // CHECK IF BUCKET ALREADY EXISTS
        // bucket.exists().then(exists => {
        //     if (!exists[0]){
        //         // CREATE BUCKET IF DOES NOT EXIST 
        //         // console.log(`Bucket ${product} not existing!`)
        //         // bucket.create().then(() => { console.log(`Bucket ${product} created successfully!`)})
        //     }else{
        //         // console.log(`Bucket ${product} already created!`)
        //     }
        // })

        // MAKE SURE IMAGE IS NOT EMPTY FILE 
        if (!imgFile) {
          return 'empty';
        }
        // CREATE CUSTOM FILE NAME 
        // const fileName = `${Date.now()}` + imgFile.originalname;
        const fileName = imgFile.originalname;
        console.log(`Filename: ${fileName}`)
        // EXTRA BUFFER 
        var buffer = new Uint8Array(imgFile.buffer);
        // GET FILE ASSIGNED URL 
        const url = await bucket
          .file(fileName)
          .getSignedUrl({ action: "read", expires: "03-01-2500" });
        // GET FILE 
      
        // SAVE FILE TO BUCKET 
        await bucket
            .file(fileName)
            .save(buffer, 
                { 
                    resumable: true,
                });
                
        return url;
      } catch (error) {
        console.log(error.message)
        return error.message;
      }
}

const uploadImages = async (image_files = [], product) => {
    try {
        bucket = storage.bucket()
        
        // COLLECT ALL URL FOR UPLOADED IMAGES 
        const urls = await Promise.all(image_files.map(imageUpload));
        
        return {status: 'Success', content: {urls: urls}}
    } catch (error) {
      return {status: 'error', content: error}
    }
  };

const getImagesFromBucket = async(product) => {
    let image_urls = [];
    let image_files = [];
    let img_initial = product.replaceAll(/ /g, '_');

    const bucket = getStorage().bucket();
    let [is_bucket_exists] = await bucket.exists();
    
    if (is_bucket_exists){
        let filesData = await bucket.getFiles();
        let files = filesData[0]
        // Promise.all(files.map())
        for (let i = 0; i < files.length; i++){
            let img_file = files[i];
            if (img_file.name.startsWith(img_initial)){
                let url = await img_file.getSignedUrl({action: 'read', expires: "03-01-2500"})
                image_urls.push(url)
            }
        }
        // files.map((img_file) => {
        //     let url = '';
        //     if (img_file.name.startsWith(img_initial)){
        //         // let signed = img_file.getSignedUrl({action: 'read', expires: "03-01-2500"})
        //         //         .then(signedUrl => signedUrl)
        //         //         .then((url_signed) => image_urls.push(url_signed[0]))
        //         //         .catch((ex) => console.log(ex))
        //         // url = signed[0];
        //         // console.log(`BEFORE: ${image_urls}`)
        //         image_files.push(img_file)
        //     }
        // })
    }
    
    return image_urls;
}

const uploadModel = async(product) => {

  return;
}

module.exports = {
    uploadImages,
    uploadModel,
    getImagesFromBucket
}