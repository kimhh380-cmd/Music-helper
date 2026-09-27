// 음악 이론: 음 이름, 코드 종류, 키, 스케일 (일렉기타·피아노·베이스가 함께 씀)

const LETTERS = 'CDEFGAB';
const NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ACC_TEXT = { 0: '', 1: '♯', 2: '𝄪', '-1': '♭', '-2': '𝄫' };

// 'F♯' 같은 음 이름 → 0~11 (C=0)
function pcOf(name) {
  let v = NATURAL[name[0]];
  for (const c of name.slice(1)) v += c === '♯' ? 1 : c === '♭' ? -1 : c === '𝄪' ? 2 : c === '𝄫' ? -2 : 0;
  return (v + 12) % 12;
}

// 근음 이름에서 deg(글자 칸 수)와 semi(반음 수)만큼 떨어진 음을 올바른 이름으로
function spell(root, deg, semi) {
  const letter = LETTERS[(LETTERS.indexOf(root[0]) + deg) % 7];
  const pc = (pcOf(root) + semi) % 12;
  const d = ((pc - NATURAL[letter] + 18) % 12) - 6;
  return letter + ACC_TEXT[d];
}

// MIDI 번호 → 'C4' 같은 이름 (가운데 도 = C4 = 60)
const SHARP_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
function midiName(m) { return SHARP_NAMES[m % 12] + (Math.floor(m / 12) - 1); }

// 코드 종류. t = [글자 칸, 반음, 꼭 필요한 음이면 1]
// 5도(0)는 실제 연주에서 자주 빼는 음이라 생략 가능으로 둠
const QUALITIES = [
  { k: 'M', s: '', n: '메이저', t: [[2, 4, 1], [4, 7, 1]] },
  { k: 'm', s: 'm', n: '마이너', t: [[2, 3, 1], [4, 7, 1]] },
  { k: '7', s: '7', n: '세븐', t: [[2, 4, 1], [4, 7, 0], [6, 10, 1]] },
  { k: 'M7', s: 'M7', n: '메이저 세븐', t: [[2, 4, 1], [4, 7, 0], [6, 11, 1]] },
  { k: 'm7', s: 'm7', n: '마이너 세븐', t: [[2, 3, 1], [4, 7, 0], [6, 10, 1]] },
  { k: '5', s: '5', n: '파워코드', t: [[4, 7, 1]], min: 2, only: 1 },
  { k: 'sus2', s: 'sus2', n: '서스 투', t: [[1, 2, 1], [4, 7, 1]] },
  { k: 'sus4', s: 'sus4', n: '서스 포', t: [[3, 5, 1], [4, 7, 1]] },
  { k: '7sus4', s: '7sus4', n: '세븐 서스 포', t: [[3, 5, 1], [4, 7, 0], [6, 10, 1]] },
  { k: '6', s: '6', n: '식스', t: [[2, 4, 1], [4, 7, 0], [5, 9, 1]] },
  { k: 'm6', s: 'm6', n: '마이너 식스', t: [[2, 3, 1], [4, 7, 0], [5, 9, 1]] },
  { k: 'add9', s: 'add9', n: '애드 나인', t: [[2, 4, 1], [4, 7, 0], [1, 2, 1]] },
  { k: '9', s: '9', n: '나인', t: [[2, 4, 1], [4, 7, 0], [6, 10, 1], [1, 2, 1]] },
  { k: 'M9', s: 'M9', n: '메이저 나인', t: [[2, 4, 1], [4, 7, 0], [6, 11, 1], [1, 2, 1]] },
  { k: 'm9', s: 'm9', n: '마이너 나인', t: [[2, 3, 1], [4, 7, 0], [6, 10, 1], [1, 2, 1]] },
  { k: 'mM7', s: 'mM7', n: '마이너 메이저 세븐', t: [[2, 3, 1], [4, 7, 0], [6, 11, 1]] },
  { k: 'dim', s: 'dim', n: '디미니시', t: [[2, 3, 1], [4, 6, 1]] },
  { k: 'm7b5', s: 'm7♭5', n: '하프 디미니시', t: [[2, 3, 1], [4, 6, 1], [6, 10, 1]] },
  { k: 'dim7', s: 'dim7', n: '디미니시 세븐', t: [[2, 3, 1], [4, 6, 1], [6, 9, 1]] },
  { k: 'aug', s: 'aug', n: '어그먼트', t: [[2, 4, 1], [4, 8, 1]] },
];
const QI = Object.fromEntries(QUALITIES.map((q, i) => [q.k, i]));

// 코드의 구성음: pcs[0]이 근음, req = 꼭 필요한 음, allow = 쓸 수 있는 음
function chordTones(r, qi) {
  const tones = [[0, 0, 1], ...QUALITIES[qi].t];
  const pcs = tones.map(t => (r + t[1]) % 12);
  return { tones, pcs, req: new Set(pcs.filter((p, i) => tones[i][2])), allow: new Set(pcs) };
}

// 코드 이름 목록: [기본, 3도 베이스, 5도 베이스, ...] (슬래시 코드)
function chordNames(rootName, qi) {
  const q = QUALITIES[qi];
  const nm = rootName + q.s;
  return [nm, ...q.t.map(t => nm + '/' + spell(rootName, t[0], t[1]))];
}

