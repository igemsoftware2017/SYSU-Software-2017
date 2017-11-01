<p align="center"><img src="logo.png"></p>

<h1 align="center">SynBio is just a S-Din away!</h1>
<h3 align="center">SYSU-Software</h3>
</br>

## Introduction

Welcome to S-Din! This is the most powerful **S**earch engine and **D**esign platform for **i**nspiration with **n**etwork analysis in Synthetic Biology ever. 

S-Din (pronouced like /sdin/) your keyword to:

- Search for projects, parts and papers in Synthetic biology

- Get inspired from infomations provided by our software. Don't worry, [our powerful algorithms](http://2017.igem.org/Team:SYSU-Software/Model) will provide you the best infomations, rapidly and accurately.

- Design your circuits. With our design tool, you are enabled to integrate collected circuits and parts. Don't know what to add? Recommendation based on interaction prediction may give you a hand.

- Finished your design? Simulate it in a single click! After simulation, plasmid generator may help in lab validation.

SynBio is just a S-Din away! 

## Requirements

S-Din requires a web browser and a single click: [http://sdin.sysusoftware.info](http://sdin.sysusoftware.info). S-Din it right now!

---

To setup a server, follow this:

* `Django` : Python web framework
* `mysqlclient` and `pmysql` : connect Python to MySQL
* `numpy`and `scipy` : for ODE algorithms in the modeling part
* `requests` : making HTTP requests to get data from our algorithm server
* `xlrd` : for reading excel tables

Here list only the main dependencies. For a complete list, please see `tools/requirements.txt`

## Installation

### Before installation

To install S-Din, firstly, you should make sure the following requirements are satisfied:

* `Python` >= 3.5 : 

    Run `python3 --version` in a command line to check it.

* `MySQL` >= 5.7 :

    Installation differs from different operating systems. Follow your OS's official guide or [MySQL official website](https://dev.mysql.com/downloads/mysql/) to install it. Run `mysql --version` to check installation.
    
    Also make sure that character sets are set to UTF-8. You can follow these guide to set it:

  * **Windows**

    Stop MySQL service firstly

    ~~~powershell
    cd <the root directory of your MySQL>
    create a file named "my.ini"
    ~~~

    Add the flowing codes in "my.ini":

    ~~~ini
    [client]
    default-character-set=utf8
    ~~~

    Then restart your MySQL service

  * **Linux**

    Stop MySQL service firstly

    ~~~shell
    vim /etc/my.cnf
    ~~~

    Add the flowing codes

    ~~~ini
    [client]
    default-character-set=utf8
    [mysqld] 
    default-storage-engine=INNODB  
    character-set-server=utf8  
    collation-server=utf8_general_ci 
    ~~~
    Then restart your MySQL service

  * **macOS**

    First, stop the MySQL service

    ~~~shell
    vim /private/etc/my.cnf
    ~~~

    Add the flowing codes

    ~~~ini
    [client]
    default-character-set=utf8

    [mysql]
    default-character-set=utf8

    [mysqld]
    collation-server = utf8_unicode_ci
    init-connect='SET NAMES utf8'
    character-set-server = utf8
    ~~~

    Then restart your MySQL service

### Installation

* **Clone**

  Clone the repository:

  ~~~shell
  $ git clone https://github/com/igemsoftware2017/SYSU-Software-2017
  ~~~

* **Setting MySQL root account**

  To set up MySQL users used by S-Din, we need your MySQL root account. Modify `SYSU-Software-2017/tools/config.json` like:

  ~~~json
  {	
      "mysql_root_account": "root", 
      "mysql_root_password": "123456"
  }
  ~~~

* **Install**

    The main installation process is packed into scripts. Run `setup.sh` (`Setup.bat` for Windows) for installation. Since the powerful S-Din have enormous data, it may take several minutes to initialize the database. After a cup of coffee, just simply `runserver.sh` (`runserver.bat` for Windows) to launch the server. So easy!

## About

Proudly brought to you by SYSU-Software. Licensed under MIT License.
