#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/access_lib.sh"

THRESHOLD_CRIT_DAYS=${THRESHOLD_CRIT_DAYS:-7}
THRESHOLD_WARN_DAYS=${THRESHOLD_WARN_DAYS:-30}
THRESHOLD_INFO_DAYS=${THRESHOLD_INFO_DAYS:-90}
FILTER_TAG=${FILTER_TAG:-readyz}

list_tokens(){
  cf_get "${BASE}/service_tokens" | jq -r '.result[] | @base64'
}

decode(){ echo "$1" | base64 --decode; }

days_until(){
  local iso="$1"
  python3 - "$iso" <<'PY'
import sys,datetime
iso=sys.argv[1]
if iso.endswith('Z'): iso=iso[:-1]+"+00:00"
exp=datetime.datetime.fromisoformat(iso)
now=datetime.datetime.now(datetime.timezone.utc)
delta=exp-now
print(int(delta.total_seconds()//86400))
PY
}

status=0
echo "token,expires_at,days_left,name,tags" 
while IFS= read -r enc; do
  row=$(decode "$enc")
  name=$(echo "$row" | jq -r '.name')
  tags=$(echo "$row" | jq -r '.tags | join(";")')
  # filter to our tag if present
  if [[ -n "$FILTER_TAG" ]] && ! echo "$tags" | grep -q "$FILTER_TAG"; then
    continue
  fi
  exp=$(echo "$row" | jq -r '.expires_at')
  days=$(days_until "$exp")
  echo "$name,$exp,$days,$name,$tags"
  if (( days <= THRESHOLD_CRIT_DAYS )); then status=2; fi
  if (( status < 2 && days <= THRESHOLD_WARN_DAYS )); then status=1; fi
done < <(list_tokens)

exit $status










