export function cleanImagePath(p) {
  if (!p) return "";
  const BASE = "http://127.0.0.1:5000/images/";
  if (p.startsWith(BASE)) {
    let r = p.slice(BASE.length).replace(/\\/g, "/");
    r = r.replace(/^(\.\.\/)+.*dataset\//, "");
    return BASE + r;
  }
  let r = p.replace(/\\/g, "/");
  r = r.replace(/^.*dataset\//, "");
  return BASE + r;
}
