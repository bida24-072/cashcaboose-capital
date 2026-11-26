/* =========================================================
   CashCaboose Capital — dual portal demo app
   All data persists in localStorage. No backend required.
   ========================================================= */
"use strict";

const KEY = "ccc_state_v1";
const fmt = n => "₦" + Number(n).toLocaleString("en-NG");
const today = () => new Date().toISOString().slice(0, 10);
const uid = p => p + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

/* ---------------- SEED DATA ---------------- */
function seed() {
  const d = off => { const t = new Date(); t.setDate(t.getDate() - off); return t.toISOString().slice(0, 10); };
  return {
    floats: { finance: 2500000, pay: 1200000, co: 900000 },
    floatSafe: { finance: 500000, pay: 300000, co: 250000 },
    customers: [
      { id: "C-ADA", name: "Adaeze Okafor", wallet: 48200 },
      { id: "C-BEL", name: "Bello Musa", wallet: 15750 },
      { id: "C-CHI", name: "Chinwe Eze", wallet: 63000 }
    ],
    loans: [
      { id: "LN-K7Q2", cust: "C-ADA", name: "Adaeze Okafor", amount: 30000, fee: 2400, term: 60, purpose: "Shop restock", status: "approved", date: d(40), repaid: 12400 },
      { id: "LN-M3P8", cust: "C-BEL", name: "Bello Musa", amount: 15000, fee: 1200, term: 30, purpose: "Phone repair", status: "pending", date: d(1), repaid: 0 }
    ],
    bills: [
      { id: "BL-88F1", cust: "C-ADA", name: "Adaeze Okafor", type: "Electricity", ref: "IKEDC · 0455 123 987", amount: 7200, status: "settled", date: d(6) },
      { id: "BL-2C4A", cust: "C-CHI", name: "Chinwe Eze", type: "Internet", ref: "Spectranet · 88-QW", amount: 12500, status: "settled", date: d(12) }
    ],
    orders: [
      { id: "OR-9TY5", cust: "C-ADA", name: "Adaeze Okafor", item: "Grocery bundle — weekly", total: 18500, paid: 9250, installments: 2, status: "approved", date: d(8) },
      { id: "OR-6W1D", cust: "C-BEL", name: "Bello Musa", item: "Fuel voucher — ₦10,000", total: 10000, paid: 0, installments: 4, status: "pending", date: d(0) }
    ],
    tickets: [
      { id: "TK-P2R6", cust: "C-CHI", name: "Chinwe Eze", topic: "Bill not reflecting", msg: "My internet renewal hasn't reflected since yesterday.", status: "open", date: d(1) }
    ],
    paylog: [
      { id: "PL-3H8K", cust: "C-ADA", name: "Adaeze Okafor", type: "repayment", amount: 12400, ref: "TRF-00931", date: d(9) }
    ],
    catalog: [
      { id: "P1", name: "Grocery bundle — weekly", price: 18500 },
      { id: "P2", name: "Fuel voucher — ₦10,000", price: 10000 },
      { id: "P3", name: "Household starter pack", price: 24500 },
      { id: "P4", name: "Water refill card", price: 3500 }
    ],
    currentCustomer: "C-ADA"
  };
}

let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); }
catch (e) { S = seed(); }
const save = () => localStorage.setItem(KEY, JSON.stringify(S));

/* ---------------- UI HELPERS ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}
function badge(st) { return `<span class="status ${st}">${st}</span>`; }
function feedItem(main, meta, right) {
  return `<div class="feed-item"><div><div>${main}</div><div class="meta">${meta}</div></div><div>${right}</div></div>`;
}

/* ---------------- VIEW SWITCHING ---------------- */
const views = ["landing", "portal", "customer", "manager"];
function show(view) {
  views.forEach(v => $("#view-" + v).classList.toggle("hidden", v !== view));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "landing") renderHero();
  if (view === "customer") renderCustomer();
  if (view === "manager") renderManager();
}
document.addEventListener("click", e => {
  const g = e.target.closest("[data-goto]"); if (g) show(g.dataset.goto);
  const lg = e.target.closest("[data-login]");
  if (lg) { show(lg.dataset.login === "manager" ? "manager" : "customer"); toast(lg.dataset.login === "manager" ? "Welcome back, Manager." : "Signed in as Adaeze Okafor"); }
  const lo = e.target.closest("[data-logout]"); if (lo) { show("portal"); }
  const tm = e.target.closest("[data-terms]"); if (tm) $("#terms-modal").classList.remove("hidden");
  const ct = e.target.closest("[data-close-terms]"); if (ct) $("#terms-modal").classList.add("hidden");
});
$("#terms-modal").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.classList.add("hidden"); });

