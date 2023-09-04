const createFooter = () => {
    let footer = document.querySelector('footer');

    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-ul-container">
                <ul class="category">
                    <li class="category-title">Furnitures</li>
                    <li><a href="#" class="footer-link">Chairs</a></li>
                    <li><a href="#" class="footer-link">Shelves</a></li>
                    <li><a href="#" class="footer-link">Desks</a></li>
                    <li><a href="#" class="footer-link">Tables</a></li>
                    <li><a href="#" class="footer-link">Chairs</a></li>
                    <li><a href="#" class="footer-link">Shelves</a></li>
                    <li><a href="#" class="footer-link">Desks</a></li>
                    <li><a href="#" class="footer-link">Tables</a></li>
                </ul>
                <ul class="category">
                    <li class="category-title">Others</li>
                    <li><a href="#" class="footer-link">WallPrints</a></li>
                    <li><a href="#" class="footer-link">Lamps</a></li>
                    <li><a href="#" class="footer-link">Plants</a></li>
                    <li><a href="#" class="footer-link">All</a></li>
                    <li><a href="#" class="footer-link">Chairs</a></li>
                    <li><a href="#" class="footer-link">Shelves</a></li>
                    <li><a href="#" class="footer-link">Desks</a></li>
                    <li><a href="#" class="footer-link">Tables</a></li>
                </ul>
            </div>
            <img src="assets/LogoMakr.png" class="logo" alt="">
        </div>
        <p class="footer-title">About Company</p>
        <p class="info">Lorem ipsum dolor sit amet consectetur adipisicing elit
            sedc dnmo eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
            qui officia deserunt mollit anim id est laborum.</p>
        <p class="info">support emails - help@maydecor.com, customersupport@maydecor.com</p>
        <p class="info">telephone - 180 00 00 001, 180 00 00 002</p>
        <div class="footer-social-container">
            <div>
                <a href="#" class="social-link">terms & services</a>
                <a href="#" class="social-link">privacy page</a>
            </div>
            <div>
                <a href="#" class="social-link">
                    <img src="assets/Instagram.png" alt="">
                </a>
                <a href="#" class="social-link">
                    <img src="assets/Facebook.png" alt="">
                </a>
                <a href="#" class="social-link">
                    <img src="assets/Twitter.png" alt="">
                </a>
            </div>
        </div>
        <p class="footer-credit">Maydecor, Best AR online store for interior items</p>

    `;
}

createFooter();