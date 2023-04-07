#! /bin/bash
# Installs updater using cron
# Logs output to `update.log`
#
#
# 1) Cron doesnt know the script directory so find out where it is
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# 2) Check git every minute to compare remote with local, log to `update.log`
(crontab -l 2>/dev/null; echo "*/1 * * * * cd $SCRIPT_DIR && ./check.sh >> update.log 2>&1") | sudo crontab -
# 3) Every hour, trim the logs to last 1000 lines
(crontab -l 2>/dev/null; echo "0 * * * * cd $SCRIPT_DIR && tail -1000 update.log | cat > update.log") | sudo crontab -
