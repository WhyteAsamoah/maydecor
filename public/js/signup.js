// redirect to home page if user is logged in
window.onload = () => {
    if (sessionStorage.user) {
        user = JSON.parse(sessionStorage.user);
        if(compareToken(user.authToken, user.email)){
            location.replace('/');
        }
    }
}


const loader = document.querySelector('.loader');

// select inputs 
const submitBtn = document.querySelector('.submit-btn');
const name = document.querySelector('#name') || null;
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number') || null;
const tac = document.querySelector('#terms-and-cond') || null;

// show alert
submitBtn.addEventListener('click', () => {
  if(name != null){ //sign up page
    if (name.value.length < 3) {
        showAlert('Name must be atleast 3 characters long');
    } else if (!email.value.includes('@') || !email.value.includes('.')) {
        showAlert('Invalid email');
    } else if (password.value.length < 6) {
        showAlert('Password must be atleast 6 characters long');
    } else if (number.value.length < 10) {
        showAlert('Invalid number');
    } else if (!tac.checked) {
        showAlert('Please accept terms and conditions');
    } else { 
        // submit form
        loader.style.display = 'block';
        sendData('/signup', {
            name: name.value,
            email: email.value,
            password: password.value,
            number: number.value,
            tac: tac.checked,
            seller: false
        })
    }
  } else { //login page
        if(!email.value.length || !password.value.length){
            showAlert('Please enter your email and password');
        } else {
            // submit form
            loader.style.display = 'block';
            sendData('/login', {
                email: email.value,
                password: password.value,
            })
        }
    }
})