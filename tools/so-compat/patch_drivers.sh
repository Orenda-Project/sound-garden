#!/bin/sh
# Re-apply Sound Garden's two edits to freshly copied Sound Out drivers (idempotent).
cd "$(dirname "$0")/tools"
for f in drive drive_levels drive_practice drive_sayit drive_session drive_teacher check_nav check_failed_check; do
  grep -q so_compat $f.py || sed -i '0,/^import /s//import so_compat  # Sound Garden: the app is at #\/play\nimport /' $f.py
  sed -i 's/endswith("Sound Out")/endswith("Sound Garden")/; s/endswith(.Sound Out.)/endswith("Sound Garden")/' $f.py
done
