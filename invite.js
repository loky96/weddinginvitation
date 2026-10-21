/* Single source of truth for invitation content + shared renderer used by all three themes. */
const INVITE = {
  invitationTitle: 'WEDDING INVITATION',
  couple: {
    groom: {
      name: 'V. M. Lokesh Kumar',
      qualifications: 'BE., M.Des.',
      institution: 'IIT Bombay',
      parentage: [
        'S/o Mr. V. D. Murali Babu, Textile Business',
        '& Mrs. P. B. Gajalakshmi, CMA & CS,',
        'DGM – Sec & Acct.',
        '(GEA BGR Energy System India Ltd)',
        'Chennai',
      ],
    },
    bride: {
      name: 'B. Haripriya',
      qualifications: 'B.Tech',
      institution: 'IIIT Manipur',
      parentage: [
        'D/o Mr. L. Baskaran, Proprietor, Sri Jothi Printers',
        '& Mrs. S. Gomathi, Ph.D',
        'Professor & HoD,',
        'St. Thomas College of Arts and Science',
        'Chennai',
      ],
    },
  },
  events: [
    { id: 'reception', title: 'Reception', date: '2026-11-21', weekday: 'Saturday',
      displayDate: '21.11.2026, Saturday', displayTime: '7.00 pm onwards',
      startsAtLocal: '2026-11-21T19:00:00+05:30', endsAtLocal: null },
    { id: 'wedding', title: 'Wedding Ceremony', date: '2026-11-22', weekday: 'Sunday',
      displayDate: '22.11.2026, Sunday', displayTime: '8.30 am to 10.00 am',
      startsAtLocal: '2026-11-22T08:30:00+05:30', endsAtLocal: '2026-11-22T10:00:00+05:30' },
  ],
  timezone: 'Asia/Kolkata',
  venue: {
    name: 'BANYAN PALACE - MUKUNDA HALL',
    shortName: 'Banyan Palace, Chennai',
    addressLines: ['390, Bangalore Trunk Road,', 'Near Panimalar Engineering College,', 'Poonamallee, Chennai – 600 123.'],
    mapsUrl: 'https://maps.app.goo.gl/VkdBA7YwzFv3G5zW6',
  },
  openingMessage: 'We cordially invite you and your family to grace the auspicious occasion of the wedding of',
  blessingMessage: 'Your gracious presence and loving blessings will make this joyous occasion truly memorable for us.',
  signOff: {
    heading: 'With warm regards,',
    lines: ['Mr. V. D. Murali Babu & Mrs. P. B. Gajalakshmi', 'Mr. L. Baskaran & Mrs. S. Gomathi'],
  },
  calendar: { year: 2026, month: 11 },

  art: {
    lamp: `<svg class="lamp" viewBox="0 0 40 80" aria-hidden="true"><circle class="glow" cx="20" cy="12" r="14"/><path class="flame" d="M20 2c3 5 4 9 0 13-4-4-3-8 0-13z"/><path class="brass" d="M7 17h26l-4 6H11zM18 23h4v35h-4zM12 32h16l-3 3H15zM14 44h12l-2 3h-8zM10 58h20l4 9H6zM3 67h34v5H3z"/></svg>`,
    gopuram: `<svg class="gopuram" viewBox="0 0 100 120" aria-hidden="true"><path class="g-body" d="M14 120V98h72v22zM20 98l5-19h50l5 19zM28 79l4-17h36l4 17zM35 62l3-15h24l3 15zM41 47l2-11h14l2 11z"/><path class="g-line" d="M20 98h60M28 79h44M35 62h30M41 47h18"/><path class="g-door" d="M41 120v-12a9 9 0 0 1 18 0v12z"/><path class="g-top" d="M44 36h12l-2-4h-8zM50 32v-7"/><circle class="g-top" cx="50" cy="23" r="3"/></svg>`,
    knot: `<svg viewBox="0 0 130 120" aria-hidden="true"><g class="loops"><path class="cord red" d="M65 24C38-4 6 22 65 30M65 24c27-28 59-2 0 6"/><path class="cord gold" d="M65 24C38-4 6 22 65 30M65 24c27-28 59-2 0 6"/><circle cx="65" cy="27" r="6" fill="#c0281c" stroke="#e2b25a" stroke-width="1.5"/></g><g class="tails"><path class="cord red" d="M62 32c-8 26-18 46-26 70M68 32c8 26 18 46 26 70"/><path class="cord gold" d="M62 32c-8 26-18 46-26 70M68 32c8 26 18 46 26 70"/><path d="M30 100h12l2 16h-16zM88 100h12l2 16H86z" fill="#e2b25a"/><path d="M31 104v12M35 104v12M39 104v12M89 104v12M93 104v12M97 104v12" stroke="#c0281c" stroke-width="1.2"/></g></svg>`,
    kolam: `<svg class="kolam" viewBox="0 0 120 120" aria-hidden="true"><g class="k-lines"><path pathLength="1" d="M60 6L114 60 60 114 6 60z"/><circle pathLength="1" cx="60" cy="60" r="44"/><path pathLength="1" d="M60 14C84 34 84 46 60 60 36 46 36 34 60 14z"/><path pathLength="1" d="M60 14C84 34 84 46 60 60 36 46 36 34 60 14z" transform="rotate(90 60 60)"/><path pathLength="1" d="M60 14C84 34 84 46 60 60 36 46 36 34 60 14z" transform="rotate(180 60 60)"/><path pathLength="1" d="M60 14C84 34 84 46 60 60 36 46 36 34 60 14z" transform="rotate(270 60 60)"/></g><g class="k-dots"><circle cx="60" cy="60" r="2.5"/><circle cx="30" cy="30" r="2.5"/><circle cx="90" cy="30" r="2.5"/><circle cx="30" cy="90" r="2.5"/><circle cx="90" cy="90" r="2.5"/></g></svg>`,
  },
};

