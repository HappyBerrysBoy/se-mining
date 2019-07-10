forever stop `forever list | grep  | grep scheduler | awk '{print $3}'`

cd ~/project/se-mining/engine-api
forever start -l scheduler.log -e scheduler.error.log -a 

