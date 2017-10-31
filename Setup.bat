@echo Seting up S-din...
@python3 VenvSetup.py
@IF %ERRORLEVEL% NEQ 0 goto error
@.env\Scripts\python3 -m pip install --upgrade pip
@IF %ERRORLEVEL% NEQ 0 goto error
@cd tools
@..\.env\Scripts\pip install -r requirements.txt
@IF %ERRORLEVEL% NEQ 0 goto error
@..\.env\Scripts\python3 DbInit.py
@IF %ERRORLEVEL% NEQ 0 goto error
@cd ..\
@cd igem2017
@RD /S /Q  sdin\migrations
@..\.env\Scripts\python3 manage.py makemigrations sdin
@IF %ERRORLEVEL% NEQ 0 goto error
@..\.env\Scripts\python3 manage.py migrate
@IF %ERRORLEVEL% NEQ 0 goto error 
@..\.env\Scripts\python3 manage.py shell < init.py
@IF %ERRORLEVEL% NEQ 0 goto error
@cd ..\
@echo S-Din has successfully set up!
@echo please click runserver.bat to start the server
@pause
@exit

error:
@echo Set up has failed
@pause
@exit