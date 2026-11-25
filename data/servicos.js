/* ============================================================
   TABELA DE SERVIÇOS — edite só este arquivo para mudar preços.
   ⚠ Valores abaixo são PLACEHOLDER (o Facebook só indica "$").
   Confirmar com o dono antes de publicar. Trocar "confirmar" por false.
   ============================================================ */
window.CONFIG = {
  whatsapp: "5521998501297",
  telefone: "(21) 99850-1297",
  facebook: "https://www.facebook.com/ajtwobrother",
  instagram: "", // preencher quando tiver o @ ; vazio esconde o botão
  agendamentoOnline: "", // link Booksy/Trinks etc. Vazio = usa WhatsApp
  abre: "09:00",   // ⚠ PLACEHOLDER: só sabemos que fecha 21:30. Confirmar abertura.
  fecha: "21:30",
  diasFechados: [], // 0=domingo ... 6=sábado. Ex.: [0] se fecha domingo (confirmar)
};

window.SERVICOS = [
  { nome: "Corte social / tesoura", min: 40, preco: 35, confirmar: true, desc: "Corte na régua ou na tesoura, acabamento limpo." },
  { nome: "Degradê (fade)", min: 45, preco: 40, confirmar: true, desc: "Low, mid ou high fade. Transição sem marca." },
  { nome: "Barba", min: 30, preco: 30, confirmar: true, desc: "Alinhamento, toalha quente e navalha." },
  { nome: "Corte + Barba", min: 70, preco: 65, confirmar: true, desc: "O combo completo. Sai pronto pra qualquer ocasião.", destaque: true },
  { nome: "Sobrancelha", min: 10, preco: 10, confirmar: true, desc: "Na navalha, discreta e alinhada." },
  { nome: "Pezinho / acabamento", min: 15, preco: 15, confirmar: true, desc: "Pra manter o corte em dia entre uma visita e outra." },
  { nome: "Platinado / luzes", min: 120, preco: 120, confirmar: true, desc: "Descoloração com cuidado. Consulte disponibilidade." },
  { nome: "Pigmentação / barba e cabelo", min: 30, preco: 25, confirmar: true, desc: "Preenche falhas e realça o desenho." },
];
