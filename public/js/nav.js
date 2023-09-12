const createNav = () => {
    let nav = document.querySelector('.navbar1');

    nav.innerHTML = `
        <!-- navbar1 -->
        <div class="nav1">
            <a href="index.html"><img src="assets/LogoMakr.png" class="brand-logo" alt=""></a>
            <div class="nav-items">
                <div class="search">
                    <input type="text" class="search-box1" placeholder="search product...">
                    <button class="search-btn">search</button>
                </div>
                <a>
                    <img src="assets/user.png" id="user-img" alt="">
                    <div class="login-logout-popup hide">
                        <p class="account-info">Logged in as, name</p>
                        <button class="btn" id="user-btn">Logout</button>
                    </div>
                </a>
                <a href="/cart" id="cart-button">
                    <img src="assets/cart.png" alt="">
                    <span class="cart-badge">0</span>
                </a>
            </div>
        </div>
        <ul class="links-container">
            <li class="link-item active"><a href="index.html" class="link">Home</a></li>
            <li class="link-item"><a href="#" class="link">About</a></li>
            <li class="link-item"><a href="#" class="link">Services</a></li>
            <li class="link-item"><a href="#" class="link">Contact</a></li>
        </ul>
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
        
        // UPDATES: Pencode
        // GET CART FOR USER 
        (async () => {
            let {email} = user
            let user_cart = await sendData('/get-user-cart', {email: email});
            if (user_cart){
                let cart = user_cart['content'];
                let cart_badge = document.querySelector('.cart-badge');
                cart_badge.innerHTML = cart.length
            }
        })();

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
