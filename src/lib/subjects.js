const SUBJECT_ALIASES = new Map([
  ["anaesthesia", "Anesthesia"],
  ["anesthesia", "Anesthesia"],
  ["gynaecology & obstetrics", "OBG"],
  ["obg", "OBG"],
  ["orthopaedics", "Orthopedics"],
  ["orthopedics", "Orthopedics"],
]);

export function normalizeSubject(value) {
  const subject = String(value ?? "").trim();
  return SUBJECT_ALIASES.get(subject.toLowerCase()) || subject;
}
