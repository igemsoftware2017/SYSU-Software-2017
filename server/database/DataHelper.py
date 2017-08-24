# coding: utf-8

from server.iGEMOption import *
import server.database.CsvSheet as CsvSheet
import os


class DataHelper:
    def __init__(self, option_set, db_conn):
        """
        :param option_set: 选项，参见 EpredOption
        :param db_conn: 数据库连接
        """
        self.option_set = option_set
        self.input_dir = DataHelper.get_input_dir(option_set)
        self.db_conn = db_conn


    def import_input_files(self, folder_path):
        """
        导入输入文件。将选项所需的输入文件导入到数据库
        :param folder_path: 输入文件夹路径，以 / 或 \ 结束
        :return:
        """
        for dir_name in self.input_dir:
            self.import_files(dir_name, folder_path + os.sep + self.input_dir[dir_name])


    def import_files(self, table_name, folder_path):
        for root, dirs, files in os.walk(folder_path):
            for name in files:
                self.import_file(table_name, os.path.join(root, name))


    def import_file(self, table_name, file_path):
        if table_name == "parts":
            Readable_sheet = CsvSheet.CsvReadableSheet(file_path)


    @staticmethod
    def get_input_dir(option_set):
        if option_set == import_part:
            return {"parts"  : "parts" }
        elif option_set == import_circuit:
            return {"circuit": "circuit"}
        elif option_set == import_works:
            return {"works"  :  "works"}
        elif option_set == import_all:
            return {
                "parts"  : "parts",
                "circuit": "circuit",
                "works"  :  "works"
            }