/* ---------------- HERO ---------------- */
function renderHero() {
  const total = Object.values(S.floats).reduce((a, b) => a + b, 0);
  $("#hero-float").textContent = fmt(total);
  const colors = { finance: "#f5b301", pay: "#38bdf8", co: "#34d399" };
  $("#hero-arms").innerHTML = Object.entries(S.floats).map(([k, v]) => {
    const pct = Math.min(100, Math.round(v / (S.floatSafe[k] * 5) * 100));
    return `<div class="hc-arm"><b style="color:${colors[k]}">${k.toUpperCase()}</b><span class="amt">${fmt(v)}</span>
      <small>safe floor ${fmt(S.floatSafe[k])}</small><div class="bar"><i style="width:${pct}%;background:${colors[k]}"></i></div></div>`;
  }).join("");
}
/* count-up animation */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, target = +el.dataset.count, t0 = performance.now();
  const tick = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(target * p).toLocaleString(); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); io.unobserve(el);
}), { threshold: .6 });
$$("[data-count]").forEach(el => io.observe(el));

/* ---------------- TABS ---------------- */
function setupTabs(tabSelector, prefix, panels) {
  $$(tabSelector).forEach(btn => btn.addEventListener("click", () => {
    $$(tabSelector).forEach(b => b.classList.remove("active")); btn.classList.add("active");
    panels.forEach(p => $("#" + prefix + p).classList.add("hidden"));
    $("#" + prefix + btn.dataset[tabSelector === "#cust-tabs" ? "tab" : "mtab"]).classList.remove("hidden");
  }));
}
setupTabs("#cust-tabs", "tab-", ["overview", "finance", "pay", "co", "support"]);
setupTabs("#mgr-tabs", "mtab-", ["queue", "payments", "ledger", "tickets"]);

/* ---------------- CUSTOMER PORTAL ---------------- */
const me = () => S.customers.find(c => c.id === S.currentCustomer);

