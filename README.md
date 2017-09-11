# IGEM2017-SYSU.Software

## Dependence

- python3.5
    + django 1.11.4
    + mysqlclient 1.3.12
    
- MySQL 5.7.19

## Note

1. Create igem2017/igem2017/mysql.cnf file with information to access your MySQL.

   For example:
   ```
   [client]
   database = DATABASENAME
   user = USER
   password = PASSWORD
   default-character-set = utf8
   ```
2. parts_type:
	1.CDS
	2.RBS
	3.promoter
	4.terminator
	5.material：一些非蛋白的化学物质，如IPTG
	6.light：如光
	7.protein:
	8.process: 如细胞的分裂，通透性增加等
	9.RNA：
	10.protein-m:膜上蛋白
	11.protein-l：发光蛋白
	12.complex 两种物质在图中结合后的产物
	13.other_DNA：如tag，primer等
	14.composite
	15.generator
	16.reporter
	17.inverter
	18.signalling
	19.measurement
	20.unknown：以上东西都无法描述的东西

