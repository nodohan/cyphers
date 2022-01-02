if [ $(ps -ef | grep node | grep server.js | wc -l) -eq 1 ]
then
	echo $TITLE 'server.js stop..'
	kill -9 $(ps -ef | grep node | grep server.js | grep -v grep | awk '{print $2}')
	ISRUNNING=0
	while [ $ISRUNNING -lt 30 ]
	do
		#echo $TITLE 'result check..'
		if [ $(ps -ef | grep node | grep server.js | wc -l) -eq 0 ]
		then
			echo $TITLE 'server.js is STOP SUCCESS!'
			ISRUNNING=30
		else
			sleep 1
			ISRUNNING=`expr $ISRUNNING + 1`
			#echo $TITLE 'try again' $ISRUNNING
			if [ $ISRUNNING -eq 30 ]
			then
				echo $TITLE 'server.js STOP FAIL!!!!'
			fi
		fi
	done
else
	echo $TITLE 'server.js has already been stoped'
fi  