function renderCustomer() {
  const c = me();
  $("#cust-name").textContent = "Hello, " + c.name.split(" ")[0];
  const outLoan = S.loans.filter(l => l.cust === c.id && l.status === "approved").reduce((a, l) => a + l.amount + l.fee - l.repaid, 0);
  const orderBal = S.orders.filter(o => o.cust === c.id && o.status === "approved").reduce((a, o) => a + o.total - o.paid, 0);
  $("#cust-balances").innerHTML = [
    ["Wallet balance", fmt(c.wallet), "available to spend"],
    ["Active loan balance", fmt(outLoan), "across approved loans"],
    ["Co installment balance", fmt(orderBal), "BNPL outstanding"],
    ["Support tickets", S.tickets.filter(t => t.cust === c.id && t.status === "open").length, "currently open"]
  ].map(([s, b, sub]) => `<div class="bal-card"><small>${s}</small><b>${b}</b><span>${sub}</span></div>`).join("");

  /* overview */
  const acts = [
    ...S.loans.filter(l => l.cust === c.id).map(l => ["Loan " + l.id + " — " + l.purpose, l.date, fmt(l.amount), l.status]),
    ...S.bills.filter(b => b.cust === c.id).map(b => ["Bill · " + b.type, b.date, fmt(b.amount), b.status]),
    ...S.orders.filter(o => o.cust === c.id).map(o => ["Order · " + o.item, o.date, fmt(o.total), o.status])
  ].sort((a, b) => b[1].localeCompare(a[1]));
  $("#cust-activity").innerHTML = acts.length ? acts.map(a => feedItem(a[0], a[1], `<span class="amt">${a[2]}</span> ${badge(a[3])}`)).join("")
    : `<div class="empty">No activity yet — make your first request below.</div>`;
  const pend = [
    ...S.loans.filter(l => l.cust === c.id && l.status === "pending").map(l => ["Loan " + l.id, l.date + " · " + l.purpose, l.status]),
    ...S.orders.filter(o => o.cust === c.id && o.status === "pending").map(o => ["Order " + o.id, o.date + " · " + o.item, o.status]),
    ...S.tickets.filter(t => t.cust === c.id).map(t => ["Ticket " + t.id, t.date + " · " + t.topic, t.status])
  ];
  $("#cust-requests").innerHTML = pend.length ? pend.map(p => feedItem(p[0], p[1], badge(p[2]))).join("") : `<div class="empty">Nothing waiting on review. You're all caught up.</div>`;

  /* finance */
  $("#cust-loans").innerHTML = S.loans.filter(l => l.cust === c.id).length
    ? S.loans.filter(l => l.cust === c.id).map(l => {
        const owed = l.amount + l.fee, pct = Math.min(100, Math.round(l.repaid / owed * 100));
        return feedItem(`${l.id} · ${l.purpose}`, `${l.date} · ${l.term} days · repaid ${fmt(l.repaid)} / ${fmt(owed)}`,
          `<span class="amt">${fmt(l.amount)}</span> ${badge(l.status)}<div class="bar" style="width:80px"><i style="width:${pct}%;background:var(--gold)"></i></div>`);
      }).join("")
    : `<div class="empty">No loans yet. Request your first micro-loan.</div>`;
  previewLoan();

  /* pay */
  $("#cust-bills").innerHTML = S.bills.filter(b => b.cust === c.id).length
    ? S.bills.filter(b => b.cust === c.id).map(b => feedItem(`${b.type} · ${b.ref}`, b.date + " · receipt " + b.id, `<span class="amt">−${fmt(b.amount)}</span> ${badge(b.status)}`)).join("")
    : `<div class="empty">No bills settled yet.</div>`;

  /* co */
  $("#co-catalog").innerHTML = S.catalog.map(p => `
    <div class="cat-item"><div class="ci-top"><b>${p.name}</b><span class="amt">${fmt(p.price)}</span></div>
    <button class="btn btn-gold btn-sm" data-order="${p.id}">Order · pay in 4</button></div>`).join("");
  $("#cust-orders").innerHTML = S.orders.filter(o => o.cust === c.id).length
    ? S.orders.filter(o => o.cust === c.id).map(o => feedItem(`${o.item}`, `${o.date} · paid ${fmt(o.paid)} / ${fmt(o.total)} · ${o.installments} installments`,
        `<span class="amt">${fmt(o.total)}</span> ${badge(o.status)}`)).join("")
    : `<div class="empty">No orders yet.</div>`;

  /* support */
  $("#cust-tickets").innerHTML = S.tickets.filter(t => t.cust === c.id).length
    ? S.tickets.filter(t => t.cust === c.id).map(t => feedItem(`${t.topic} · ${t.id}`, t.date + " — “" + t.msg.slice(0, 60) + (t.msg.length > 60 ? "…" : "") + "”", badge(t.status))).join("")
    : `<div class="empty">No tickets. We're here if you need us.</div>`;
}

function previewLoan() {
  const amt = +$("#loan-amt").value || 0, fee = Math.round(amt * 0.08);
  $("#loan-preview").innerHTML = amt >= 5000
    ? `Service fee <b>${fmt(fee)}</b> (flat 8%) · total repayment <b>${fmt(amt + fee)}</b> over ${$("#loan-term").value} days — shown before you accept.`
    : "Minimum loan amount is ₦5,000.";
}
$("#loan-amt").addEventListener("input", previewLoan);
$("#loan-term").addEventListener("change", previewLoan);

$("#loan-form").addEventListener("submit", e => {
  e.preventDefault();
  const amt = +$("#loan-amt").value, c = me();
  if (amt < 5000 || amt > 150000) return toast("Loans must be between ₦5,000 and ₦150,000.");
  S.loans.unshift({ id: uid("LN"), cust: c.id, name: c.name, amount: amt, fee: Math.round(amt * 0.08),
    term: +$("#loan-term").value, purpose: $("#loan-purpose").value, status: "pending", date: today(), repaid: 0 });
  save(); renderCustomer(); toast("Loan submitted — a manager will review it shortly.");
  $("#loan-purpose").value = "";
});

