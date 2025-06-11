document.addEventListener('DOMContentLoaded', () => {
    // 1. 헤더 펼쳐지는 효과
    const header = document.querySelector('header');
    const nav = document.querySelector('header > nav');

    let activateTimeout; // 타이머를 저장할 변수

    function headerActive() {
        activateTimeout = setTimeout(function () {
            header.classList.add('active');
        }, 200);
    }

    function headerInactive() {
        clearTimeout(activateTimeout); // 타이머 취소
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

    function setupDetailHistoryToggle() {
        const input = document.getElementById("nickNames");
        const history = document.getElementById("renewalDetailHistory");

        if (!input || !history) {
            console.warn("nickNames 또는 renewalDetailHistory 요소를 찾을 수 없습니다.");
            return;
        }

        // input 클릭 시 히스토리 토글
        input.addEventListener("click", (e) => {
            e.stopPropagation(); // 외부 클릭 이벤트 방지
            const isVisible = history.style.display === "block";
            history.style.display = isVisible ? "none" : "block";
        });

        // 내부 클릭 시 숨겨지지 않도록 방지
        history.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // 외부 클릭 시 닫기
        document.addEventListener("click", () => {
            history.style.display = "none";
        });
    }

    setupDetailHistoryToggle();

    function setupGameTypeToggle() {
        const $trigger = $("#gameTypeShow");
        const $target = $("#gameTypeSelect");

        // 토글 표시
        $trigger.on("click", function (e) {
            e.stopPropagation();
            $target.toggle();
        });

        // 외부 클릭 시 닫기
        $(document).on("click.gameTypeOutside", function (e) {
            if (!$(e.target).closest("#gameTypeSelect, #gameTypeShow").length) {
                $target.hide();
            }
        });

        // 선택 항목 클릭 시 텍스트 변경 및 닫기
        $target.on("click", ".game-type-option", function () {
            const selectedText = $(this).data("type");
            $trigger.text(selectedText + "전"); // "공식" → "공식전"
            $target.hide();
        });
    }

    setupGameTypeToggle();

    const button = document.getElementById('VOCButton');
    const vocBody = document.querySelector('.VOCBody');
    let isAnimating = false; // 애니메이션 상태 플래그

    function toggleVOC() {
        if (isAnimating) return; // 애니메이션 중이면 중단

        if (vocBody.classList.contains('show')) {
            isAnimating = true;
            vocBody.classList.remove('show');
            setTimeout(() => {
                vocBody.style.display = 'none';
                isAnimating = false;
            }, 300);
        } else {
            isAnimating = true;
            vocBody.style.display = 'block';
            setTimeout(() => {
                vocBody.classList.add('show');
                isAnimating = false;
            }, 10); // show 클래스 추가로 트리거 발생
        }
    }

    function closeVOCIfOutside(event) {
        if (
            !vocBody.contains(event.target) &&
            !button.contains(event.target) &&
            vocBody.classList.contains('show') &&
            !isAnimating
        ) {
            isAnimating = true;
            vocBody.classList.remove('show');
            setTimeout(() => {
                vocBody.style.display = 'none';
                isAnimating = false;
            }, 300);
        }
    }

    button.addEventListener('click', toggleVOC);
    document.addEventListener('click', closeVOCIfOutside);

    const submitBtn = document.querySelector(".VOCSubmit");

    submitBtn.addEventListener("click", function () {
        const title = document.getElementById("vocSubject").value.trim();
        const content = document.getElementById("vocContent").value.trim();
        const from = document.getElementById("vocEmail").value.trim();

        if (!title || !content || !from) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        // URL 인코딩을 안전하게 하기 위해 URLSearchParams 사용
        const params = new URLSearchParams({
            title,
            content,
            from
        });

        // 요청 보내기
        fetch(`/email/sendMail?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error("전송 실패");
                return res.text(); // 백엔드 응답이 JSON이면 .json()으로 변경
            })
            .then(data => {
                alert("문의가 성공적으로 전송되었습니다.");
                // 입력값 초기화
                document.getElementById("vocSubject").value = "";
                document.getElementById("vocContent").value = "";
                document.getElementById("vocEmail").value = "";
            })
            .catch(err => {
                console.error(err);
                alert("전송 중 오류가 발생했습니다.");
            });
    });
});