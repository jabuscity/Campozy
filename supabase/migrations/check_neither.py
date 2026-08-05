import re
files = [
    '0001_initial_schema.sql',
    'audited_schema.sql',
    'audited_schema_backup_before_hardening.sql'
]
base = r'D:\Campozy\supabase\migrations'
for f in files:
    with open(base + '\\\\' + f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    pattern = re.compile(r'CREATE\s+POLICY\s+("(?:[^"]+)"|\S+)\s+ON\s+(\w+)\s+FOR\s+(\w+)(?:\s+TO\s+(\w+))?(.*?);', re.DOTALL | re.IGNORECASE)
    matches = pattern.findall(content)
    neither = []
    for m in matches:
        name, table, cmd, role, clause = m
        clause = clause.strip()
        has_true = bool(re.search(r'USING\s*\(\s*true\s*\)', clause, re.IGNORECASE) or re.search(r'WITH\s+CHECK\s*\(\s*true\s*\)', clause, re.IGNORECASE))
        has_uid = bool(re.search(r'auth\.uid\s*\(\s*\)', clause, re.IGNORECASE))
        has_false = bool(re.search(r'USING\s*\(\s*false\s*\)', clause, re.IGNORECASE) or re.search(r'WITH\s+CHECK\s*\(\s*false\s*\)', clause, re.IGNORECASE))
        if not has_true and not has_uid and not has_false:
            neither.append((name, table, cmd, clause.replace(chr(10), ' ')[:100]))
    print('=== ' + f + ' (' + str(len(neither)) + ' unclassified) ===')
    for n in neither:
        print(' ', n)
    print()
