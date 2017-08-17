def drop_table_if_exists(db, table_name):
    """
    如果表存在则删除表
    :param db: 数据库连接
    :param table_name: 表名
    :return:
    """
    cursor = db.cursor()
    cursor.execute('DROP TABLE IF EXISTS ' + table_name)


def create_table_if_not_exists(db, table_name, column_names, column_types=None):
    """
   如果表不存在则创建表
   :param db: 数据库连接
   :param table_name: 表名
   :param column_names: 列名称
   :param column_types: 列类型，默认均为Text
   :return:
   """
    cursor = db.cursor()
    if column_types is None:
        sql = 'CREATE TABLE IF NOT EXISTS ' + table_name + " (`" + '` TEXT, `'.join(column_names) + '` TEXT )'
    else:
        sql = 'CREATE TABLE IF NOT EXISTS ' + table_name + " (" + ', '.join(map(
            lambda column: '`' + column[0] + '` ' + column[1],
            zip(column_names, column_types))) + ')'
    cursor.execute(sql)
