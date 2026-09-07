-- Merge duplicate subject labels into the canonical names used by TracePG.
UPDATE questions
SET subject = CASE subject
  WHEN 'Anaesthesia' THEN 'Anesthesia'
  WHEN 'Gynaecology & Obstetrics' THEN 'OBG'
  WHEN 'Orthopaedics' THEN 'Orthopedics'
  WHEN 'OBG' THEN 'OBG'
  WHEN 'Orthopedics' THEN 'Orthopedics'
  ELSE subject
END,
data = json_set(data, '$.subject', CASE subject
  WHEN 'Anaesthesia' THEN 'Anesthesia'
  WHEN 'Gynaecology & Obstetrics' THEN 'OBG'
  WHEN 'Orthopaedics' THEN 'Orthopedics'
  ELSE subject
END)
WHERE subject IN ('Anaesthesia', 'Anesthesia', 'Gynaecology & Obstetrics', 'OBG', 'Orthopaedics', 'Orthopedics');

UPDATE pyq_questions
SET subject = CASE subject
  WHEN 'Anaesthesia' THEN 'Anesthesia'
  WHEN 'Gynaecology & Obstetrics' THEN 'OBG'
  WHEN 'Orthopaedics' THEN 'Orthopedics'
  WHEN 'OBG' THEN 'OBG'
  WHEN 'Orthopedics' THEN 'Orthopedics'
  ELSE subject
END,
data = json_set(data, '$.subject', CASE subject
  WHEN 'Anaesthesia' THEN 'Anesthesia'
  WHEN 'Gynaecology & Obstetrics' THEN 'OBG'
  WHEN 'Orthopaedics' THEN 'Orthopedics'
  ELSE subject
END)
WHERE subject IN ('Anaesthesia', 'Anesthesia', 'Gynaecology & Obstetrics', 'OBG', 'Orthopaedics', 'Orthopedics');
