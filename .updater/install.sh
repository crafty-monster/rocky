#! /bin/bash
#
# Installs updater using cron+git
# Check git every minute to compare remote with local
# Logs output to `update.log`
#
#
echo "ROCKY Minecraft Server Controller Updater"
echo ""
echo "This updater script will elevate permissions to 'root' so it can sudo docker calls inside 'check.sh' without a problem."
echo "If you dont feel comfortable with this feel free to do this some other way."
# 1) Cron doesnt know the script directory so find out where it is
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# 2) Check git remote with local, log to `update.log`
(sudo crontab -l 2>/dev/null; echo "*/1 * * * * cd $SCRIPT_DIR && ./check.sh >> update.log 2>&1") | sudo crontab -
# 3) Keep the logs trimmed to last 1000 lines
(sudo crontab -l 2>/dev/null; echo "0 * * * * cd $SCRIPT_DIR && tail -1000 update.log | cat > update.log") | sudo crontab -
# Done
crontab -l
echo ""
echo "Rocky updater installed. Check the 'update.log' in a minute or two."
