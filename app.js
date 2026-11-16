/* Second Post: clickable concept build. Vanilla JS, no backend. All data is demo data. */
const A = 'assets/';
const ITEMS = {
  sweat:  { n: 'Crew sweatshirt', m: 'M • Chalk • £42.00', short: 'Crew sweatshirt, M', img: 'sweat.jpg', refund: '£46.95', refundNote: 'includes £4.95 delivery', credit: '£47.00', sized: true },
  poncho: { n: 'Fringed knit poncho', m: 'One size • Oat • £48.00', short: 'Fringed knit poncho', img: 'poncho.jpg', refund: '£48.00', refundNote: 'nothing deducted', credit: '£53.00', sized: false },
};
const REASONS = [
  ['small', "It's too small", "We'll show you the next size up"],
  ['big', "It's too big", "We'll show you the next size down"],
  ['pictured', "It's not as pictured", 'Colour, fabric or fit looked different'],
  ['faulty', "It's faulty or damaged", "Add a photo and we'll put it right"],
  ['mind', 'I changed my mind', 'No reason needed'],
];
const REASON_LABEL = { small: 'Too small', big: 'Too big', pictured: 'Not as pictured', faulty: 'Faulty or damaged', mind: 'Changed my mind' };
const POINTS = {
  po:     { logo: 'royalmail.png', meta: 'Royal Mail • 0.3 mi', n: 'Post Office, Rye Lane', st: ['ok', 'Open until 17:30'], carrier: 'Royal Mail', how: 'Show this at the counter', where: 'Post Office or postbox' },
  locker: { logo: 'inpost.png', meta: 'InPost • 0.4 mi • 24 hours', n: 'Locker, Peckham Library', st: ['warn', 'Medium lockers full right now'], carrier: 'InPost', how: 'Scan it at the locker', where: 'Locker, Peckham Library' },
  evri:   { logo: 'evri.png', meta: 'Evri • 0.5 mi', n: 'ParcelShop, Peckham Road', st: ['ok', 'Open until 22:00'], carrier: 'Evri', how: 'Show this at the till', where: 'ParcelShop, Peckham Road' },
  door:   { logo: 'royalmail.png', meta: 'Royal Mail • from your door', n: 'Doorstep collection', st: ['ok', 'Book a 2-hour slot, Mon to Sat'], carrier: 'Royal Mail' },
};
const STEPS = ['Your items', "Why it's going back", "What you'd like", "How you'll send it", 'Check and confirm'];
const STEP_OF = { order: 1, reason: 2, faulty: 2, offer: 3, size: 3, send: 4, collect: 4, check: 5 };

const fresh = () => ({ screen: 'start', hist: [], picked: ['sweat'], idx: 0, ans: {}, send: 'po', label: false, day: 'Tue 18', slot: '10am to 12pm', tab: 'postcode', tries: 0, err: false, loading: false, photos: 1, postcode: 'SE15 4QF', track: 'transit', modal: null, toast: null, demo: false, soldOut: false });
let S = fresh();
const cur = () => S.picked[S.idx];
const ans = (k) => (S.ans[k] = S.ans[k] || {});
const first = () => ans(S.picked[0]);

/* ---------- small pieces ---------- */
const ic = (n, fill) => `<i class="${fill ? 'ph-fill' : 'ph'} ph-${n}" aria-hidden="true"></i>`;
const banner = (t, a, b) => `<div class="banner ${t}">${ic({ info: 'info', ok: 'seal-check', warn: 'warning-circle', err: 'x-circle' }[t], true)}<div><b>${a}</b><span>${b}</span></div></div>`;
const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
const btn = (label, act, cls = '') => `<button class="btn ${cls}" data-act="${act}">${label}</button>`;
const link = (label, act) => `<button class="link" data-act="${act}">${label}</button>`;
const back = () => `<button class="back d-only" data-act="back">${ic('arrow-left')}Back</button>`;
const head = (e, t, b) => `${e ? `<p class="eyebrow">${e}</p>` : ''}<h1>${t}</h1>${b ? `<p class="lead">${b}</p>` : ''}`;
const helpCard = () => `<button class="hrow" data-act="go:help"><span class="ic">${ic('chat-circle')}</span><span class="t"><b>Need a hand?</b><small>Chat with Linden Row</small></span>${ic('caret-right')}</button>`;
const expl = (t, b, open) => `<details class="expl" ${open ? 'open' : ''}><summary>${t}${ic('caret-down')}</summary><p>${b}</p></details>`;
const obj = (f) => `<img class="obj" src="${A}${f}.png" alt="">`;

function sideCard() {
  const k = cur(), it = ITEMS[k], a = ans(k);
  const rows = [kv('Order', 'LR-20418'), kv('Return by', 'Thu 10 Dec')];
  if (a.reason) rows.push(kv('Reason', REASON_LABEL[a.reason]));
  if (a.offer) rows.push(kv('Getting', gettingText(k)));
  return `<aside class="side"><div class="card"><div class="irow"><img class="thumb" src="${A}${it.img}" alt=""><div><h3>${it.n}</h3><div class="meta">${it.m}</div></div></div>${rows.join('')}</div>${helpCard()}</aside>`;
}
function gettingText(k) {
  const a = ans(k), it = ITEMS[k];
  if (a.offer === 'exchange') return `Size ${a.size || 'L'}, held`;
  if (a.offer === 'replace') return 'Replacement';
  if (a.offer === 'credit') return `Store credit, ${it.credit}`;
  return `Refund, ${it.refund}`;
}
const flow = (main, side) => `<div class="cols"><div class="col">${back()}${main}</div>${side === false ? '' : (side || sideCard())}</div>`;
const centre = (html, cls = '') => `<div class="centre ${cls}">${html}</div>`;

