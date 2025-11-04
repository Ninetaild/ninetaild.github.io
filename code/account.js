/* eslint-disable */
var r = [];
let i = [];
let t = [];
let a = 0;
let s = 0;
const n = document.getElementById("sheetUrlInput");
const o = document.getElementById("startDate");
const l = document.getElementById("endDate");
const c = document.getElementById("statusMessage");
const d = document.getElementById("resultsContainer");
const u = document.getElementById("incomeContainer");
const p = document.getElementById("expenseContainer");
const m = document.getElementById("totalIncomeDisplay");
const h = document.getElementById("totalExpenseDisplay");
const g = document.getElementById("netAssetDisplay");
const E = document.getElementById("downloadExcelBtn");
const I = document.getElementById("errorMessage");
const f = (e) => new Intl.NumberFormat("ko-KR").format(Math.abs(e));
const S = (e) => {
    I.textContent = e;
    I.classList.remove("hidden");
    d.classList.add("hidden");
    E.disabled = true;
    c.classList.add("hidden");
};
const C = (e = "\uc720\uc54c\uc5d0\uc744 \uc785\ub825\ud558\uace0 \uae30\uac04\uc744 \uc124\uc815\ud574\uc8fc\uc138\uc694.") => {
    I.classList.add("hidden");
    c.textContent = e;
    c.classList.remove("hidden");
    d.classList.add("hidden");
    E.disabled = true;
};
const y = (e) => {
    const i = e.trim().split("\n");
    const t = [];
    const a = i.length > 0 && (i[0].includes("\ub0a0\uc9dc") || i[0].includes("Date")) ? i.slice(1) : i;
    for (const s of a) {
        let n = null;
        if (0 === s.trim().length) continue;
        if (s.includes("\t")) {
            n = s.split("\t");
        } else if (s.includes(";")) {
            n = s.split(";");
        } else if (s.includes(",")) {
            n = s.match(/(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]*))/g).map((e) => (e ? e.trim().replace(/^\"|\"$/g, "").replace(/""/g, '"') : ""));
        } else {
            continue;
        }
        n = n.filter((e) => e.length > 0);
        if (n.length < 3) continue;
        if (n && n.length >= 3) {
            const e = n[0].trim().replace(/"/g, "");
            const i = n[1].trim().replace(/"/g, "");
            let a = n[2].trim().replace(/"/g, "");
            let s = 1;
            if (a.includes("-") || (a.startsWith("(") && a.endsWith(")"))) {
                s = -1;
            }
            a = a.replace(/[^0-9.]/g, "");
            const o = new Date(e);
            const l = parseFloat(a) * s;
            if (!isNaN(o.getTime()) && !isNaN(l) && i) {
                t.push({ date: e, content: i, amount: l });
            } else {
                console.warn("Skipped invalid line or amount:", s);
            }
        }
    }
    return t;
};
const D = async () => {
    const e = n.value.trim();
    if (!e) {
        S("Google Sheets URL\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.");
        r = [];
        return;
    }
    C("Google Sheets\uc5d0\uc11c \ub370\uc774\ud130\ub97c \uac00\uc838\uc624\ub294 \uc911...");
    try {
        let i = e;
        const t = "https://corsproxy.io/?";
        const a = e.toLowerCase().includes("docs.google.com");
        if (a && !e.toLowerCase().startsWith(t.toLowerCase())) {
            i = t + e;
            C(`\ud504\ub85d\uc2dc\ub97c \ud1b5\ud574 \ub370\uc774\ud130\ub97c \uac00\uc838\uc624\ub294 \uc911... (${t} \uc790\ub3d9 \uc801\uc6a9)`);
        }
        let s = "";
        const o = i.toLowerCase();
        if (o.includes("output=csv")) {
            s = "csv";
        } else if (o.includes("output=xlsx") || o.includes("output=xls")) {
            s = "xlsx";
        } else {
            S("\uc720\ud6a8\ud558\uc9c0 \uc54a\uc740 URL \ud615\uc2dd\uc785\ub2c8\ub2e4. 'output=csv' \ub610\ub294 'output=xlsx' \ub9e4\uac1c\ubcc0\uc218\ub97c URL\uc5d0 \ud3ec\ud568\ud574\uc57c \ud569\ub2c8\ub2e4.");
            r = [];
            return;
        }
        let l = "";
        if ("csv" === s) {
            l = "csv";
        } else if ("xlsx" === s || "xls" === s) {
            l = "xlsx";
        } else {
            S("URL\uc5d0 'output=csv' \ub610\ub294 'output=xlsx' \ud03c\ub9ac \ub9e4\uac1c\ubcc0\uc218\uac00 \ud3ec\ud568\ub418\uc5b4\uc57c \ud569\ub2c8\ub2e4.");
            r = [];
            return;
        }
        const d = await fetch(i);
        if (!d.ok) {
            throw new Error(`HTTP \uc624\ub958: ${d.status} (Google Sheets\uc758 \uacf5\uc720 \uc124\uc815, URL \uc720\ud6a8\uc131 \ub610\ub294 \ub124\ud2b8\uc6cc\ud06c \ubb38\uc81c\uc77c \uc218 \uc788\uc74c)`);
        }
        let p = null;
        if ("csv" === l) {
            const e = await d.text();
            p = y(e);
        } else if ("xlsx" === l) {
            C("Excel \ub370\uc774\ud130\ub97c \uc77d\uace0 \ud30c\uc2f1 \uc911... (\uba54\uc778 \uc2dc\ud2b8)");
            const e = await d.arrayBuffer();
            const i = new Uint8Array(e);
            const t = XLSX.read(i, { type: "array" });
            const a = t.SheetNames[0];
            const s = XLSX.utils.sheet_to_csv(t.Sheets[a]);
            p = y(s);
        }
        r = p;
        if (0 === r.length) {
            S("\uc720\ud6a8\ud55c \ub370\uc774\ud130\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. (\ub0a0\uc9dc/\ub0b4\uc6a9/\uae08\uc561 \uc21c\uc11c \ubc0f \ub370\uc774\ud130 \ud615\uc2dd \ud655\uc778)");
            return;
        }
        localStorage.setItem("googleSheetsUrl", e);
        j();
    } catch (e) {
        S(`\ub370\uc774\ud130\ub97c \uac00\uc838\uc624\uac70\ub098 \ud30c\uc2f1\ud558\ub294 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4: ${e.message}.`);
        r = [];
        console.error("Sheet URL Fetch Error:", e);
    }
};
const j = () => {
    const e = o.value;
    const i = l.value;
    if (0 === r.length) {
        C("\uc5c5\ub85c\ub4dc/\uc785\ub825\ub41c \ub370\uc774\ud130\uac00 \ube44\uc5b4 \uc788\uac70\ub098 \uc720\ud6a8\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.");
        return;
    }
    if (!e || !i) {
        C("\uc2dc\uc791 \ub0a0\uc9dc\uc640 \uc885\ub8cc \ub0a0\uc9dc\ub97c \ubaa8\ub450 \uc124\uc815\ud574\uc8fc\uc138\uc694.");
        return;
    }
    const t = new Date(e);
    const a = new Date(i);
    if (isNaN(t.getTime()) || isNaN(a.getTime())) {
        S("\uc720\ud6a8\ud558\uc9c0 \uc54a\uc740 \ub0a0\uc9dc \ud615\uc2dd\uc785\ub2c8\ub2e4. (YYYY-MM-DD)");
        return;
    }
    t.setHours(0, 0, 0, 0);
    a.setHours(0, 0, 0, 0);
    if (t > a) {
        S("\uc2dc\uc791 \ub0a0\uc9b0 \uc885\ub8cc \ub0a0\uc9dc\ubcf4\ub2e4 \ube60\ub974\uac70\ub098 \uac19\uc544\uc57c \ud569\ub2c8\ub2e4.");
        return;
    }
    R(t, a);
};
const R = (e, n) => {
    const o = new Map();
    const l = new Map();
    a = 0;
    s = 0;
    let c = false;
    for (const d of r) {
        const r = new Date(d.date);
        r.setHours(0, 0, 0, 0);
        if (r >= e && r <= n) {
            c = true;
            const t = d.amount;
            const a = d.content;
            if (t > 0) {
                const e = o.get(a) || 0;
                o.set(a, e + t);
                s += t;
            } else if (t < 0) {
                const e = Math.abs(t);
                const r = l.get(a) || 0;
                l.set(a, r + e);
                a += e;
            }
        }
    }
    if (!c) {
        C("\uc120\ud0dd\ub41c \uae30\uac04 \ub0b4\uc5d0 \ud574\ub2f9\ud558\ub294 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.");
        i = [];
        t = [];
        return;
    }
    i = Array.from(o, ([e, i]) => {
        const t = 0 === s ? 0 : (i / s) * 100;
        return { content: e, amount: i, percentage: t.toFixed(2) };
    }).sort((e, i) => i.amount - e.amount);
    t = Array.from(l, ([e, i]) => {
        const r = 0 === a ? 0 : (i / a) * 100;
        return { content: e, amount: i, percentage: r.toFixed(2) };
    }).sort((e, i) => i.amount - e.amount);
    L();
};
const L = () => {
    u.innerHTML = "";
    p.innerHTML = "";
    const e = s - a;
    m.textContent = `\ucd1d \uc218\uc785: ${f(s)} \uc6d0`;
    h.textContent = `\ucd1d \uc18c\ube44: ${f(a)} \uc6d0`;
    g.textContent = `\uc21c\uc790\uc0b0: ${f(e)} \uc6d0 (${e >= 0 ? "\ud751\uc790" : "\uc801\uc790"})`;
    g.classList.toggle("text-green-700", e >= 0);
    g.classList.toggle("text-red-700", e < 0);
    if (i.length > 0) {
        i.forEach((e) => {
            const i = document.createElement("div");
            i.className = "flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white shadow-sm border-l-4 border-green-500";
            i.innerHTML = `\n\t\t\t\t\t\t <div class="flex items-baseline min-w-0 flex-1 pr-4">\n\t\t\t\t\t\t     <span class="text-base font-semibold text-gray-800 mr-4 whitespace-nowrap">${e.content}</span>\n\t\t\t\t\t\t     <span class="text-lg font-extrabold text-green-600 truncate">${f(e.amount)}</span>\n\t\t\t\t\t\t     <span class="text-gray-500 ml-1 text-xs whitespace-nowrap">\uc6d0</span>\n\t\t\t\t\t\t </div>\n\t\t\t\t\t\t <div class="text-right flex-shrink-0">\n\t\t\t\t\t\t     <span class="text-lg font-bold text-gray-700">${e.percentage}%</span>\n\t\t\t\t\t\t </div>\n\t\t\t\t\t `;
            u.appendChild(i);
        });
    } else {
        u.innerHTML = '<p class="text-gray-500 italic text-sm">\uae30\uac04 \ub0b4 \uc218\uc785 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>';
    }
    if (t.length > 0) {
        t.forEach((e) => {
            const i = document.createElement("div");
            i.className = "flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white shadow-sm border-l-4 border-red-500";
            i.innerHTML = `\n\t\t\t\t\t\t <div class="flex items-baseline min-w-0 flex-1 pr-4">\n\t\t\t\t\t\t     <span class="text-base font-semibold text-gray-800 mr-4 whitespace-nowrap">${e.content}</span>\n\t\t\t\t\t\t     <span class="text-lg font-extrabold text-red-600 truncate">${f(e.amount)}</span>\n\t\t\t\t\t\t     <span class="text-gray-500 ml-1 text-xs whitespace-nowrap">\uc6d0</span>\n\t\t\t\t\t\t </div>\n\t\t\t\t\t\t <div class="text-right flex-shrink-0">\n\t\t\t\t\t\t     <span class="text-lg font-bold text-gray-700">${e.percentage}%</span>\n\t\t\t\t\t\t </div>\n\t\t\t\t\t `;
            p.appendChild(i);
        });
    } else {
        p.innerHTML = '<p class="text-gray-500 italic text-sm">\uae30\uac04 \ub0b4 \uc18c\ube44 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>';
    }
    c.classList.add("hidden");
    d.classList.remove("hidden");
    I.classList.add("hidden");
    E.disabled = false;
};
const w = () => {
    if (0 === i.length && 0 === t.length) {
        S("\ub2e4\uc6b4\ub85c\ub4dc\ud560 \uc9d1\uacc4 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.");
        return;
    }
    const e = o.value;
    const n = l.value;
    const r = s - a;
    let c = `\n\t\t\t\t <html xmlns:o="urn:schemas-microsoft-com:office:office"\t\n\t\t\t\t       xmlns:x="urn:schemas-microsoft-com:office:excel"\t\n\t\t\t\t       xmlns="http://www.w3.org/TR/REC-html40">\n\t\t\t\t <head>\n\t\t\t\t     <meta charset="utf-8">\n\t\t\t\t     <style>\n\t\t\t\t         table { border-collapse: collapse; width: 100%; font-family: sans-serif; }\n\t\t\t\t         th, td { border: 1px solid #ccc; padding: 8px; }\n\t\t\t\t         th { background-color: #f2f2f2; font-weight: bold; text-align: center; }\n\t\t\t\t         .total-income { background-color: #d1fae5; font-weight: bold; } /* Green */\n\t\t\t\t         .total-expense { background-color: #fee2e2; font-weight: bold; } /* Red */\n\t\t\t\t         .net-asset { background-color: #e0f2fe; font-weight: bold; } /* Indigo/Blue */\n\t\t\t\t         .income-row { background-color: #f0fdf4; }\n\t\t\t\t         .expense-row { background-color: #fef2f2; }\n\t\t\t\t     </style>\n\t\t\t\t </head>\n\t\t\t\t <body>\n\t\t\t\t <table>\n\t\t\t\t     <thead>\n\t\t\t\t         <tr>\n\t\t\t\t             <th colspan="3" style="background-color: #e0f2fe; font-size: 1.2em;">\uae30\uac04\ubcc4 \uc218\uc785/\uc18c\ube44 \uc9d1\uacc4 \ubcf4\uace0\uc11c</th>\n\t\t\t\t         </tr>\n\t\t\t\t         <tr>\n\t\t\t\t             <td colspan="3">\uc9d1\uacc4 \uae30\uac04: ${e} ~ ${n}</td>\n\t\t\t\t         </tr>\n\t\t\t\t         <tr class="total-income">\n\t\t\t\t             <td colspan="2">\ucd1d \uc218\uc785 \ud569\uacc4</td>\n\t\t\t\t             <td style="text-align: right; mso-number-format:\\#\\,\\#\\#0">${f(s)} \uc6d0</td>\n\t\t\t\t         </tr>\n\t\t\t\t         <tr class="total-expense">\n\t\t\t\t             <td colspan="2">\ucd1d \uc18c\ube44 \ud569\uacc4</td>\n\t\t\t\t             <td style="text-align: right; mso-number-format:\\#\\,\\#\\#0">${f(a)} \uc6d0</td>\n\t\t\t\t         </tr>\n\t\t\t\t         <tr class="net-asset">\n\t\t\t\t             <td colspan="2">\uc21c\uc790\uc0b0 (\uc218\uc785 - \uc18c\ube44)</td>\n\t\t\t\t             <td style="text-align: right; mso-number-format:\\#\\,\\#\\#0">${f(r)} \uc6d0 (${r >= 0 ? "\ud751\uc790" : "\uc801\uc790"})</td>\n\t\t\t\t         </tr>\n\t\t\t\t     </thead>\n\t\t\t\t     <tbody>\n\t\t\t\t         <tr><td colspan="3" style="height: 15px; background-color: #fff;"></td></tr>\t\n\t\t\t\t         <tr>\n\t\t\t\t             <th colspan="3" style="background-color: #d1fae5;">\uc218\uc785 \uc138\ubd80 \ud56d\ubaa9</th>\n\t\t\t\t         </tr>\n\t\t\t\t         <tr>\n\t\t\t\t             <th>\ub0b4\uc6a9 (\ud56d\ubaa9)</th>\n\t\t\t\t             <th>\uae08\uc561 (\uc6d0)</th>\n\t\t\t\t             <th>\ube44\uc728 (%)</th>\n\t\t\t\t         </tr>\n\t\t\t\t `;
    i.forEach((e) => {
        c += `\n\t\t\t\t             <tr class="income-row">\n\t\t\t\t                 <td>${e.content}</td>\n\t\t\t\t                 <td style="text-align: right; mso-number-format:\\#\\,\\#\\#0">${e.amount}</td>\n\t\t\t\t                 <td style="text-align: right;">${e.percentage}%</td>\n\t\t\t\t             </tr>\n\t\t\t\t `;
    });
    c += `\n\t\t\t\t                 <tr><td colspan="3" style="height: 15px; background-color: #fff;"></td></tr>\n\t\t\t\t                 <tr>\n\t\t\t\t                     <th colspan="3" style="background-color: #fee2e2;">\uc18c\ube44 \uc138\ubd80 \ud56d\ubaa9</th>\n\t\t\t\t                 </tr>\n\t\t\t\t                 <tr>\n\t\t\t\t                     <th>\ub0b4\uc6a9 (\ud56d\ubaa9)</th>\n\t\t\t\t                     <th>\uae08\uc561 (\uc6d0)</th>\n\t\t\t\t                     <th>\ube44\uc728 (%)</th>\n\t\t\t\t                 </tr>\n\t\t\t\t `;
    t.forEach((e) => {
        c += `\n\t\t\t\t             <tr class="expense-row">\n\t\t\t\t                 <td>${e.content}</td>\n\t\t\t\t                 <td style="text-align: right; mso-number-format:\\#\\,\\#\\#0">${e.amount}</td>\n\t\t\t\t                 <td style="text-align: right;">${e.percentage}%</td>\n\t\t\t\t             </tr>\n\t\t\t\t `;
    });
    c += `\n\t\t\t\t             </tbody>\n\t\t\t\t         </table>\n\t\t\t\t         </body>\n\t\t\t\t         </html>\n\t\t\t\t `;
    const d = new Blob([c], { type: "application/vnd.ms-excel;charset=utf-8" });
    const u = document.createElement("a");
    u.href = URL.createObjectURL(d);
    u.download = `data_summary_${e}_to_${n}.xls`;
    document.body.appendChild(u);
    u.click();
    document.body.removeChild(u);
};
window.onload = () => {
    const e = localStorage.getItem("googleSheetsUrl");
    if (e) {
        n.value = e;
        C("\uc800\uc7a5\ub41c URL\uc774 \uc790\ub3d9\uc73c\ub85c \ucc44\uc6cc\uc84c\uc2b5\ub2c8\ub2e4. \uae30\uac04\uc744 \uc124\uc805\ud558\uace0 \"\ub370\uc774\ud130 \uac00\uc838\uc624\uae30\" \ubc84\ud2bc\uc744 \ub204\ub974\uc138\uc694.");
    } else {
        C();
    }
};
/* global XLSX */
/* exported handleSheetUrl, validateAndProcess, downloadExcel */
/* eslint-enable */