(() => {
  const D = INVITE, V = D.venue;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const LOCATION = `${V.name}, ${V.addressLines.join(' ')}`;
  const SHARE_TEXT = 'You are warmly invited to the wedding of Lokesh & Haripriya — 21–22 November 2026, Banyan Palace, Chennai.';
  const WISH = 'Wishing Lokesh & Haripriya a lifetime of love, laughter and togetherness. Congratulations! 🌼';

  // Calendar exports in UTC. Reception has no printed end time, so exports use a 2h placeholder (labelled in the UI).
  const utc = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const calTimes = ev => {
    const s = new Date(ev.startsAtLocal);
    return [s, ev.endsAtLocal ? new Date(ev.endsAtLocal) : new Date(+s + 2 * 36e5)].map(utc);
  };
  const calDetails = ev => `Wedding of ${D.couple.groom.name} and ${D.couple.bride.name}. ${ev.title}: ${ev.displayDate}, ${ev.displayTime}.`
    + (ev.endsAtLocal ? '' : ' End time is a placeholder, please edit.') + ` Map: ${V.mapsUrl}`;
  const gcal = ev => {
    const [s, e] = calTimes(ev);
    return 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
      action: 'TEMPLATE', text: `Lokesh & Haripriya - ${ev.title}`, dates: `${s}/${e}`,
      details: calDetails(ev), location: LOCATION, ctz: D.timezone,
    });
  };
  const icsEsc = s => s.replace(/[\\;,]/g, m => '\\' + m);
  const ics = ev => {
    const [s, e] = calTimes(ev);
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent([
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lokesh & Haripriya//Wedding//EN', 'BEGIN:VEVENT',
      `UID:${ev.id}-2026@lokesh-haripriya`, `DTSTAMP:${s}`, `DTSTART:${s}`, `DTEND:${e}`,
      `SUMMARY:${icsEsc('Lokesh & Haripriya - ' + ev.title)}`, `LOCATION:${icsEsc(LOCATION)}`,
      `DESCRIPTION:${icsEsc(calDetails(ev))}`, 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n'));
  };

  const parentLine = (line, index, count) => {
    const comma = line.indexOf(',');
    if (index < 2 && comma >= 0) return esc(line.slice(0, comma + 1)) + `<span class="parent-detail">${esc(line.slice(comma + 1))}</span>`;
    return index >= 2 && index < count - 1 ? `<span class="parent-detail">${esc(line)}</span>` : esc(line);
  };

  const person = p => `<div class="person stagger">
      <h3 class="name">${esc(p.name)}<span class="qual">, ${esc(p.qualifications)}</span></h3>
      <p class="inst">(${esc(p.institution)})</p>
      <p class="parents">${p.parentage.map((line, i) => parentLine(line, i, p.parentage.length)).join('<br>')}</p>
    </div>`;

  const eventCard = (ev, open) => `<details class="ev ev-${ev.id} stagger" id="ev-${ev.id}"${open ? ' open' : ''}>
      <summary><span class="ev-title">${esc(ev.title)}</span><span class="ev-hint">Tap to reveal details</span></summary>
      <dl><dt>Date</dt><dd>${esc(ev.displayDate)}</dd><dt>Time</dt><dd>${esc(ev.displayTime)}</dd></dl>
      <div class="btns">
        <a class="btn" href="${esc(gcal(ev))}" target="_blank" rel="noopener">Add ${ev.id === 'wedding' ? 'Wedding Ceremony' : 'Reception'} to Calendar</a>
        <a class="btn ghost" href="${esc(ics(ev))}" download="lokesh-haripriya-${ev.id}.ics">Apple / Outlook (.ics)</a>
      </div>
      ${ev.endsAtLocal ? '' : '<p class="note">The invitation says “7.00 pm onwards”. Calendar entries use an editable 2-hour placeholder end time.</p>'}
    </details>`;

  const calendar = () => {
    const { year, month } = D.calendar;
    const cells = Array(new Date(year, month - 1, 1).getDay()).fill('<span></span>');
    for (let d = 1, n = new Date(year, month, 0).getDate(); d <= n; d++) {
      const ev = D.events.find(e => +e.date.slice(8) === d);
      cells.push(ev
        ? `<button type="button" class="day hl-${ev.id}" data-ev="${ev.id}" aria-label="${d} November 2026, ${ev.weekday}: ${esc(ev.title)}. Show details">${d}</button>`
        : `<span class="day">${d}</span>`);
    }
    return `<div class="cal stagger" role="group" aria-label="November 2026 calendar">
        <p class="cal-month">NOVEMBER 2026</p>
        <div class="cal-grid"><b aria-hidden="true">Sun</b><b aria-hidden="true">Mon</b><b aria-hidden="true">Tue</b><b aria-hidden="true">Wed</b><b aria-hidden="true">Thu</b><b aria-hidden="true">Fri</b><b aria-hidden="true">Sat</b>${cells.join('')}</div>
      </div>
      <p class="legend stagger"><span class="sw hl-reception"></span>21 Sat · Reception &nbsp; <span class="sw hl-wedding"></span>22 Sun · Wedding</p>`;
  };

  const qrBlock = () => `<a class="qr" href="${esc(V.mapsUrl)}" target="_blank" rel="noopener" aria-label="QR code for the venue location. Tap to open Google Maps"></a>
      <p class="small">Scan or tap for venue location</p>
      <div class="btns"><a class="btn" href="${esc(V.mapsUrl)}" target="_blank" rel="noopener">Open in Google Maps</a></div>`;

  function render(main, opts = {}) {
    const orn = opts.ornament || '';
    const [rec, wed] = D.events;
    const url = location.href.split('#')[0];
    main.innerHTML = `
      <section class="sec reveal" id="invitation" aria-labelledby="h-inv">
        ${orn}
        <h2 class="eyebrow" id="h-inv">${esc(D.invitationTitle)}</h2>
        <p class="lead stagger">${esc(D.openingMessage)}</p>
        ${person(D.couple.groom)}
        <p class="with stagger">with</p>
        ${person(D.couple.bride)}
      </section>

      <section class="sec reveal" id="events" aria-labelledby="h-ev">
        ${orn}
        <h2 id="h-ev">The Celebrations</h2>
        <div class="ev-list">${eventCard(rec, !opts.collapseEvents)}${eventCard(wed, !opts.collapseEvents)}</div>
      </section>

      <section class="sec reveal" id="date" aria-labelledby="h-date">
        ${orn}
        <h2 id="h-date">Save the Date</h2>
        <p class="small stagger">Tap a highlighted date to see that event.</p>
        ${calendar()}
      </section>

      <section class="sec reveal" id="venue" aria-labelledby="h-venue">
        ${orn}
        <h2 id="h-venue">Venue</h2>
        <p class="venue-name stagger">${esc(V.name)}</p>
        <p class="stagger">${V.addressLines.map(esc).join('<br>')}</p>
        <p class="at stagger">@ ${esc(V.shortName)}</p>
        ${opts.collapseVenue
          ? `<details class="venue-reveal stagger"><summary>${opts.venueArt || ''}<span class="ev-hint">Tap to reveal map &amp; QR</span></summary>${qrBlock()}</details>`
          : `<div class="stagger">${qrBlock()}</div>`}
      </section>

      <section class="sec reveal" id="blessings" aria-labelledby="h-bless">
        ${orn}
        <h2 id="h-bless">Blessings</h2>
        <p class="blessing stagger">${esc(D.blessingMessage)}</p>
        <div class="rule stagger" aria-hidden="true"></div>
        <p class="signoff-h stagger">${esc(D.signOff.heading)}</p>
        <p class="signoff stagger">${D.signOff.lines.map(esc).join('<br>')}</p>
      </section>

      <section class="sec reveal" id="share" aria-labelledby="h-share">
        <h2 id="h-share">Share the Joy</h2>
        <div class="btns stagger">
          <button type="button" class="btn" data-act="share">Share invitation</button>
          <button type="button" class="btn ghost" data-act="copy">Copy link</button>
          <a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + ' ' + url)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <div class="btns stagger">
          <a class="btn gold" href="https://wa.me/?text=${encodeURIComponent(WISH)}" target="_blank" rel="noopener">Send your blessings 🌼</a>
        </div>
        <p class="small stagger">Other designs: <a href="doors.html">Temple Doors</a> · <a href="garland.html">Garland Reveal</a> · <a href="scroll.html">Wedding Scroll</a> · <a href="hanging-scroll.html">Silk &amp; Sakura Scroll</a> · <a href="puzzle.html">Jigsaw Puzzle</a></p>
      </section>
      <div class="toast" role="status" aria-live="polite"></div>`;

    document.body.append(main.querySelector('.toast')); // keep position:fixed clear of transformed theme wrappers

    main.querySelectorAll('.qr').forEach(el => {
      try {
        const qr = qrcode(0, 'H');
        qr.addData(V.mapsUrl);
        qr.make();
        el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true }); // 4-module quiet zone
      } catch { el.textContent = 'Open venue in Google Maps'; }
    });

    main.addEventListener('click', e => {
      const day = e.target.closest('[data-ev]');
      if (day) focusEvent(day.dataset.ev);
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'share') share(url);
      if (act === 'copy') copy(url);
    });
  }

  function focusEvent(id) {
    const card = document.getElementById('ev-' + id);
    card.open = true;
    card.closest('.reveal')?.classList.add('in');
    card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
    card.querySelector('summary').focus({ preventScroll: true });
  }

  function toast(msg) {
    const t = document.querySelector('.toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }

  async function copy(url) {
    try { await navigator.clipboard.writeText(url); toast('Link copied'); }
    catch { prompt('Copy this link:', url); }
  }

  async function share(url) {
    if (!navigator.share) return copy(url);
    try { await navigator.share({ title: document.title, text: SHARE_TEXT, url }); } catch { /* user cancelled */ }
  }

  // Progressive reveal: each section unfolds (and its ornament animates) as it scrolls into view.
  function observe(onReveal) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      onReveal?.(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  function petals(x, y, n = 18, fall = 140) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'petal p' + (i % 3);
      const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 150;
      p.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r * 0.5 + fall}px;--rot:${Math.random() * 720 - 360}deg`;
      document.body.append(p);
      setTimeout(() => p.remove(), 1900);
    }
  }

  // Untie the cord on a tied-scroll.css hanging scroll and let the paper unroll to its full height.
  function unroll(hang) {
    if (hang.classList.contains('untied')) return;
    const sheet = hang.querySelector('.sheet'), roll = hang.querySelector('.roll'), knot = hang.querySelector('.knot');
    hang.classList.add('untied');
    const r = knot.getBoundingClientRect();
    petals(r.left + r.width / 2, r.top + 20, 26);
    // Ease-in so the first screenful unrolls slowly and the rest speeds past below the fold.
    const full = sheet.scrollHeight;
    const dur = reduced ? 0 : Math.min(4.5, 1.6 + full / 2000);
    hang.style.setProperty('--dur', dur + 's');
    setTimeout(() => {
      sheet.inert = false;
      hang.classList.add('open');
      sheet.classList.add('unrolling');
      roll.classList.add('spin');
      sheet.style.height = full + 'px';
      observe();
      setTimeout(() => {
        roll.classList.remove('spin');
        sheet.classList.remove('unrolling');
        sheet.style.height = 'auto';
        hang.classList.add('unrolled');
      }, dur * 1000 + 50);
    }, reduced ? 0 : 650);
  }

  document.documentElement.classList.add('js');
  Object.assign(INVITE, { render, observe, petals, focusEvent, toast, unroll, reduced });
})();
