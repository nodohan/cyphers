//헤더 마우스 오버 시 펼쳐지는 효과
function  headerActive() {
    document.querySelector('header')
}
const nav = document.querySelector('header > nav');

nav.addEventListener('mouseenter', () => {
    headerActive(); // 활성화
});

nav.addEventListener('mouseleave', () => {
    headerInactive(); // 비활성화 (필요하면 추가)
});
//헤더 list 클릭 시 물방울 퍼지는 효과

