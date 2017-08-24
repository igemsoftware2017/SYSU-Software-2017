# coding: utf-8
import csv
import xlrd

class CsvCell:
    def __init__(self, text):
        self.value = text
        self.ctype = xlrd.XL_CELL_TEXT


class CsvReadableSheet:
    def __init__(self, file_path):
        with open(file_path, 'r') as csvfile:
            csv_reader = csv.reader(csvfile)
            self.data = []
            for line in csv_reader:
                row = []
                for cell in line:
                    row.append(CsvCell(cell))
                self.data.append(row)
            self.nrows = len(self.data)
            self.ncols = len(self.data[0])

    def cell(self, row, col):
        return self.data[row][col]

    def row(self, row):
        return self.data[row]