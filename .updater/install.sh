#! /bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

(crontab -l 2>/dev/null; echo "*/1 * * * * cd $SCRIPT_DIR && ./check.sh >> check.log 2>&1") | sudo crontab -
(crontab -l 2>/dev/null; echo "0 * * * * cd $SCRIPT_DIR && tail -1000 check.log | cat > check.log") | sudo crontab -