/* ---------- screens ---------- */
const V = {
  start() {
    const locked = S.tries >= 3;
    const form = locked
      ? `${head('', 'Send something back', 'Returns and swaps are free for 28 days after delivery.')}<div class="gap24"></div>${banner('warn', 'Too many tries for now', 'For your security, wait 10 minutes and try again, or ask Linden Row to find it for you.')}<div class="acts">${btn('Ask Linden Row', 'go:help')}</div>`
      : `${S.expired ? banner('warn', 'That link has expired', "Saved answers last 24 hours. Find your order again and you'll start from your items.") + '<div class="gap24"></div>' : ''}
        ${head('', 'Send something back', 'Returns and swaps are free for 28 days after delivery. Find your order to start.')}
        <div class="gap24"></div>
        <div class="field ${S.err ? 'err' : ''}"><label for="ord">Order number</label><input id="ord" value="${S.ordVal ?? 'LR-20418'}" autocomplete="off">
          <div class="help">${S.err ? "We can't find that order with those details. Order numbers have 5 digits. Check your email and try again." : 'On your order email, starts with LR'}</div></div>
        <div class="gap16"></div>
        <div class="seg" role="tablist"><button class="${S.tab === 'email' ? 'on' : ''}" data-act="tab:email">Email</button><button class="${S.tab === 'postcode' ? 'on' : ''}" data-act="tab:postcode">Postcode</button></div>
        <div class="gap16"></div>
        ${S.tab === 'postcode'
          ? `<div class="field"><label for="pc">Postcode</label><input id="pc" value="SE15 4QF"><div class="help">The one the parcel was delivered to</div></div>`
          : `<div class="field"><label for="em">Email</label><input id="em" type="email" value="ada.okafor@example.com"><div class="help">The one you used at checkout</div></div>`}
        <div class="acts"><button class="btn" data-act="find" ${S.loading ? 'disabled style="background:var(--brand);color:#fff"' : ''}>${S.loading ? '<span class="spin"></span>Finding your order' : 'Find my order'}</button>${link("Can't find your order number?", 'go:orderhelp')}</div>
        <p class="meta muted" style="margin-top:24px">Demo: the details are filled in for you. Change the order number to see what happens when it isn't found.</p>`;
    return { ctx: '', title: 'Linden Row', noBack: true, html: `<div class="split"><div class="form">${form}</div><div class="promise"><img src="${A}exchange.png" alt=""><h2>Free returns and swaps for 28 days</h2>${['No printer needed. Show a code at a Post Office, locker or shop.', 'You see your refund date before you send anything.', 'Swapping sizes? We hold the new one while yours travels back.'].map(t => `<div class="note">${ic('seal-check', true)}<span>${t}</span></div>`).join('')}</div></div>` };
  },
  orderhelp() {
    const rows = [['envelope-simple', 'In your order email', 'Subject: Your order is confirmed'], ['receipt', 'On the packing slip', 'Printed top right, inside the parcel'], ['storefront', 'In your Linden Row account', 'Under Orders, if you made an account']];
    return { ctx: '', title: 'Linden Row', html: centre(`${head('', 'Where to find your order number', 'It starts with LR and has 5 digits, like LR-20418.')}<div class="gap24"></div><div class="list">${rows.map(r => `<div class="hrow"><span class="ic">${ic(r[0])}</span><span class="t"><b>${r[1]}</b><small>${r[2]}</small></span></div>`).join('')}</div><div class="acts v">${btn('Back to find my order', 'go:start')}${link('Ask Linden Row', 'go:help')}</div>`, 'wide') };
  },
  order() {
    const row = (k) => { const it = ITEMS[k], on = S.picked.includes(k); return `<button class="item ${on ? 'sel' : ''}" data-act="pick:${k}" aria-pressed="${on}"><span class="cb">${ic('check')}</span><img src="${A}${it.img}" alt=""><span class="t"><span class="n">${it.n}</span><div class="meta">${it.m}</div><div class="st">${ic('clock')}Return by Thu 10 Dec</div></span></button>`; };
    const n = S.picked.length;
    const main = `${head('Delivered Thu 12 Nov', "What's going back?", "Pick everything you're returning. One code covers them all.")}<div class="gap24"></div><div class="list">${row('sweat')}${row('poncho')}
      <button class="item" data-act="go:cantpost"><img src="${A}tee.jpg" alt=""><span class="t"><span class="n">Everyday tee, 3 pack</span><div class="meta">M • Grey • seal opened • £30.00</div><div class="st warn">${ic('warning-circle', true)}Can't go back by post</div></span>${ic('caret-right')}</button>
      <button class="item faded" data-act="demo:refunded"><img src="${A}shirt.jpg" alt=""><span class="t"><span class="n">Chambray shirt</span><div class="meta">L • Light blue • £55.00</div><div class="st ok">${ic('seal-check', true)}Refunded Sun 2 Nov</div></span>${ic('caret-right')}</button></div>
      <div class="acts"><button class="btn" data-act="orderNext" ${n ? '' : 'disabled'}>${n ? `Continue with ${n} item${n > 1 ? 's' : ''}` : 'Pick an item to continue'}</button></div>`;
    const side = `<aside class="side"><div class="card"><h3>Your order</h3>${kv('Order', 'LR-20418')}${kv('Delivered', 'Thu 12 Nov')}${kv('Free returns until', 'Thu 10 Dec')}${kv('Paid with', 'Visa ending 4417')}</div>${helpCard()}</aside>`;
    return { ctx: 'Order LR-20418', title: 'Order LR-20418', html: flow(main, side) };
  },
  reason() {
    const k = cur(), it = ITEMS[k], a = ans(k);
    const many = S.picked.length > 1;
    const main = `${head(it.m, 'Why is it going back?', 'This decides what we offer next. It never changes your refund.')}<div class="gap24"></div><div class="list" role="radiogroup">${REASONS.map(r => `<button class="rrow ${a.reason === r[0] ? 'on' : ''}" role="radio" aria-checked="${a.reason === r[0]}" data-act="reason:${r[0]}"><span class="radio"></span><span><div class="n">${r[1]}</div><div class="d">${r[2]}</div></span></button>`).join('')}</div>
      <div class="acts"><button class="btn" data-act="reasonNext" ${a.reason ? '' : 'disabled'}>Continue</button></div>`;
    return { ctx: it.n, title: it.n, stepNote: many ? `Item ${S.idx + 1} of ${S.picked.length}` : '', html: flow(main) };
  },
  faulty() {
    const it = ITEMS[cur()];
    const ph = Array.from({ length: S.photos }, () => `<img src="${A}${it.img}" alt="Your photo">`).join('');
    const main = `${head("It's faulty or damaged", "Show us what's wrong", "A clear photo gets it sorted faster. You won't need to send it back if we can see the fault.")}<div class="gap24"></div>
      <p class="meta" style="margin:0 0 8px">Photos</p><div class="upl">${ph}${S.photos < 3 ? `<button data-act="photo">${ic('camera')}Add photo</button>` : ''}</div><div class="gap24"></div>
      <div class="field"><label for="note">What's wrong</label><textarea id="note">Seam split under the left arm.</textarea><div class="help">Where is it and when did you notice?</div></div>
      <div class="acts">${btn('Continue', 'go:offer')}</div>`;
    return { ctx: it.n, title: it.n, html: flow(main) };
  },
  offer() {
    const k = cur(), it = ITEMS[k], a = ans(k);
    let opts, eyebrow, title;
    const size = a.reason === 'big' ? 'S' : 'L';
    if (a.reason === 'faulty') {
      eyebrow = 'Delivered 4 days ago'; title = "We'll put it right";
      opts = [['replace', 'exchange', 'Replacement', `A new one${it.sized ? ' in M' : ''}, sent as soon as yours is checked.`, it.sized ? 'Size M' : 'Same item', 'Free'], ['refund', 'refunded', 'Refund', 'Back to Visa ending 4417, delivery included.', it.refund, 'nothing deducted']];
      a.offer = a.offer && ['replace', 'refund'].includes(a.offer) ? a.offer : 'replace';
    } else if ((a.reason === 'small' || a.reason === 'big') && it.sized) {
      eyebrow = `${REASON_LABEL[a.reason]}, so here's what fits`; title = 'What would you like instead?';
      opts = [['exchange', 'exchange', 'Exchange', `Swap for size ${size}. We hold it now.`, `Size ${size}`, 'Held for you', 'Best fit for you'], ['credit', 'credit', 'Store credit', 'Spend it any time. Never expires.', it.credit, '£5 extra on top'], ['refund', 'refunded', 'Refund', 'Back to Visa ending 4417 by Tue 9 Dec at the latest.', it.refund, it.refundNote]];
      a.offer = a.offer && a.offer !== 'replace' ? a.offer : 'exchange'; a.size = a.size || size;
    } else {
      eyebrow = a.reason === 'mind' ? 'No reason needed' : REASON_LABEL[a.reason]; title = 'How would you like it back?';
      opts = [['credit', 'credit', 'Store credit', 'Spend it any time. Never expires.', it.credit, '£5 extra on top', '£5 extra'], ['refund', 'refunded', 'Refund', 'Back to Visa ending 4417 by Tue 9 Dec at the latest.', it.refund, it.refundNote]];
      if (it.sized) opts.push(['exchange', 'exchange', 'Exchange', 'Swap for another size.', 'Same price', 'Pick it next']);
      a.offer = a.offer && opts.some(o => o[0] === a.offer) ? a.offer : 'credit';
    }
    const cta = { exchange: a.reason === 'small' || a.reason === 'big' ? `Swap for size ${a.size || size}` : 'Pick a size', replace: 'Get a replacement', credit: `Take ${it.credit} store credit`, refund: `Refund ${it.refund}` }[a.offer];
    const main = `${back()}${head(eyebrow, title)}<div class="gap24"></div><div class="choices" role="radiogroup">${opts.map(o => `<button class="choice ${a.offer === o[0] ? 'on' : ''}" role="radio" aria-checked="${a.offer === o[0]}" data-act="offer:${o[0]}"><span class="top"><img src="${A}${o[1]}.png" alt=""><span class="r">${o[6] ? `<span class="chip">${ic('seal-check', true)}${o[6]}</span>` : ''}<span class="radio ${a.offer === o[0] ? 'on' : ''}"></span></span></span><h3>${o[2]}</h3><span class="d">${o[3]}</span><span class="v"><b>${o[4]}</b><span>•</span><span>${o[5]}</span></span></button>`).join('')}</div><div class="acts">${btn(cta, 'offerNext')}</div>`;
    return { ctx: it.n, title: it.n, html: main };
  },
  size() {
    const k = cur(), it = ITEMS[k], a = ans(k);
    const sizes = [['XS', 'Sold out', 'out'], ['S', 'In stock', ''], ['M', 'Yours now', 'cur'], ['L', 'In stock', ''], ['XL', '2 left', 'low']];
    const main = `${head('You had M • Chalk', S.soldOut ? 'XS has just sold out' : 'Pick your new size', S.soldOut ? 'Pick another size, or choose a refund or credit instead.' : 'We hold the size you pick while your parcel comes back.')}<div class="gap24"></div>
      <div class="item"><img src="${A}${it.img}" alt=""><span class="t"><span class="n">${it.n}</span><div class="meta">Chalk • brushed cotton • £42.00</div></span></div><div class="gap24"></div>
      <p class="meta" style="margin:0 0 8px">Size</p><div class="sizes" role="radiogroup">${sizes.map(s => `<button class="size ${s[2] === 'out' || s[2] === 'cur' ? s[2] : ''} ${a.size === s[0] ? 'on' : ''}" data-act="size:${s[0]}" ${s[2] === 'cur' ? 'disabled' : ''}>${s[0]}<small class="${s[2] === 'low' && a.size !== s[0] ? 'low' : ''}">${a.size === s[0] ? 'Held' : s[1]}</small></button>`).join('')}</div><div class="gap16"></div>
      ${S.soldOut ? `<label class="note"><input type="checkbox"> Email me if XS comes back</label>` : `<div class="note ok">${ic('seal-check', true)}Same price, nothing extra to pay</div><div class="gap8"></div><div class="note">${ic('clock')}Size ${a.size} is held for you until Thu 10 Dec</div>`}
      <div class="acts">${btn(`Hold size ${a.size}`, 'next')}${S.soldOut ? link('Choose refund or credit', 'go:offer') : ''}</div>`;
    return { ctx: it.n, title: it.n, html: flow(main) };
  },
  send() {
    const none = /^TR/i.test(S.postcode.trim());
    const pt = (k) => { const p = POINTS[k]; return `<button class="point ${S.send === k && !S.label ? 'on' : ''}" data-act="send:${k}"><img class="logo" src="${A}${p.logo}" alt="${p.carrier}"><span class="t"><div class="meta">${p.meta}</div><div class="n">${p.n}</div><div class="st ${p.st[0]}" style="display:flex;gap:6px;align-items:center;font-size:13px;color:var(--${p.st[0] === 'ok' ? 'success' : 'warning'})">${ic(p.st[0] === 'ok' ? 'seal-check' : 'warning-circle', true)}${p.st[1]}</div></span><span class="map"></span></button>`; };
    const cta = S.send === 'door' ? 'Book a doorstep collection' : `Use ${POINTS[S.send].n}`;
    const main = `${head('Free, no printer needed', 'Where will you drop it off?')}<div class="gap24"></div>
      <div class="search">${ic('magnifying-glass')}<input id="pcs" aria-label="Postcode" value="${S.postcode}" placeholder="Postcode"><button data-act="clearpc" aria-label="Clear">${ic('x')}</button></div><div class="gap16"></div>
      ${none ? `<div class="centre mid" style="margin-top:8px">${obj('pin')}<h3>No drop-off points within 2 miles of ${S.postcode.toUpperCase()}</h3><p class="lead" style="font-size:14px">Try a work postcode, or book a doorstep collection instead.</p></div><div class="acts">${btn('Book a doorstep collection', 'go:collect')}</div>`
        : `<div class="grid2">${['po', 'locker', 'evri', 'door'].map(pt).join('')}</div><div class="acts">${btn(cta, 'sendNext')}${link('Print a label instead', 'label')}</div><p class="meta muted" style="margin-top:20px">Demo: type a postcode starting with TR to see what happens when nothing is nearby.</p>`}`;
    return { ctx: 'Send it back', title: 'Send it back', html: flow(main) };
  },
  collect() {
    const days = [['Mon 17', 'Mon', '17'], ['Tue 18', 'Tue', '18'], ['Wed 19', 'Wed', '19'], ['Thu 20', 'Thu', '20'], ['Fri 21', 'Fri', '21']];
    const slots = [['8am to 10am', '2 slots left'], ['10am to 12pm', 'Most chosen'], ['12pm to 2pm', 'Open'], ['2pm to 4pm', 'Open']];
    const main = `${head('Royal Mail doorstep collection', 'When should we collect it?')}<div class="gap24"></div>
      <div class="field"><label for="addr">Collect from</label><input id="addr" value="24 Bellenden Road, SE15 4QF"><div class="help">From your order. Change it if you'll be elsewhere.</div></div><div class="gap24"></div>
      <p class="meta" style="margin:0 0 8px">Day</p><div class="days">${days.map(d => `<button class="size ${S.day === d[0] ? 'on' : ''}" data-act="day:${d[0]}">${d[2]}<small>${d[1]}</small></button>`).join('')}</div><div class="gap24"></div>
      <p class="meta" style="margin:0 0 8px">Time</p><div class="grid2" style="gap:8px">${slots.map(s => `<button class="rrow ${S.slot === s[0] ? 'on' : ''}" data-act="slot:${s[0]}"><span class="radio"></span><span><div class="n">${s[0]}</div><div class="d">${s[1]}</div></span></button>`).join('')}</div>
      <div class="acts">${btn(`Book ${S.day}, ${S.slot}`, 'collectNext')}${link('Drop it off instead', 'go:send')}</div>`;
    return { ctx: 'Send it back', title: 'Send it back', html: flow(main) };
  },
  check() {
    const cards = S.picked.map(k => { const it = ITEMS[k], a = ans(k); const g = a.offer === 'exchange' ? [`${it.n}, ${a.size}`, 'To pay', '£0.00'] : a.offer === 'replace' ? ['Replacement', 'To pay', '£0.00'] : a.offer === 'credit' ? ['Store credit', 'Amount', it.credit] : ['Refund to Visa 4417', 'Amount', it.refund];
      return `<div class="card" style="padding:4px 20px"><div class="pair"><div><small>Sending back</small><b><img class="ava" src="${A}${it.img}" alt="">${it.short}</b></div><div class="rt"><small>Reason</small><b>${REASON_LABEL[a.reason]}</b></div></div><div class="pair"><div><small>Getting</small><b>${g[0]}</b></div><div class="rt"><small>${g[1]}</small><b>${g[2]}</b></div></div></div>`; }).join('<div class="gap8"></div>');
    const p = POINTS[S.send]; const how = S.label ? `<div class="point"><span class="hrow" style="padding:0;background:none"><span class="ic">${ic('printer')}</span><span class="t"><b>Printed label</b><small>Postbox or Post Office, any time before Thu 20 Nov</small></span></span></div>` : S.send === 'door' ? `<div class="point"><img class="logo" src="${A}royalmail.png" alt="Royal Mail"><span class="t"><div class="meta">Royal Mail • doorstep collection</div><div class="n">${S.day} Nov, ${S.slot}</div><div class="meta">24 Bellenden Road, SE15 4QF</div></span></div>` : `<div class="point"><img class="logo" src="${A}${p.logo}" alt="${p.carrier}"><span class="t"><div class="meta">${p.meta}</div><div class="n">${p.n}</div></span><span class="map"></span></div>`;
    const f = first(); const nextLine = f.offer === 'exchange' || f.offer === 'replace' ? `Your ${f.offer === 'exchange' ? 'size ' + f.size : 'replacement'} ships the day we scan it in.` : f.offer === 'credit' ? 'Your credit code arrives the day we scan it in.' : 'Your refund starts the day we scan it in.';
    const lines = ['We email your code straight away.', S.send === 'door' && !S.label ? `Royal Mail collects it ${S.day} Nov.` : 'Drop it off by Thu 20 Nov.', nextLine];
    const main = `${head(S.picked.length > 1 ? `${S.picked.length} items, one code` : 'Nearly done', 'Check before you send')}<div class="gap24"></div>${cards}<div class="gap8"></div>${how}<div class="gap16"></div><div class="note ok">${ic('seal-check', true)}Postage back is free</div><div class="gap8"></div><div class="note">${ic('clock')}${f.offer === 'refund' ? 'Your refund lands by Tue 9 Dec at the latest.' : 'Nothing is deducted for trying it on.'}</div>
      <div class="acts">${btn(S.label ? 'Confirm and get my label' : S.send === 'door' ? 'Confirm and book' : 'Confirm and get my code', 'confirm')}${link('Change something', 'restart')}</div>`;
    const side = `<aside class="side"><div class="card"><h3>After you confirm</h3>${lines.map((l, i) => `<div class="note"><span class="mini" style="background:var(--tint);color:var(--ink);font-size:11px;font-weight:500">${i + 1}</span><span>${l}</span></div>`).join('')}</div>${helpCard()}</aside>`;
    return { ctx: 'Check your return', title: 'Check your return', html: flow(main, side) };
  },
  code() {
    const p = POINTS[S.send === 'door' ? 'po' : S.send]; const other = S.send === 'po' ? 'InPost' : 'Royal Mail';
    const tip = { po: ['Take this code with you', 'Send it to your phone or print this page. It scans from a screen or from paper.'], locker: ['Scan this at the locker screen', 'No scanner? Tap Send a parcel and type the 8 letters. A medium locker fits a folded sweatshirt.'], evri: ['Show this code at the till', 'The shop scans it and prints the label for you. Ask for a receipt.'] }[S.send] || [];
    return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', noBack: true, html: `<div class="duo"><div class="a">${head("Confirmed • we've emailed you a copy", 'Your return code')}<div class="gap24"></div><div class="card"><div class="code-head"><img class="logo" src="${A}${p.logo}" alt="${p.carrier}"><div><div class="meta">${p.carrier} • ${p.where}</div><h3>${p.how}</h3></div></div><div class="qr"><img src="${A}qr.png" alt="QR code for return 7HQ4-K2MP"></div>
      <div class="pair"><div><small>From</small><b><img class="ava" src="${A}ada.jpg" alt="">Ada Okafor</b></div><div class="rt"><small>Use by</small><b>Thu 20 Nov</b></div></div><div class="pair"><div><small>To</small><b>Linden Row</b></div><div class="rt"><small>Return</small><b>${S.picked.length} item${S.picked.length > 1 ? 's' : ''}</b></div></div>
      <div class="readout"><span class="meta">Code won't scan? Read this out</span><div class="ch">${'7HQ4K2MP'.split('').map(c => `<span>${c}</span>`).join('')}</div></div></div></div>
      <div class="b">${banner('info', tip[0], tip[1])}<div class="acts v">${btn('Send it to my phone', 'toast:Sent to the phone number on your order')}${link(`Switch to ${other}`, 'switch')}${link('Change or cancel this return', 'modal:cancel')}</div><p class="meta muted d-only" style="text-align:center">Demo: use the Demo menu, bottom left, to jump ahead to tracking.</p></div></div>` };
  },
  label() {
    return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', noBack: true, html: `<div class="duo"><div class="a">${head('For a postbox or a printer at home', 'Your return label')}<div class="gap24"></div><div class="labelp"><b>ROYAL MAIL TRACKED RETURNS 48</b><div class="bars"></div><b>RM 7HQ4 K2MP 4GB</b><hr style="border:0;border-top:1px solid var(--line);margin:12px 0">TO<br>Linden Row Returns<br>Unit 4, Copeland Yard<br>London SE15 3SN<br><br>FROM&nbsp; Ada Okafor, SE15 4QF<br>ITEMS ${S.picked.length} &nbsp;·&nbsp; USE BY THU 20 NOV</div></div>
      <div class="b">${banner('info', 'Print it on A4 and tape it on', 'Fold along the line and cover any old labels or barcodes on the bag.')}<div class="acts v">${btn('Download label (PDF)', 'toast:This is a concept, so there is no file to download')}${link('Show a code instead', 'useCode')}${link('Change or cancel this return', 'modal:cancel')}</div></div></div>` };
  },
  booked() {
    const f = first();
    return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', noBack: true, html: centre(`${obj('van')}${head("Booked • we've emailed you a copy", `We'll collect it ${S.day} Nov`)}<div class="gap24"></div><div class="card" style="padding:4px 20px;text-align:left"><div class="pair"><div><small>Collecting from</small><b>24 Bellenden Road</b></div><div class="rt"><small>Slot</small><b>${S.slot}</b></div></div><div class="pair"><div><small>Sending back</small><b>${ITEMS[S.picked[0]].short}${S.picked.length > 1 ? ' +1' : ''}</b></div><div class="rt"><small>Then</small><b>${gettingText(S.picked[0])}</b></div></div></div><div class="gap8"></div>${banner('info', 'Pack it and seal it', "Royal Mail brings the label, so you don't need a printer. Leave out any other items.")}<div class="acts v">${btn('Add to my calendar', 'toast:Added to your calendar')}${link('Change the slot', 'go:collect')}${link('Change or cancel this return', 'modal:cancel')}</div>`, 'mid') };
  },
  cancelled() {
    return { ctx: 'Order LR-20418', title: 'Order LR-20418', noBack: true, html: centre(`${head('Return 7HQ4-K2MP', 'Return cancelled', 'Your code no longer works and any size on hold is released. Nothing was sent back.')}<div class="gap24"></div>${banner('info', 'You can start again until Thu 10 Dec', "Cancelling doesn't shorten your 28 days.")}<div class="acts v">${btn('Start a new return', 'again')}</div>`) };
  },
  track() {
    const f = first(), last = f.offer === 'refund' ? ['Refund to Visa ending 4417', 'By Tue 9 Dec at the latest'] : f.offer === 'credit' ? ['Store credit code sent', 'The day we check your parcel'] : [`Your size ${f.size || 'L'} ships`, S.track === 'received' ? 'We email you the tracking' : 'The day we scan your parcel in'];
    const stamp = (a, b) => `<svg class="stamp" viewBox="0 0 150 90" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="45" cy="45" r="40"/><circle cx="45" cy="45" r="33" stroke-dasharray="2 3"/><text x="45" y="43" text-anchor="middle" font-size="8" font-family="IBM Plex Mono" stroke="none" fill="currentColor" letter-spacing="1.5">${a}</text><text x="45" y="56" text-anchor="middle" font-size="7" font-family="IBM Plex Mono" stroke="none" fill="currentColor" letter-spacing="1">${b}</text><path d="M88 34c6-5 10 5 16 0s10 5 16 0 10 5 16 0M88 45c6-5 10 5 16 0s10 5 16 0 10 5 16 0M88 56c6-5 10 5 16 0s10 5 16 0 10 5 16 0"/></svg>`;
    const done = (a, b) => `<li class="done"><span class="dot">${ic('seal-check', true)}</span><div><b>${a}</b><small>${b}</small></div></li>`;
    const todo = (a, b) => `<li class="todo"><span class="dot"></span><div><b>${a}</b><small>${b}</small></div></li>`;
    const rec = S.track === 'received';
    const list = rec
      ? `${done('Dropped off', 'Sun 16 Nov • Post Office, Rye Lane')}${done('In transit', 'Mon 17 Nov • Royal Mail')}<li class="now"><span class="dot"></span><div><b>Arrived, being checked</b><small>Wed 19 Nov • a person checks it by hand</small><small class="upd">${ic('info', true)}Updated 1 hour ago</small>${stamp('RECEIVED', '19 NOV')}</div></li>${todo('Checked', 'Usually within 1 working day')}${todo(last[0], last[1])}`
      : `${done('Return started', 'Sat 15 Nov • 14:20')}${done('Dropped off', 'Sun 16 Nov • 10:42 • Post Office, Rye Lane')}<li class="now"><span class="dot"></span><div><b>In transit</b><small>Royal Mail picked it up this morning</small><small class="upd">${ic('info', true)}Updated 2 minutes ago</small>${stamp('IN TRANSIT', '17 NOV')}</div></li>${todo('Arrives and is checked', 'Usually 2 to 3 days')}${todo(last[0], last[1])}`;
    return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', noBack: true, html: `<div class="duo"><div class="a t">${S.track === 'late' ? banner('warn', 'Royal Mail is running a day late', "Your dates don't move. Nothing for you to do.") + '<div class="gap8"></div>' : ''}<div class="card"><p class="eyebrow">Return 7HQ4-K2MP</p><h2>${rec ? 'Linden Row has your parcel' : 'Your parcel is on its way back'}</h2><ol class="tl">${list}</ol></div></div>
      <div class="b"><div class="card" style="padding:4px 20px"><div class="pair"><div><small>Dropped off at</small><b>Post Office, Rye Lane</b></div><div class="rt"><small>Receipt</small><b>Saved</b></div></div><div class="pair"><div><small>Getting</small><b>${gettingText(S.picked[0])}</b></div><div class="rt"><small>When</small><b>${rec ? 'After the check' : 'When we scan it in'}</b></div></div></div><div class="acts v">${btn(rec ? 'Demo: see the outcome' : 'Demo: move to received', rec ? 'go:outcome' : 'track:received', 'grey')}${link('Need help with this return?', 'go:help')}</div></div></div>` };
  },
  outcome() {
    const k = S.picked[0], it = ITEMS[k], f = first();
    let h;
    if (f.offer === 'credit') h = `${obj('credit')}<p class="eyebrow">Store credit ready</p><div class="hero-fig">${it.credit}</div><p class="lead" style="font-size:14px">${it.credit === '£47.00' ? '£42.00 for the sweatshirt + £5 bonus' : '£48.00 for the poncho + £5 bonus'}. Never expires.</p><div class="gap24"></div><div class="codebox"><div><div class="meta">Your code</div><div class="mono">LINDEN-7HQ4</div></div><button class="copy" data-act="toast:Code copied. Paste it at checkout.">Copy</button></div><div class="gap16"></div><div class="note ok" style="justify-content:center">${ic('seal-check', true)}Applied at checkout on lindenrow.co.uk</div><div class="acts v">${btn('Shop Linden Row', 'modal:shop')}${link('Return something else', 'again')}</div>`;
    else if (f.offer === 'refund') h = `${obj('refunded')}<p class="eyebrow">Refunded Mon 1 Dec</p><div class="hero-fig">${it.refund}</div><p class="lead" style="font-size:14px">Banks take 3 to 5 working days to show it.</p><div class="gap24"></div><div class="card" style="padding:4px 20px;text-align:left"><div class="pair"><div><small>Sent back</small><b><img class="ava" src="${A}${it.img}" alt="">${it.short}</b></div><div class="rt"><small>Reason</small><b>${REASON_LABEL[f.reason]}</b></div></div><div class="pair"><div><small>Refund to</small><b>Visa ending 4417</b></div><div class="rt"><small>Amount</small><b>${it.refund}</b></div></div></div><div class="acts v">${btn('Shop Linden Row', 'modal:shop')}${link('Return something else', 'again')}</div>`;
    else h = `${obj('exchange')}<p class="eyebrow">Shipped Fri 21 Nov</p><div class="hero-fig">${f.offer === 'replace' ? 'On its way' : 'Size ' + (f.size || 'L')}</div><p class="lead" style="font-size:14px">Royal Mail Tracked 48. Arrives by Mon 24 Nov.</p><div class="gap24"></div><div class="card" style="padding:4px 20px;text-align:left"><div class="pair"><div><small>Sent back</small><b><img class="ava" src="${A}${it.img}" alt="">${it.short}</b></div><div class="rt"><small>Reason</small><b>${REASON_LABEL[f.reason]}</b></div></div><div class="pair"><div><small>Sending you</small><b>${it.n}${f.offer === 'replace' ? '' : ', ' + (f.size || 'L')}</b></div><div class="rt"><small>Arrives</small><b>Mon 24 Nov</b></div></div></div><div class="acts v">${btn('Track my parcel', 'toast:This would open Royal Mail tracking')}${link('Return something else', 'again')}</div>`;
    return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', noBack: true, html: centre(h, 'mid') };
  },
  refundedOld() {
    return { ctx: 'Order LR-20418', title: 'Order LR-20418', html: centre(`${obj('refunded')}<p class="eyebrow">Refunded Sun 2 Nov</p><div class="hero-fig">£55.00</div><p class="lead" style="font-size:14px">Chambray shirt, L. Back to Visa ending 4417.</p><div class="acts v">${btn('Back to my order', 'back')}</div>`, 'mid') };
  },
  part() {
    return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', noBack: true, html: centre(`${head('Checked Fri 21 Nov', "One item came back fine, one didn't")}<div class="gap24"></div><div class="list"><div class="item faded"><img src="${A}sweat.jpg" alt=""><span class="t"><span class="n">Crew sweatshirt</span><div class="meta">M • Chalk • £42.00</div><div class="st ok">${ic('seal-check', true)}Accepted • £42.00 on its way</div></span></div><div class="item"><img src="${A}poncho.jpg" alt=""><span class="t"><span class="n">Fringed knit poncho</span><div class="meta">One size • Oat • £48.00</div><div class="st bad">${ic('x-circle', true)}Not accepted, worn and tags removed</div></span></div>${expl('Why this happened', 'The poncho came back worn, with the tags removed, so Linden Row can only take back items in the condition they were sent. The photos from the check sit with this item. If you think this is wrong, ask them to look again and a person will reply within 2 working days.', true)}</div><div class="acts v">${btn('Ask them to look again', 'go:message')}${link('Send the poncho back to me', 'go:sentback')}</div>`, 'wide') };
  },
  sentback() { return { ctx: 'Return 7HQ4-K2MP', title: 'Return 7HQ4-K2MP', html: centre(`${head('Fringed knit poncho', "It's on its way back to you", "Linden Row is posting the poncho to 24 Bellenden Road, SE15 4QF. You don't pay postage.")}<div class="gap24"></div>${banner('ok', 'Arrives by Wed 26 Nov', "Royal Mail Tracked 48. We'll email you the tracking link.")}<div class="acts v">${btn('Back to my return', 'back')}</div>`) }; },
  windowpassed() { return { ctx: 'Order LR-19907', title: 'Order LR-19907', noBack: true, html: centre(`${obj('window')}${head('Delivered Thu 9 Oct', 'The 28 days have passed', "The free return window for this order closed on Thu 6 Nov. If something is faulty, you're still covered.")}<div class="gap24"></div>${S.goodwill ? banner('ok', 'Linden Row can still give store credit', '£42.00 for the crew sweatshirt, to spend any time. A goodwill offer from the brand, not a refund.') + '<div class="gap8"></div>' : ''}${expl('When faulty items are still covered', 'For 6 months after delivery, a fault is assumed to have been there from the start. Linden Row will repair or replace it, and refund you if that is not possible.')}<div class="acts v">${S.goodwill ? btn('Take £42.00 store credit', 'goodwill') : ''}${S.goodwill ? link("It's faulty, report it", 'faultyRoute') : btn("It's faulty, report it", 'faultyRoute')}${link('Contact Linden Row', 'go:help')}</div>`, 'mid') }; },
  cantpost() { return { ctx: 'Order LR-20418', title: 'Order LR-20418', html: centre(`${head('Everyday tee, 3 pack', "This one can't go back by post", "Multipack tees are sealed for hygiene, so once opened they can't be returned for a change of mind.")}<div class="gap24"></div><div class="item"><img src="${A}tee.jpg" alt=""><span class="t"><span class="n">Everyday tee, 3 pack</span><div class="meta">M • Grey • seal opened • £30.00</div><div class="st warn">${ic('warning-circle', true)}Can't go back by post</div></span></div><div class="gap8"></div>${expl("Your rights if it's faulty", "If it's faulty, you can still get a replacement or a refund, sealed or not. Tell us what's wrong and add a photo, and Linden Row will sort it within 2 working days.", true)}<div class="acts v">${btn("It's faulty, report it", 'go:message')}${link('Back to my order', 'back')}</div>`, 'wide') }; },
  notdelivered() { return { ctx: 'Order LR-20431', title: 'Order LR-20431', noBack: true, html: centre(`${obj('van')}${head('Out for delivery today', "It hasn't reached you yet", 'Returns open as soon as Royal Mail marks it delivered. Your 28 days start from that day.')}<div class="acts v">${btn('Track my delivery', 'toast:This would open Royal Mail tracking')}</div>`, 'mid') }; },
  help() { const rows = [['chat-circle', 'Chat with Linden Row', 'Usually replies within 2 hours', 'toast:Chat would open here in the real product'], ['envelope-simple', 'Email Linden Row', 'Replies within 1 working day', 'go:message'], ['question', 'Questions about returns', 'Codes, drop-off, refunds, timings', 'go:faq']];
    return { ctx: 'Help', title: 'Help', html: centre(`${head('We send your order details with your message', 'How can we help?', "So you don't have to repeat yourself.")}<div class="gap24"></div><div class="list">${rows.map(r => `<button class="hrow" data-act="${r[3]}"><span class="ic">${ic(r[0])}</span><span class="t"><b>${r[1]}</b><small>${r[2]}</small></span>${ic('caret-right')}</button>`).join('')}</div><div class="acts v">${link('Back', 'back')}</div>`, 'wide') }; },
  message() { return { ctx: 'Help', title: 'Help', html: centre(`${head('', 'Email Linden Row', "Your order and return details go with your message, so you don't have to explain them.")}<div class="gap24"></div>${banner('info', 'Attached to your message', 'Order LR-20418 and everything you have picked in this return.')}<div class="gap16"></div><div class="field"><label for="msg">Your message</label><textarea id="msg" placeholder="What do you need help with?"></textarea><div class="help">Up to 1,000 characters</div></div><div class="acts v">${btn('Send to Linden Row', 'go:sent')}${link('Back to help', 'back')}</div>`, 'wide') }; },
  sent() { return { ctx: 'Help', title: 'Help', noBack: true, html: centre(`${head('', 'Message sent', "Linden Row replies within 1 working day, to the email on your order. You don't need to send it again.")}<div class="gap24"></div>${banner('ok', 'Sent just now', 'Your return keeps going while you wait. Your code still works.')}<div class="acts v">${btn('Done', 'backHome')}</div>`) }; },
  faq() { const q = [['How long does a refund take?', 'Linden Row refunds within 2 working days of checking your parcel. Banks then take 3 to 5 working days to show it.'], ['Can I drop it off somewhere else?', 'Yes. Open your return code and switch carrier. The code changes, the dates do not.'], ["What if my code won't scan?", 'Read out the 8 letters under the QR code. Staff can type them in.'], ['Can I send back part of an order?', 'Yes. Pick only the items you are returning. One code covers them all.'], ['What if I miss the use-by date?', 'The code expires and any size on hold is released. You can start again inside your 28 days.']];
    return { ctx: 'Help', title: 'Help', html: centre(`${head('Help', 'Questions about returns', "Short answers. If yours isn't here, message Linden Row.")}<div class="gap24"></div><div class="list">${q.map((x, i) => expl(x[0], x[1], i === 0)).join('')}</div><div class="acts v">${link('Back to help', 'back')}</div>`, 'wide') }; },
  error() { return { ctx: '', title: 'Linden Row', noBack: true, html: centre(`${head('Your answers are saved', "That didn't load", "We couldn't reach Linden Row just now. Nothing has been sent or cancelled.")}<div class="gap24"></div>${banner('err', 'Try again in a moment', 'If it keeps happening, check your connection or come back from your order email.')}<div class="acts v">${btn('Try again', 'backHome')}</div>`) }; },
};

/* ---------- shell ---------- */
function render() {
  const v = V[S.screen](); const step = STEP_OF[S.screen] || 0;
  const stepper = step ? `<nav class="steps" aria-label="Progress">${STEPS.map((s, i) => `<span class="st ${i + 1 < step ? 'done' : i + 1 === step ? 'now' : ''}" ${i + 1 === step ? 'aria-current="step"' : ''}><span class="b">${i + 1 < step ? ic('check') : i + 1}</span>${s}</span>${i < 4 ? `<span class="ln ${i + 1 < step ? 'done' : ''}"></span>` : ''}`).join('')}</nav><div class="mstep"><p>Step ${step} of 5 • ${v.stepNote || STEPS[step - 1]}</p><div class="bar">${STEPS.map((_, i) => `<span class="${i < step ? 'on' : ''}"></span>`).join('')}</div></div>` : '';
  const modal = S.modal ? { cancel: ['Cancel this return?', 'Your code stops working and any size on hold is released. You can start again any time before Thu 10 Dec.', btn('Keep my return', 'close', 'grey') + btn('Cancel this return', 'doCancel', 'red')], leave: ['Leave your return?', "We'll keep your answers for 24 hours. Open the link in your order email and you'll pick up at this step. Nothing has been sent back yet.", btn('Leave for now', 'doLeave', 'grey') + btn('Stay and finish', 'close')], shop: ['This is where the shop begins', 'Linden Row is a demo brand, so there is no shop behind this button. In the real product you would land on lindenrow.co.uk.', btn('Start over', 'doLeave', 'grey') + btn('Stay here', 'close')] }[S.modal] : null;
  const jumps = [['Start', [['Start a return', 'reset'], ['Link expired', 'demo:expired'], ['Not delivered yet', 'demo:notdelivered'], ["Couldn't load", 'demo:error']]], ['After sending', [['Tracking: in transit', 'demo:transit'], ['Tracking: running late', 'demo:late'], ['Tracking: received', 'demo:received'], ['Outcome', 'demo:outcome'], ['Part accepted', 'demo:part']]], ['Edge cases', [['Window has passed', 'demo:window'], ['Goodwill credit', 'demo:goodwill'], ["Can't go back by post", 'demo:cantpost'], ['Size sold out', 'demo:soldout']]]];
  document.getElementById('app').innerHTML = `
    <header class="hdr">
      <button class="circle m-only" data-act="back" aria-label="Back" style="${v.noBack || !S.hist.length ? 'visibility:hidden' : ''}">${ic('arrow-left')}</button>
      <div class="brand d-only"><span class="lrlogo" aria-label="Linden Row"><span>LINDEN ROW</span><i></i><small>LONDON</small></span><span class="ctx">•&nbsp; Returns${v.ctx ? ' &nbsp;•&nbsp; ' + v.ctx : ''}</span></div>
      <div class="m-title m-only" style="display:none">${v.title}</div>
      <div class="links d-only"><button class="pill" data-act="shop">${ic('storefront')}Back to the shop</button><button class="pill" data-act="go:help">${ic('question')}Help</button></div>
      <button class="circle m-only" data-act="go:help" aria-label="Help">${ic('question')}</button>
    </header>
    <div class="demo"><button data-act="demoToggle" aria-expanded="${S.demo}">${ic('compass')}Demo menu</button>${S.demo ? `<div class="menu">${jumps.map(g => `<p>${g[0]}</p>${g[1].map(j => `<button data-act="${j[1]}">${j[0]}</button>`).join('')}`).join('')}</div>` : ''}</div>${stepper}
    <main>${v.html}</main>
    <p class="foot"><span class="pb">Returns by <svg width="16" height="16" viewBox="0 0 56 56" aria-hidden="true"><rect width="56" height="56" rx="16" fill="#191919"/><path d="M22 20H33C38.5 20 42 24 42 29C42 34 38.5 38 33 38H17M27 14L21 20L27 26" stroke="#c8a97a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg><b>second post</b></span><span class="concept">Concept project</span></p>
    ${modal ? `<div class="dim" data-act="close"><div class="dialog" role="dialog" aria-modal="true" aria-label="${modal[0]}"><h2>${modal[0]}</h2><p>${modal[1]}</p><div class="row">${modal[2]}</div></div></div>` : ''}
    ${S.toast ? `<div class="toast" role="status">${S.toast}</div>` : ''}`;
  const mt = document.querySelector('.m-title'); if (mt) mt.style.display = '';
}
function go(name, keep) { if (!keep) S.hist.push(S.screen); S.screen = name; S.demo = false; S.modal = null; render(); window.scrollTo(0, 0); }
function toast(t) { S.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = null; render(); }, 2400); }
const seedStory = () => { S.picked = S.picked.length ? S.picked : ['sweat']; const f = first(); f.reason = f.reason || 'small'; f.offer = f.offer || 'exchange'; f.size = f.size || 'L'; };

