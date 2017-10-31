<p align="center"><img src="bk.png"></p>

<p align="center"><strong>Welcome ! </strong></p>

## Introduction

Welcome to S-Din! This is the most powerful Search Engine and Design Platform for your idea inspiration and design process in Synthetic Biology. 

* Search for previous projects, parts and papers in Synbio field and get inspired with the connection behind them dug by 2017 SYSU-Software. All the search results are powered by our algorithms(http://2017.igem.org/Team:SYSU-Software/Model) behind.

* Design and integrate previous circuits and parts with the help of seamless feature of our S-Din. Relationship recommendation among the basic level of parts helps for the idea inspiration.

* Simulation and plasmid generator make S-Din an academic software with reliable   lab validation. Want to save your time and resource before real experiments? Use S-Din in your final step!

SYNBIO IS JUST S-DIN AWAY! 

## Requirements

Here list only the main dependencies. For a complete list, please see `tools/requirements.txt`

* `Django` : Python web backend microframework
* `mysqlclient`  : For django to connect to mysql  
* `numpy`and `scipy` : ODE solver for the modeling part
* `requests` : A Library for HTTP
* `xlrd` : read excel documents
* `pymysql` : mysql connector

## Installation

### prepare

To install S-Din, firstly, you should make sure the following requirements are satisfied:

* `python 3.5` : This is required for running  the codes and you should make sure that it can be used by type in "python3" in command line.

* `mysql 5.7` : This is required for storing data for our software.You can download from https://dev.mysql.com/downloads/mysql/ . And you should make sure that the character sets are set to be 'utf8'. Here are the ways to do that:

  * **windows**

    Stop mysql service firstly

    ~~~powershell
    cd <the root directory of your mysql>
    create a file named "my.ini"
    ~~~

    Add the flowing codes in "my.ini":

    ~~~powershell
    [client]
    default-character-set=utf8
    ~~~

    Then restart your mysql service

  * **Linux**

    Stop mysql service firstly

    ~~~shell
    vim /etc/my.cnf
    ~~~

    Add the flowing codes

    ~~~shell
    [client]
    default-character-set=utf8
    [mysqld] 
    default-storage-engine=INNODB  
    character-set-server=utf8  
    collation-server=utf8_general_ci 
    ~~~
    Then restart your mysql service

  * **Mac os**

    First, stop the mysql service

    ~~~shell
    vim /private/etc/my.cnf
    ~~~

    Add the flowing codes

    ~~~shell
    [client]
    default-character-set=utf8

    [mysql]
    default-character-set=utf8

    [mysqld]
    collation-server = utf8_unicode_ci
    init-connect='SET NAMES utf8'
    character-set-server = utf8
    ~~~

    Then restart your mysql service

### Start Installation

* **Clone**

  You can clone down the repository by:

  ~~~shell
  $ git clone https://github/com/igemsoftware2017/SYSU-Software-2017
  ~~~

* **Setting mysql root account**

  To install our software well, you should first configure the mysql root account at `SYSU-Software-2017/tools/config.json`

  An example is provided:

  ~~~json
  {	
    	"mysql_root_account": "root", 

  	"mysql_root_password": "123456"
  }
  ~~~

* **Install**

  After finished the above steps , you can install S-Din by simple steps!

  * **Windows**

    Enter the SYSU-Software-2017, then click `Setup.bat`. Then you can go for a cup of tea waiting for it to be completed.After it completed, you can click `runserver.bat` to start server.

  * **Linux/Mac os**

    ~~~shell
    cd SYSU-Software-2017
    sh setup.sh
    sh runserver.sh
    ~~~

## About

Developed by SYSU-Software team. Base on MIT License.