$("#bill-form").addEventListener("submit", e => {
  e.preventDefault();
  const amt = +$("#bill-amt").value, c = me();
  if (amt > c.wallet) return toast("Wallet balance too low — top up or request support.");
  if (amt > S.floats.pay) return toast("Pay float can't cover this right now — try a smaller amount.");
  c.wallet -= amt; S.floats.pay -= amt;
  S.bills.unshift({ id: uid("BL"), cust: c.id, name: c.name, type: $("#bill-type").value, ref: $("#bill-ref").value, amount: amt, status: "settled", date: today() });
  S.paylog.unshift({ id: uid("PL"), cust: c.id, name: c.name, type: "billsettle", amount: amt, ref: $("#bill-ref").value, date: today() });
  save(); renderCustomer(); toast("Bill settled — receipt issued.");
  $("#bill-ref").value = "";
});

document.addEventListener("click", e => {
  const b = e.target.closest("[data-order]"); if (!b) return;
  const p = S.catalog.find(x => x.id === b.dataset.order), c = me();
  S.orders.unshift({ id: uid("OR"), cust: c.id, name: c.name, item: p.name, total: p.price, paid: 0, installments: 4, status: "pending", date: today() });
  save(); renderCustomer(); toast("Order placed — pending manager review.");
});

$("#support-form").addEventListener("submit", e => {
  e.preventDefault();
  const c = me();
  S.tickets.unshift({ id: uid("TK"), cust: c.id, name: c.name, topic: $("#sup-topic").value, msg: $("#sup-msg").value, status: "open", date: today() });
  save(); renderCustomer(); toast("Support ticket sent — we usually reply same day.");
  $("#sup-msg").value = "";
});

/* ---------------- MANAGER CONSOLE ---------------- */
function renderManager() {
  const colors = { finance: "#f5b301", pay: "#38bdf8", co: "#34d399" };
  $("#float-grid").innerHTML = Object.entries(S.floats).map(([k, v]) => {
    const low = v < S.floatSafe[k], pct = Math.max(4, Math.min(100, Math.round(v / (S.floatSafe[k] * 5) * 100)));
    return `<div class="float-card ${low ? "low" : ""}"><small>${k.toUpperCase()} float</small><b style="color:${colors[k]}">${fmt(v)}</b>
      <div class="safe">${low ? "⚠ BELOW safe floor of " + fmt(S.floatSafe[k]) + " — top up urgently" : "Safe floor " + fmt(S.floatSafe[k]) + " · healthy"}</div>
      <div class="bar"><i style="width:${pct}%;background:${low ? "var(--red)" : colors[k]}"></i></div>
      <button class="btn btn-outline btn-sm" style="margin-top:12px" data-topup="${k}">Top up +₦100,000</button></div>`;
  }).join("");

  /* queue */
  const q = [
    ...S.loans.filter(l => l.status === "pending").map(l => ({ kind: "loan", id: l.id, who: l.name, what: `Loan · ${l.purpose}`, amt: l.amount, date: l.date })),
    ...S.orders.filter(o => o.status === "pending").map(o => ({ kind: "order", id: o.id, who: o.name, what: "Order · " + o.item, amt: o.total, date: o.date }))
  ].sort((a, b) => a.date.localeCompare(b.date));
  $("#mgr-queue").innerHTML = q.length ? q.map(r => feedItem(`${r.what} · ${r.id}`, `${r.who} · ${r.date}`,
    `<span class="amt">${fmt(r.amt)}</span> <button class="btn btn-ok btn-sm" data-approve="${r.kind}:${r.id}">Approve</button> <button class="btn btn-danger btn-sm" data-reject="${r.kind}:${r.id}">Reject</button>`)).join("")
    : `<div class="empty">Queue is clear. Nice work.</div>`;

  /* payment form customers */
  $("#plog-cust").innerHTML = S.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  /* paylog */
  $("#mgr-paylog").innerHTML = S.paylog.length
    ? S.paylog.map(p => feedItem(`${{ repayment: "Loan repayment", topup: "Wallet top-up", orderpay: "Order installment", billsettle: "Bill settlement" }[p.type] || p.type} · ${p.id}`,
        `${p.name} · ${p.date}${p.ref ? " · " + p.ref : ""}`, `<span class="amt">+${fmt(p.amount)}</span>`)).join("")
    : `<div class="empty">No payments logged yet.</div>`;

  /* ledger */
  const entries = [
    ...S.loans.filter(l => l.status === "approved").map(l => [l.date, `Finance · disbursed loan ${l.id} → ${l.name}`, -l.amount, "finance"]),
    ...S.bills.map(b => [b.date, `Pay · settled ${b.type.toLowerCase()} ${b.id} for ${b.name}`, b.amount, "pay"]),
    ...S.paylog.map(p => [p.date, `Receipt · ${p.type} ${p.id} from ${p.name}`, p.amount, null])
  ].sort((a, b) => b[0].localeCompare(a[0]));
  $("#mgr-ledger").innerHTML = entries.length
    ? entries.map(([dt, txt, amt]) => feedItem(txt, dt, `<span class="amt" style="color:${amt < 0 ? "var(--red)" : "var(--green)"}">${amt < 0 ? "−" : "+"}${fmt(Math.abs(amt))}</span>`)).join("")
    : `<div class="empty">Ledger is empty.</div>`;

  /* tickets */
  $("#mgr-tickets").innerHTML = S.tickets.length
    ? S.tickets.map(t => feedItem(`${t.topic} · ${t.id} — “${t.msg.slice(0, 70)}${t.msg.length > 70 ? "…" : ""}”`, `${t.name} · ${t.date}`,
        t.status === "open" ? `<button class="btn btn-ok btn-sm" data-resolve="${t.id}">Resolve</button>` : badge(t.status))).join("")
    : `<div class="empty">No support tickets.</div>`;
}

