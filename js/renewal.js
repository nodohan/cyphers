document.addEventListener('DOMContentLoaded', () => {
    // 1. 헤더 펼쳐지는 효과
    const header = document.querySelector('header');
    const nav = document.querySelector('header > nav');

    function headerActive() {
        header.classList.add('active');
    }
    function headerInactive() {
        header.classList.remove('active');
    }
    nav.addEventListener('mouseenter', headerActive);
    nav.addEventListener('mouseleave', headerInactive);

    // 2. 헤더 메뉴에 마우스 오버 시 하이라이트 효과
    const navList = document.querySelectorAll('header > nav > ul > li');

    function navListOn() {
        this.classList.add('on');
    }

    function navListOff() {
        this.classList.remove('on');
    }

    navList.forEach(item => {
        item.addEventListener('mouseenter', navListOn);
        item.addEventListener('mouseleave', navListOff);
    });

    // 3. 헤더 메뉴 클릭 시 물방울 이펙트
    const navListAll = document.querySelectorAll('header > nav > ul > li > ul > li > a');

    function navListClick(e) {
        const rect = this.getBoundingClientRect();
        const mouseX = e.clientX - rect.left; // 버튼 내부 X 좌표
        const mouseY = e.clientY - rect.top;  // 버튼 내부 Y 좌표
        this.style.setProperty('--x', `${mouseX}px`);
        this.style.setProperty('--y', `${mouseY}px`);
        this.style.setProperty('--animation', 'bubble 0.4s');
    }
    navListAll.forEach(item => {item.addEventListener('mousedown', navListClick);})

    // 4. 사이드메뉴 토글 (전적검색 - 가로 사용중)
    function sideNavToggle() {
        document.querySelector('.sideNav').classList.toggle('slim');
    }
});