// 키
const MAJOR_KEYS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const MINOR_KEYS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];
// [글자 칸, 반음, 로마 숫자, 3화음 종류, 세븐스 종류]
const MAJOR_CHORDS = [[0, 0, 'I', 'M', 'M7'], [1, 2, 'ii', 'm', 'm7'], [2, 4, 'iii', 'm', 'm7'], [3, 5, 'IV', 'M', 'M7'], [4, 7, 'V', 'M', '7'], [5, 9, 'vi', 'm', 'm7'], [6, 11, 'vii°', 'dim', 'm7b5']];
const MINOR_CHORDS = [[0, 0, 'i', 'm', 'm7'], [1, 2, 'ii°', 'dim', 'm7b5'], [2, 3, 'III', 'M', 'M7'], [3, 5, 'iv', 'm', 'm7'], [4, 7, 'v', 'm', 'm7'], [4, 7, 'V', 'M', '7'], [5, 8, 'VI', 'M', 'M7'], [6, 10, 'VII', 'M', '7']];

// 키의 코드 목록 → [{rn, root, r, qi, names}]
function keyChords(keyName, minor, seventh) {
  return (minor ? MINOR_CHORDS : MAJOR_CHORDS).map(([deg, semi, rn, tq, sq]) => {
    const root = spell(keyName, deg, semi);
    const qi = QI[seventh ? sq : tq];
    return { rn, root, r: pcOf(root), qi, tq, sq, names: chordNames(root, qi) };
  });
}

// 코드 사전의 근음
const DICT_ROOTS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const DICT_ROOT_LABEL = { 1: 'C♯·D♭', 6: 'F♯·G♭' };

// 스케일
const SCALES = [
  { n: '마이너 펜타토닉', minor: 1, d: '록·블루스 솔로에서 가장 많이 쓰는 5음 스케일이에요. 반음 간격이 없어서 어떤 음을 쳐도 잘 어울리고, 처음 솔로를 배울 때 가장 먼저 익혀요.', t: [[0, 0, '1'], [2, 3, '♭3'], [3, 5, '4'], [4, 7, '5'], [6, 10, '♭7']] },
  { n: '메이저 펜타토닉', minor: 0, d: '밝은 느낌의 5음 스케일이에요. 컨트리·팝·밝은 록 솔로에 잘 맞고, 같은 모양이 나란한조 마이너 펜타토닉과 겹쳐요.', t: [[0, 0, '1'], [1, 2, '2'], [2, 4, '3'], [4, 7, '5'], [5, 9, '6']] },
  { n: '메이저 스케일 (장음계)', minor: 0, d: '도레미파솔라시에 해당하는 7음 스케일이에요. 장조 곡의 멜로디와 코드가 모두 여기서 나와요.', t: [[0, 0, '1'], [1, 2, '2'], [2, 4, '3'], [3, 5, '4'], [4, 7, '5'], [5, 9, '6'], [6, 11, '7']] },
  { n: '내추럴 마이너 (자연단음계)', minor: 1, d: '라시도레미파솔에 해당하는 7음 스케일이에요. 단조 곡의 기본이 되고, 슬프거나 어두운 분위기의 솔로에 써요.', t: [[0, 0, '1'], [1, 2, '2'], [2, 3, '♭3'], [3, 5, '4'], [4, 7, '5'], [5, 8, '♭6'], [6, 10, '♭7']] },
];
function scaleNotes(si, keyIndex) {
  const sc = SCALES[si];
  const keyName = (sc.minor ? MINOR_KEYS : MAJOR_KEYS)[keyIndex];
  return {
    sc, keyName,
    pcs: sc.t.map(t => (pcOf(keyName) + t[1]) % 12),
    names: sc.t.map(t => spell(keyName, t[0], t[1])),
  };
}

// 코드 진행 글자 해석: "G:4 D Em7:2" → [{name, r, qi, beats}]
const SUFFIX = { '': 'M', 'M': 'M', 'maj': 'M', 'm': 'm', 'min': 'm', '-': 'm', '7': '7', 'M7': 'M7', 'maj7': 'M7', 'Δ7': 'M7', 'm7': 'm7', 'min7': 'm7', '-7': 'm7', '5': '5', 'sus2': 'sus2', 'sus4': 'sus4', 'sus': 'sus4', '7sus4': '7sus4', '6': '6', 'm6': 'm6', 'add9': 'add9', '9': '9', 'M9': 'M9', 'maj9': 'M9', 'm9': 'm9', 'mM7': 'mM7', 'mmaj7': 'mM7', 'dim': 'dim', '°': 'dim', 'm7b5': 'm7b5', 'm7♭5': 'm7b5', 'ø': 'm7b5', 'dim7': 'dim7', '°7': 'dim7', 'aug': 'aug', '+': 'aug' };
function parseProgression(txt, beatsPerBar) {
  const out = [];
  for (const tok of txt.trim().split(/[\s,|]+/).filter(Boolean)) {
    const m = tok.match(/^([A-Ga-g])([#b♯♭]?)([^:\/]*)(?:\/[^:]*)?(?::(\d+(?:\.\d+)?))?$/);
    if (!m) throw `“${tok}”을(를) 코드로 읽을 수 없어요. 예: G, Am, D7, Cmaj7, F#m7b5`;
    const root = m[1].toUpperCase() + m[2].replace('#', '♯').replace('b', '♭');
    const q = SUFFIX[m[3]];
    if (q === undefined) throw `“${m[3]}” 코드 종류는 아직 지원하지 않아요. 지원: M, m, 7, M7, m7, 5, sus2, sus4, 7sus4, 6, m6, add9, 9, M9, m9, mM7, dim, m7b5, dim7, aug`;
    const beats = m[4] ? +m[4] : beatsPerBar;
    if (beats <= 0 || beats > 32) throw `“${tok}”의 박수는 1~32 사이로 적어 주세요.`;
    out.push({ name: root + m[3], root, r: pcOf(root), qi: QI[q], beats });
  }
  if (!out.length) throw '코드를 하나 이상 적어 주세요.';
  return out;
}
