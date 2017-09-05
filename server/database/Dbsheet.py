# coding: utf-8

import server.database.DatabaseHelper as DatabaseHelper
import xlrd

"""
将excel和数据库互相读写的类
"""


class DbSheet:
    def __init__(self, db_conn, table_name):
        """
        :param db_conn: MySQL数据库连接
        :param table_name: 要读写的数据库表名
        """
        self.db_conn = db_conn
        self.table_name = table_name

    def drop_table_if_exists(self):
        """
        如果表存在则删除表
        :return:
        """
        DatabaseHelper.drop_table_if_exists(self.db_conn, self.table_name)

    def create_table_if_not_exists(self, column_names, column_types):
        """
        如果表不存在则创建表
        :return:
        """
        DatabaseHelper.create_table_if_not_exists(self.db_conn, self.table_name, column_names, column_types)

    def transfer_excel_to_db(self, readable_sheet, column_names=None, column_types=None, commit=True):
        """
        把excel表写入到数据库（附加到数据库表末尾）
        :param readable_sheet: excel表, xlrd的worksheet
        :param column_names: 列名称，如果不指定，则把Excel表的第一行作为表头，从第二行开始作为数据
        :param column_names: 列类型，如果不指定，默认全部为Text
        :param commit: 是否提交数据库写入,为False则需要手动提交
        :return:
        """
        data_row_start = 0
        if column_names is None:
            (column_names, column_types) = self.get_column_from_sheet(readable_sheet)
            data_row_start = 1
        self.create_table_if_not_exists(column_names, column_types)
        cursor = self.db_conn.cursor()
        for i in range(data_row_start, readable_sheet.nrows):
            sql = "INSERT INTO " + self.table_name + "(`" + '`, `'.join(column_names) + "`) VALUES (" + ', '.join(
                map(lambda cell: self.pack_cell(cell), readable_sheet.row(i))) + ')'
            print(sql)
            cursor.execute(sql)
        if commit:
            self.db_conn.commit()

    @staticmethod
    def get_column_from_sheet(readable_sheet):
        column_names = []
        column_types = []
        for i in range(readable_sheet.ncols):
            column_names.append(DbSheet.cell_to_str(readable_sheet.cell(0, i)))
            column_types.append(DbSheet.cell_type_to_str(readable_sheet.cell(1, i)))
        return (column_names, column_types)

    @staticmethod
    def pack_cell(cell):
        if cell.ctype == xlrd.XL_CELL_TEXT:
            return "'" + cell.value + "'"
        else:
            return str(cell.value)

    @staticmethod
    def cell_type_to_str(cell):
        if cell.ctype == xlrd.XL_CELL_TEXT:
            return 'TEXT'
        elif cell.ctype == xlrd.XL_CELL_NUMBER:
            if isinstance(cell.value, int):
                return 'INT'
            return 'DOUBLE'

    @staticmethod
    def cell_to_str(cell):
        if cell.ctype == xlrd.XL_CELL_TEXT:
            return cell.value
        else:
            return str(cell.value)

    def transfer_db_to_excel(self, writable_sheet, column_names=None):
        """
        把数据库表的数据写入到excel表中（覆盖excel表原数据）
        :param writable_sheet: xlsxwriter的worksheet
        :param column_names: 列名称，将会写入到excel表的第一行，如果不指定，则把数据库表的列名称写入
        :return:
        """
        if column_names is None:
            column_names = self.get_column_name_from_db()
        cursor = self.db_conn.cursor()
        sql = 'SELECT * FROM ' + self.table_name
        cursor.execute(sql)
        results = cursor.fetchall()
        col_count = 0
        for column_name in column_names:
            writable_sheet.write(0, col_count, column_name[0])
            col_count += 1
        row_count = 1
        for row in results:
            col_count = 0
            for cell in row:
                writable_sheet.write(row_count, col_count, cell)
                col_count += 1
            row_count += 1

    def get_column_name_from_db(self):
        sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.Columns WHERE TABLE_NAME = '%s'" % self.table_name
        cursor = self.db_conn.cursor()
        cursor.execute(sql)
        return cursor.fetchall()