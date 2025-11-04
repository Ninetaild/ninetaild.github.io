/* 난독화된 main.js 파일 (내비게이션 동적 로드 추가) */

// 1. 내비게이션 HTML (Base64 인코딩)
const N = atob(`PG5hdiBjbGFzcz0ibWFpbi1uYXYiPgogICAgICAgIDx1bCBjbGFzcz0ibmF2LWxpc3QiPgogICAgICAgICAgICAgIAogICAgICAgICAgICA8bGkgY2xhc3M9Im5hdi1pdGVtIj4KICAgICAgICAgICAgICAgIDxhIGhyZWY9IiMiIG9uY2xpY2s9InJldHVybiBmYWxzZTsiPuyCrOyekCDtmYTsmIHtg4E8L2E+CiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9ImRyb3Bkb3duLW1lbnUiPgogICAgICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPSJodHRwczovL3d3dy5zdXRvLmNvLmtyL2NwZXZlbnQ/bm93X2ZpbHRlcj02MjImY2F0MT1NMTR4WjReOV4xOF4xMV43XjE0XjEzXjE1XjE2XjEwXjImY2F0Mz1NVFF4WkU0Wl4xNTBeMTU2JnBtPTUwJmlzQWN0aXZlPTEiIHRhcmdldD0iX2JsYW5rIj7suJDsubTtlZjtlLjspLjsuKHtgpA8L2E+PC9saT4KICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj0iaHR0cHM6Ly9hcmNhLmxpdmUvYi9hcHB0ZWNoIiB0YXJnZXQ9Il9ibGFuayI+7JWI7LmY66as66yA7Jqw656A8L2E+PC9saT4KICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj0iaHR0cHM6Ly9nZW1pbmkuZ29vZ2xlLmNvbS8/aGw9a28iIHRhcmdldD0iX2JsYW5rIj7shLjsmIjsibTsi5jqs6A8L2E+PC9saT4KICAgICAgICAgICAgICAgICAgICA8bGk+PGEgaHJlZj0iaHR0cHM6Ly9uY25jLmFwcC8iIHRhcmdldD0iX2JsYW5rIj7rp7zri4jtjpnrspXrpqw8L2E+PC9saT4KICAgICAgICAgICAgICAgIDwvdWw+CiAgICAgICAgICAgIDwvbGk+CgogICAgICAgICAgICA8bGkgY2xhc3M9Im5hdi1pdGVtIiBpZD0idG9vbC1tZW51LWl0ZW0iPgogICAgICAgICAgICAgICAgPGEgaHJlZWY9IiMiIG9uY2xpY2s9InJldHVybiBmYWxzZTsiPuunpCDtgrM8L2E+CiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9ImRyb3Bkb3duLW1lbnUiPgogICAgICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPSIjIiBjbGFzcz0idG9vbC1saW5rIiBkYXRhLXVybD0iaHR0cHM6Ly9uaW5ldGFpbGQuZ2l0aHViLmlvL2NvZGUvcXIuaHRtbCIgZGF0YS10aXRsZT0iUVIg65Oc7LmY6rCc64yCIj5RSLuunpCDsmIjrsoAg7LCI64yIPC9hPjwvbGk+CiAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9IiMiIGNsYXNzPSJ0b29sLWxpbmsiIGRhdGEtdXJsPSJodHRwczovL25pbmV0YWlsZC5naXRodWIuaW8vY29kZS9hY2NvdW50Lmh0bWwiIGRhdGEtdGl0bGU9IuunpCDtmIjsibTsi5jqs6A+64u566as66CI7KeA64yI7J2A67OUPC9hPjwvbGk+CiAgICAgICAgICAgICAgICAgICAgPGxpPjxhIGhyZWY9IiMiIGNsYXNzPSJ0b29sLWxpbmsiIGRhdGEtdXJsPSJodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9zcHJlYWRzaGVldHMvZC9lLzJQQUNDWC0xdlEwVkFHX3NmNVFuaEtxS05jMVFDT1FROEtpLVdBX1NOOVpSX2pJZjhnR0huSldCanA5bEtuc2JtaUZuMXlQWEFhMUY3M1VoMWEzYmtNVC9wdWJodG1sP2dpZD0xOTY4MTUyMjEwJnNpbmdsZT10cnVlIiBkYXRhLXRpdGxlPSLslYzsmIHsoJXriZTsiLj43JWIg67CU7LGo66W865uI7LC96ri4PC9hPjwvbGk+CiAgICAgICAgICAgICAgICA8L3VsPgogICAgICAgICAgICA8L2xpPgogICAgICAgICAgICAKICAgICAgICAgICAgPGxpIGNsYXNzPSJuYXYtaXRlbSI+CiAgICAgICAgICAgICAgICA8YSBocmVmPSIjIiBpZD0icGF0Y2gtbm90ZXMtbGluayI+7ZmU7YSw7IaY7KCA64uZPC9hPgogICAgICAgICAgICA8L2xpPgogICAgICAgIDwvdWw+CiAgICA8L25hdj4=`);

// 2. 내비게이션을 삽입하고 이벤트 리스너를 다시 설정하는 함수
const iN = () => {
    const p = $('nav-placeholder');
    if (p) {
        p.outerHTML = N;
    }
    // 내비게이션 삽입 후, 난독화된 로직이 DOM을 다시 찾아서 이벤트 리스너를 설정해야 함
    aT(); // 아래에 정의된 툴 링크 초기화 함수 호출
};


