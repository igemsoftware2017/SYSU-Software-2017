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


class CsvWritableSheet:
    def __init__(self, file_path):
        self.buffer = []
        self.csv_writer = csv.writer(open(file_path, mode="w", newline="\n", encoding="utf-8"))

    def write(self, row, col, text):
        CsvWritableSheet.ensure_list_capacity(self.buffer, row + 1, [])
        CsvWritableSheet.ensure_list_capacity(self.buffer[row], col + 1, '')
        self.buffer[row][col] = text

    def flush(self):
        if len(self.buffer) > 0:
            self.csv_writer.writerows(self.buffer)
            self.buffer = []

    def close(self):
        self.flush()

    @staticmethod
    def ensure_list_capacity(li, expected_capacity, fill_element):
        if len(li) < expected_capacity:
            for i in range(expected_capacity - len(li)):
                li.append(fill_element)