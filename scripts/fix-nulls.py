#!/usr/bin/env python3
"""
Run this before committing if you see CSS/TSX errors after writes.
Strips null bytes from all CSS and TSX/TS files.
Usage: python3 scripts/fix-nulls.py
"""
import glob, os

fixed = []
for pattern in ['app/**/*.css', 'app/**/*.tsx', 'app/**/*.ts', 'components/**/*.tsx', 'components/**/*.ts']:
    for path in glob.glob(pattern, recursive=True):
        if 'node_modules' in path or '.next' in path:
            continue
        data = open(path, 'rb').read()
        if b'\x00' in data:
            clean = data.replace(b'\x00', b'').rstrip() + b'\n'
            open(path, 'wb').write(clean)
            fixed.append(path)

if fixed:
    print(f'Fixed {len(fixed)} file(s):')
    for f in fixed:
        print(f'  {f}')
else:
    print('No null bytes found — all clean.')
