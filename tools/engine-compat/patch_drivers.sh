#!/bin/sh
# Re-apply Sound Garden's two edits to freshly copied drivers (idempotent).
cd "$(dirname "$0")/tools"
for f in drive drive_levels drive_practice drive_sayit drive_session drive_teacher check_nav check_failed_check; do
  grep -q engine_compat $f.py || sed -i '0,/^import /s//import engine_compat  # Sound Garden: the app is at #\/play\nimport /' $f.py
done
python3 "$(dirname "$0")/patch_hatch.py"