// 3. 기존 난독화된 코드 (변수명 재설정 및 Base64 인코딩 유지)
const P = atob('aHR0cHM6Ly9uaW5ldGFpbGQuZ2l0aHViLmlvL2NvZGUvcGF0Y2gudHh0');
const $ = id => document.getElementById(id);
const S = selector => document.querySelectorAll(selector);

const M = {
    b: $('modal-backdrop'),
    p: {
        e: $('patch-notes-modal'),
        c: $('patch-notes-content'),
        l: $('patch-notes-link')
    },
    t: {
        e: $('tool-modal'),
        i: $('tool-modal-iframe'),
        d: $('tool-modal-title')
    }
};

let z = 2000;
let aM = null;

const uB = () => {
    const o = Array.from(S(atob('Lm1vZGFs'))).some(m => m.style.display === atob('ZmxleA=='));
    M.b.style.display = o ? atob('YmxvY2s=') : atob('bm9uZg==');
};

const fM = m => {
    z++;
    m.style.zIndex = z;
};

const gM = el => el.closest(atob('Lm1vZGFs'));

const oM = id => {
    const m = $(id);
    if (!m) return;
    
    m.style.display = atob('ZmxleA==');
    fM(m);
    uB();
};

const cM = id => {
    const m = $(id);
    if (!m) return;
    m.style.display = atob('bm9uZg==');
    if (id === atob('dG9vbC1tb2RhbA==')) M.t.i.src = atob('YWJvdXQ6Ymxhbms=');
    uB();
};

const lP = () => {
    if (M.p.c.dataset.loaded === atob('dHJ1ZQ==')) return;
    fetch(P)
        .then(r => r.ok ? r.text() : Promise.reject(new Error(atob('SFRUUCBlcnJvciEg') + r.status)))
        .then(data => {
            M.p.c.textContent = data;
            M.p.c.dataset.loaded = atob('dHJ1ZQ==');
        })
        .catch(e => M.p.c.textContent = atob('67CU66Gc6rCA7JWI65Oc7ZiIIDog') + e.message);
};

// 4. 툴 링크 이벤트 리스너 설정 함수 (내비게이션 동적 로드를 위해 재정의)
const aT = () => {
    // 패치 노트 링크 이벤트 리스너 재설정
    M.p.l.addEventListener(atob('Y2xpY2s='), e => {
        e.preventDefault(); 
        lP(); 
        oM(atob('cGF0Y2gtbm90ZXMtbW9kYWw='));
    });

    // 툴 링크 이벤트 리스너 재설정
    S(atob('LXRvb2wtbGluaw==')).forEach(l => {
        l.addEventListener(atob('Y2xpY2s='), e => {
            e.preventDefault();
            const { url, title } = e.currentTarget.dataset;
            if (url && title) {
                M.t.d.textContent = title;
                M.t.i.src = url;
                oM(atob('dG9vbC1tb2RhbA==')); 
                $(atob('dG9vbC1tZW51LWl0ZW0=')).blur();
            }
        });
    });
};

// 5. 모달 드래그/리사이즈 로직 (동일)
let d = false, r = false, sX, sY, sW, sH;

document.addEventListener(atob('bW91c2Vkb3du'), e => {
    const m = gM(e.target);
    if (m && m.style.display === atob('ZmxleA==')) fM(m);

    if (e.target.classList.contains(atob('bW9kYWwtaGVhZGVy'))) {
        aM = m;
        d = true;
        sX = e.clientX;
        sY = e.clientY;
        e.preventDefault();
        
    } else if (e.target.classList.contains(atob('bW9kYWwtcmVzaXplLWhhbmRsZQ=='))) {
        aM = m;
        r = true;
        sX = e.clientX;
        sY = e.clientY;
        sW = aM.offsetWidth;
        sH = aM.offsetHeight;
        e.preventDefault();
    }
});

document.addEventListener(atob('bW91c2Vtb3Zl'), e => {
    if (d && aM) {
        const dx = e.clientX - sX;
        const dy = e.clientY - sY;
        
        aM.style.left = (aM.offsetLeft + dx) + atob('cHg=');
        aM.style.top = (aM.offsetTop + dy) + atob('cHg=');
        
        sX = e.clientX;
        sY = e.clientY;
        
    } else if (r && aM) {
        const dx = e.clientX - sX;
        const dy = e.clientY - sY;
        
        const style = window.getComputedStyle(aM);
        const minW = parseInt(style.minWidth);
        const minH = parseInt(style.minHeight);
        
        const newW = Math.max(sW + dx, minW);
        const newH = Math.max(sH + dy, minH);

        aM.style.width = newW + atob('cHg=');
        aM.style.height = newH + atob('cHg=');
    }
});

document.addEventListener(atob('bW91c2V1cA=='), () => {
    d = false;
    r = false;
    aM = null;
});
    
M.b.addEventListener(atob('Y2xpY2s='), () => {
    let tM = null;
    let cM = -1;

    S(atob('Lm1vZGFs')).forEach(m => {
        if (m.style.display === atob('ZmxleA==')) {
            const z = parseInt(m.style.zIndex) || 2000;
            if (z > cM) {
                cM = z;
                tM = m;
            }
        }
    });
    
    if (tM) cM(tM.id);
});

// 페이지 로드 시 내비게이션 삽입 및 이벤트 설정
document.addEventListener('DOMContentLoaded', iN);
