(function(){
  const C = window.CONFIG, S = window.SERVICOS;
  const $ = id => document.getElementById(id);
  const wa = t => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t)}`;
  const toMin = h => { const [a,b] = h.split(':').map(Number); return a*60 + b; };
  const fmt = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

  function agora(){
    const p = new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',weekday:'short',hour12:false}).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const dias = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    return { dow: dias[g('weekday')], min: Number(g('hour'))*60 + Number(g('minute')) };
  }

  // status aberto/fechado
  (function(){
    const n = agora();
    const aberto = !C.diasFechados.includes(n.dow) && n.min >= toMin(C.abre) && n.min < toMin(C.fecha);
    $('status').classList.toggle('open', aberto);
    $('statusTxt').textContent = aberto ? `Aberto agora, fecha às ${C.fecha.replace(':','h')}` : `Fechado agora, volta às ${C.abre.replace(':','h')}`;
  })();

  const nav = $('nav');
  addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), {passive:true});
  nav.classList.toggle('solid', scrollY > 40);
  const prog = $('progress');
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  }, {passive:true});
  const burger = $('burger'), menuNav = $('menuNav');
  function closeMenu(){ menuNav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Abrir menu'); }
  burger.onclick = () => { const o = menuNav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu'); };
  menuNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
  const hero = $('hero'), spot = $('spot');
  if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      spot.style.setProperty('--x', (e.clientX - r.left) + 'px');
      spot.style.setProperty('--y', (e.clientY - r.top) + 'px');
      spot.style.opacity = 1;
    });
    hero.addEventListener('pointerleave', () => spot.style.opacity = 0);
  }

  // reserva
  const st = { servico:null, dia:null, hora:null };
  const cServ = $('cServ');
  S.forEach((s,i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = `${s.nome} · R$${s.preco}`; b.setAttribute('aria-pressed','false');
    b.onclick = () => pickServ(i);
    cServ.appendChild(b);
  });
  function pickServ(i){
    st.servico = i; st.hora = null;
    [...cServ.children].forEach((b,k) => b.setAttribute('aria-pressed', k === i));
    renderHoras(); update();
  }

  // tabela de preços em 3 colunas
  const grupos = [
    ['Cabelo', [0,1,5]],
    ['Barba e rosto', [2,3,4]],
    ['Cor e pigmentação', [6,7]],
  ];
  const cols = $('cols');
  grupos.forEach(([titulo, ids]) => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${titulo}</h3><ul></ul>`;
    const ul = div.querySelector('ul');
    ids.forEach(i => {
      const s = S[i], li = document.createElement('li');
      li.innerHTML = `<button type="button" class="row"><span class="n">${s.nome}${s.destaque ? '<span class="tag">mais pedido</span>' : ''}</span><span class="dots-l"></span><span class="p">R$ <b data-v="${s.preco}">${s.preco}</b></span><span class="d">${s.min} min. ${s.desc}</span></button>`;
      li.firstChild.onclick = () => { pickServ(i); $('agendar').scrollIntoView({behavior:'smooth'}); };
      ul.appendChild(li);
    });
    cols.appendChild(div);
  });

  const cDia = $('cDia');
  const nomes = ['dom','seg','ter','qua','qui','sex','sáb'];
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const hoje = new Date(), dias = [];
  for (let k = 0; dias.length < 7 && k < 14; k++){
    const d = new Date(hoje); d.setDate(hoje.getDate() + k);
    if (C.diasFechados.includes(d.getDay())) continue;
    dias.push({ d, offset:k });
  }
  dias.forEach((o,i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'day'; b.setAttribute('aria-pressed','false');
    b.innerHTML = `<small>${o.offset === 0 ? 'hoje' : nomes[o.d.getDay()]}</small><b>${o.d.getDate()}</b><small>${meses[o.d.getMonth()]}</small>`;
    b.onclick = () => { st.dia = i; st.hora = null; [...cDia.children].forEach((x,k)=>x.setAttribute('aria-pressed',k===i)); renderHoras(); update(); };
    cDia.appendChild(b);
  });

  const cHora = $('cHora');
  function renderHoras(){
    cHora.innerHTML = '';
    if (st.dia === null){ cHora.innerHTML = '<span class="empty">Escolha o dia pra ver os horários.</span>'; return; }
    const dur = st.servico === null ? 30 : S[st.servico].min;
    const ini = toMin(C.abre), fim = toMin(C.fecha);
    const n = agora(), ehHoje = dias[st.dia].offset === 0;
    let count = 0;
    for (let m = ini; m + dur <= fim; m += 30){
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = fmt(m); b.setAttribute('aria-pressed', st.hora === m);
      if (ehHoje && m <= n.min) b.disabled = true; else count++;
      b.onclick = () => { st.hora = m; [...cHora.children].forEach(x => x.setAttribute('aria-pressed', x === b)); update(); };
      cHora.appendChild(b);
    }
    if (!count) cHora.innerHTML = '<span class="empty">Sem horários livres nesse dia. Escolha outro dia.</span>';
  }

  const go = $('go');
  function update(){
    const ok = st.servico !== null && st.dia !== null && st.hora !== null;
    go.disabled = !ok;
    if (ok){ const d = dias[st.dia].d; go.textContent = `Reservar ${nomes[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1} às ${fmt(st.hora)}`; }
    else go.textContent = 'Escolha serviço, dia e hora';
  }
  $('book').addEventListener('submit', e => {
    e.preventDefault();
    if (go.disabled) return;
    if (C.agendamentoOnline){ window.open(C.agendamentoOnline,'_blank','noopener'); return; }
    const d = dias[st.dia].d, s = S[st.servico], nome = $('nome').value.trim();
    $('sent').textContent = 'WhatsApp aberto em outra aba. Envie a mensagem pra confirmar o horário.';
    window.open(wa(`Oi! ${nome ? 'Sou ' + nome + '. ' : ''}Quero marcar ${s.nome} (R$ ${s.preco}) no dia ${d.getDate()}/${d.getMonth()+1} às ${fmt(st.hora)}. Tem vaga?`),'_blank','noopener');
  });
  $('wpp').href = wa('Oi! Vim pelo site da AJ Two Brothers e quero marcar um horário.');

  // galeria
  const fotos = [
    ['barba','Barba grisalha alinhada na navalha'],
    ['platinado','Cabelo platinado'],
    ['grid-fade','Fade visto de quatro ângulos'],
    ['fade-lateral','Fade lateral em cabelo crespo'],
    ['perfil','Corte visto de perfil'],
    ['grid-antes','Transformação em ângulos diferentes'],
    ['degrade','Degradê de lado'],
    ['corte-video','Corte na cadeira'],
  ];
  const grid = $('grid');
  fotos.forEach(([f,alt],i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Ampliar: ' + alt);
    b.innerHTML = `<img src="img/${f}.jpg" alt="${alt}" loading="lazy"><span class="cap">${alt}</span>`;
    b.onclick = () => openLb(i);
    grid.appendChild(b);
  });
  const lb = $('lb'), lbi = lb.querySelector('img'); let cur = 0;
  function openLb(i){ cur = (i + fotos.length) % fotos.length; lbi.src = `img/${fotos[cur][0]}.jpg`; lbi.alt = fotos[cur][1]; lb.classList.add('on'); }
  lb.querySelector('.x').onclick = () => lb.classList.remove('on');
  lb.querySelector('.pv').onclick = e => { e.stopPropagation(); openLb(cur-1); };
  lb.querySelector('.nx').onclick = e => { e.stopPropagation(); openLb(cur+1); };
  lb.onclick = e => { if (e.target === lb || e.target === lbi) lb.classList.remove('on'); };
  addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') lb.classList.remove('on');
    if (e.key === 'ArrowLeft') openLb(cur-1);
    if (e.key === 'ArrowRight') openLb(cur+1);
  });
  if (C.instagram){ const b = $('btnSocial'); b.href = C.instagram; b.textContent = 'Seguir no Instagram'; }

  // depoimentos
  const quotes = [
    ['Ótimo local. Fácil localização. Ótimo trabalho.','Roberto Jr, no Google'],
    ['Barbearia muito bem organizada, ótimos profissionais e um bom atendimento.','Carlos Alberto, no Google'],
    ['Excelente atendimento.','Fabiano Pinheiro, no Google'],
  ];
  const box = $('quoteBox'), dots = $('dots'); let qi = 0, timer;
  quotes.forEach((_,i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-label',`Avaliação ${i+1}`);
    b.onclick = () => { show(i); restart(); };
    dots.appendChild(b);
  });
  function show(i){
    qi = i;
    box.classList.add('off');
    setTimeout(() => {
      $('qText').textContent = '“' + quotes[i][0] + '”';
      $('qWho').textContent = quotes[i][1];
      [...dots.children].forEach((d,k) => d.setAttribute('aria-selected', k === i));
      box.classList.remove('off');
    }, 250);
  }
  function restart(){ clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show((qi+1) % quotes.length), 6000); }
  $('qText').textContent = '“' + quotes[0][0] + '”'; $('qWho').textContent = quotes[0][1];
  dots.children[0].setAttribute('aria-selected','true');
  restart();

  // entradas unicas ao rolar: icones se desenham, fotos entram, precos contam
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.cards svg *').forEach(el => el.setAttribute('pathLength','1'));
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (!x.isIntersecting) return;
    const el = x.target; el.classList.add('in'); io.unobserve(el);
    if (el.id === 'cols' && !reduce){
      el.querySelectorAll('b[data-v]').forEach(b => {
        const v = +b.dataset.v, t0 = performance.now();
        (function tick(t){ const k = Math.min(1,(t-t0)/800); b.textContent = Math.round(v * (1 - Math.pow(1-k,3))); if (k < 1) requestAnimationFrame(tick); })(t0);
      });
    }
  }), {threshold:.25});
  document.querySelectorAll('.cards article, .intro-img, #cols').forEach(el => io.observe(el));
})();