const ACT = {
  go: (n) => go(n),
  back: () => { if (S.hist.length) { S.screen = S.hist.pop(); S.demo = false; render(); window.scrollTo(0, 0); } },
  backHome: () => { const h = S.hist.filter(x => !['help', 'message', 'sent', 'faq', 'error'].includes(x)); S.hist = h; S.screen = h.pop() || 'start'; render(); },
  tab: (t) => { S.tab = t; render(); },
  find: () => { const val = (document.getElementById('ord').value || '').trim().toUpperCase(); S.ordVal = val; if (val !== 'LR-20418') { S.tries++; S.err = true; render(); return; } S.err = false; S.loading = true; render(); setTimeout(() => { S.loading = false; S.expired = false; go('order'); }, 1100); },
  pick: (k) => { S.picked = S.picked.includes(k) ? S.picked.filter(x => x !== k) : ['sweat', 'poncho'].filter(x => x === k || S.picked.includes(x)); render(); },
  orderNext: () => { S.idx = 0; go('reason'); },
  reason: (r) => { ans(cur()).reason = r; ans(cur()).offer = null; render(); },
  reasonNext: () => go(ans(cur()).reason === 'faulty' ? 'faulty' : 'offer'),
  photo: () => { S.photos++; render(); },
  offer: (o) => { ans(cur()).offer = o; render(); },
  offerNext: () => { const a = ans(cur()); if (a.offer === 'exchange') { a.size = a.size || 'L'; S.soldOut = false; go('size'); } else ACT.next(); },
  size: (s) => { if (s === 'XS') { S.soldOut = true; } else { S.soldOut = false; ans(cur()).size = s; } render(); },
  next: () => { if (S.idx < S.picked.length - 1) { S.idx++; go('reason'); } else go('send'); },
  send: (k) => { S.send = k; S.label = false; render(); },
  sendNext: () => go(S.send === 'door' ? 'collect' : 'check'),
  label: () => { S.label = true; go('check'); },
  clearpc: () => { S.postcode = ''; render(); document.getElementById('pcs').focus(); },
  day: (d) => { S.day = d; render(); }, slot: (s) => { S.slot = s; render(); },
  collectNext: () => { S.send = 'door'; S.label = false; go('check'); },
  confirm: () => { S.hist = []; go(S.label ? 'label' : S.send === 'door' ? 'booked' : 'code', true); },
  restart: () => { S.idx = 0; go('offer'); },
  switch: () => { S.send = S.send === 'po' ? 'locker' : 'po'; render(); toast(`Switched to ${POINTS[S.send].carrier}. Your dates stay the same.`); },
  useCode: () => { S.label = false; S.send = 'po'; go('code', true); },
  modal: (m) => { S.modal = m; render(); }, close: () => { S.modal = null; render(); },
  doCancel: () => { S.hist = []; go('cancelled', true); },
  doLeave: () => { S = fresh(); render(); },
  again: () => { const t = S.tries; S = fresh(); S.tries = t; S.hist = []; S.screen = 'order'; render(); },
  shop: () => { S.modal = STEP_OF[S.screen] ? 'leave' : 'shop'; render(); },
  toast: (t) => toast(t),
  track: (t) => { S.track = t; render(); window.scrollTo(0, 0); },
  goodwill: () => { S.picked = ['sweat']; first().reason = 'mind'; first().offer = 'credit'; go('outcome'); },
  faultyRoute: () => { S.picked = ['sweat']; S.idx = 0; first().reason = 'faulty'; go('faulty'); },
  demoToggle: () => { S.demo = !S.demo; render(); },
  reset: () => { S = fresh(); render(); },
  demo: (d) => { S.demo = false; S.hist = [];
    if (d === 'expired') { S = fresh(); S.expired = true; return render(); }
    if (d === 'refunded') { S.hist = ['order']; S.screen = 'refundedOld'; return render(); }
    if (d === 'soldout') { seedStory(); S.idx = 0; S.soldOut = true; S.screen = 'size'; return render(); }
    if (d === 'window' || d === 'goodwill') { S.goodwill = d === 'goodwill'; S.screen = 'windowpassed'; return render(); }
    if (['transit', 'late', 'received'].includes(d)) { seedStory(); S.track = d; S.screen = 'track'; return render(); }
    if (d === 'outcome') { seedStory(); S.screen = 'outcome'; return render(); }
    S.screen = { notdelivered: 'notdelivered', error: 'error', part: 'part', cantpost: 'cantpost' }[d]; if (d === 'cantpost') S.hist = ['order']; render(); },
};
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (el.classList.contains('dim') && e.target !== el) return;
  const [fn, ...rest] = el.dataset.act.split(':'); if (ACT[fn]) ACT[fn](rest.join(':'));
});
document.addEventListener('input', (e) => { if (e.target.id === 'pcs') { S.postcode = e.target.value; if (/^TR/i.test(S.postcode.trim()) !== !!S._none) { S._none = /^TR/i.test(S.postcode.trim()); render(); const i = document.getElementById('pcs'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (S.modal || S.demo)) { S.modal = null; S.demo = false; render(); } if (e.key === 'Enter' && e.target.id === 'ord') ACT.find(); });
render();