document.addEventListener("click", e => {
  const ap = e.target.closest("[data-approve]");
  if (ap) {
    const [kind, id] = ap.dataset.approve.split(":");
    if (kind === "loan") {
      const l = S.loans.find(x => x.id === id);
      if (l.amount > S.floats.finance) return toast("Finance float too low to approve — top it up first.");
      S.floats.finance -= l.amount; l.status = "approved";
      const c = S.customers.find(x => x.id === l.cust); c.wallet += l.amount;
      toast(`Loan ${id} approved — ${fmt(l.amount)} disbursed to ${l.name}.`);
    } else {
      const o = S.orders.find(x => x.id === id);
      if (o.total > S.floats.co) return toast("Co float too low — top it up first.");
      S.floats.co -= o.total * 0.6; o.status = "approved";
      toast(`Order ${id} approved — essentials released for delivery.`);
    }
    save(); renderManager(); return;
  }
  const rj = e.target.closest("[data-reject]");
  if (rj) {
    const [kind, id] = rj.dataset.reject.split(":");
    (kind === "loan" ? S.loans : S.orders).find(x => x.id === id).status = "rejected";
    save(); renderManager(); toast(`${kind === "loan" ? "Loan" : "Order"} ${id} rejected — customer notified.`);
    return;
  }
  const rs = e.target.closest("[data-resolve]");
  if (rs) { S.tickets.find(t => t.id === rs.dataset.resolve).status = "resolved"; save(); renderManager(); toast("Ticket resolved."); return; }
  const tp = e.target.closest("[data-topup]");
  if (tp) { S.floats[tp.dataset.topup] += 100000; save(); renderManager(); toast(`${tp.dataset.topup.toUpperCase()} float topped up by ₦100,000.`); }
});

$("#paylog-form").addEventListener("submit", e => {
  e.preventDefault();
  const amt = +$("#plog-amt").value, cust = S.customers.find(c => c.id === $("#plog-cust").value), type = $("#plog-type").value;
  S.paylog.unshift({ id: uid("PL"), cust: cust.id, name: cust.name, type, amount: amt, ref: $("#plog-ref").value, date: today() });
  if (type === "topup") { cust.wallet += amt; S.floats.pay += amt * 0.5; }
  if (type === "repayment") {
    const loan = S.loans.find(l => l.cust === cust.id && l.status === "approved");
    if (loan) { loan.repaid = Math.min(loan.amount + loan.fee, loan.repaid + amt); S.floats.finance += amt; }
  }
  if (type === "orderpay") {
    const order = S.orders.find(o => o.cust === cust.id && o.status === "approved");
    if (order) { order.paid = Math.min(order.total, order.paid + amt); S.floats.co += amt; }
  }
  save(); renderManager(); toast(`Payment of ${fmt(amt)} logged for ${cust.name}.`);
  $("#plog-ref").value = ""; $("#plog-amt").value = "";
});

/* ---------------- BOOT ---------------- */
const hashView = location.hash.replace("#", "");
if (views.includes(hashView) && hashView !== "landing") show(hashView); else renderHero();
