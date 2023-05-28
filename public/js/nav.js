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
                    <img src="assets/user.png" alt="">
                    <div class="login-logout-popup hide">
                        <p class="account-info">Logged in</p>
                        <button class="btn" id="user-btn">Logout</button>
                    </div>
                </a>
                <a href="#"><img src="assets/cart.png" alt=""></a>
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
