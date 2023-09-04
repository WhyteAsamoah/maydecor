const createNav = () => {
    let nav = document.querySelector('.navbar1');

    nav.innerHTML = `
        <!-- navbar1 -->
        <div class="nav1">
            <a href="index.html"><img src="assets/LogoMakr.png" class="brand-logo" alt=""></a>
            <!-- toggle btn -->
            <div class="toggle-btn">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul class="links-container">
                <li class="link-item"><a href="index.html" class="link active">Home</a></li>
                <li class="link-item"><a href="#" class="link">About</a></li>
                <li class="link-item"><a href="#" class="link">Services</a></li>
                <li class="link-item"><a href="#" class="link">Contact</a></li>
            </ul>
            <div class="nav-items">
                <a>
                    <img src="assets/user.png" id="user-img" alt="">
                    <div class="login-logout-popup hide">
                        <p class="account-info">Logged in as, name</p>
                        <button class="btn" id="user-btn">Logout</button>
                    </div>
                </a>
                <a href="#"><img src="assets/cart.png" alt=""></a>
            </div>
        </div>
    `;
}

createNav();

// nav popup
const userImageButton = document.querySelector('#user-img');
const userPop = document.querySelector('.login-logout-popup');
const popuptext = document.querySelector('.account-info');
const actionBtn = document.querySelector('#user-btn');

userImageButton.addEventListener('click', () => {
    userPop.classList.toggle('hide');
})

window.onload = () => {
    let user = JSON.parse(sessionStorage.user || null);
    if (user != null) {
        // user is logged in
        popuptext.innerHTML = `Logged in as ${user.name}`;
        actionBtn.innerHTML = 'Logout';
        actionBtn.addEventListener('click', () => {
            sessionStorage.clear();
            location.reload();
        })

    } else {
        // user is not logged in
        popuptext.innerHTML = 'You are not logged in';
        actionBtn.innerHTML = 'Login';
        actionBtn.addEventListener('click', () => {
            location.href = '/login';
        })
    }
}

// nav toggle
let links = document.querySelectorAll('.links-container');

links.forEach(link => {
    link.addEventListener('click', () => {
        links.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
    })
})

// toggle btn
const toggleBtn = document.querySelector('.toggle-btn');
const ul = document.querySelector('.links-container');

toggleBtn.addEventListener('click', () => {
    ul.classList.toggle('show');
    toggleBtn.classList.toggle('active');
});
