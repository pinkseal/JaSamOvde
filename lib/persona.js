var ADJ = [
  'Тихий', 'Уютный', 'Дымчатый', 'Смелый', 'Пушистый',
  'Весёлый', 'Сонный', 'Хитрый', 'Медовый', 'Чайный',
];
var ANI = [
  ['тюлень', '🦭'], ['енот', '🦝'], ['ёж', '🦔'], ['кот', '🐈'],
  ['филин', '🦉'], ['лис', '🦊'], ['осьминог', '🐙'], ['барсук', '🦡'], ['медведь', '🐻'],
];

export function genPersona() {
  var a = ADJ[Math.floor(Math.random() * ADJ.length)];
  var n = ANI[Math.floor(Math.random() * ANI.length)];
  return { nick: a + ' ' + n[0], emoji: n[1] };
}
