export function transliterateToCyrillic(text) {
  const map = {
    a: "а",
    b: "б",
    d: "д",
    e: "е",
    f: "ф",
    g: "г",
    h: "ҳ",
    i: "и",
    j: "ж",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    q: "қ",
    r: "р",
    s: "с",
    t: "т",
    u: "у",
    v: "в",
    x: "х",
    y: "й",
    z: "з",
    ʼ: "ъ",
    "’": "ъ",
    "g‘": "ғ",
    "o‘": "ў",
    sh: "ш",
    ch: "ч",
    ya: "я",
    yo: "ё",
    yu: "ю",
    ye: "е",
  };

  return text
    .replace(/g‘/gi, (m) => (m[0] === "G" ? "Ғ" : "ғ"))
    .replace(/o‘/gi, (m) => (m[0] === "O" ? "Ў" : "ў"))
    .replace(/sh/gi, (m) => (m[0] === "S" ? "Ш" : "ш"))
    .replace(/ch/gi, (m) => (m[0] === "C" ? "Ч" : "ч"))
    .replace(/ya/gi, (m) => (m[0] === "Y" ? "Я" : "я"))
    .replace(/yo/gi, (m) => (m[0] === "Y" ? "Ё" : "ё"))
    .replace(/yu/gi, (m) => (m[0] === "Y" ? "Ю" : "ю"))
    .replace(/ye/gi, (m) => (m[0] === "Y" ? "Е" : "е"))
    .replace(/[a-zA-Zʼ’]/g, (ch) => {
      const lower = ch.toLowerCase();
      const cyr = map[lower] || ch;
      return ch === lower ? cyr : cyr.toUpperCase();
    });
}

export function transliterateToLatin(text) {
  const map = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    ғ: "g‘",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "j",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    қ: "q",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    ў: "o‘",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "x",
    ҳ: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sh",
    ь: "",
    ъ: "ʼ",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text.replace(/[а-яёғқҳў]/gi, (ch) => {
    const lower = ch.toLowerCase();
    const lat = map[lower] || ch;
    return ch === lower ? lat : lat.charAt(0).toUpperCase() + lat.slice(1);
  });
}

export function isCyrillic(text) {
  return /[а-яёғқҳў]/i.test(text);
}
