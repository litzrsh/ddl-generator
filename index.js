const fs = require('fs');

var list = fs.readFileSync('./data.txt', 'utf-8').replace(/\r/g, '').replace(/\n$/g, '').split('\n');
var tables = {};

list.forEach((item, i) => {
  var c = item.split(',');
  var tableComment = c[0];
  var tableName = c[1];
  var columnComment = c[2];
  var columnName = c[3];
  var dataType = c[4];
  var pk = ('Y' == c[5]);
  var notNull = ('Y' == c[6]);
  var def = c[7];

  tables[tableName] = tables[tableName] || {
    comment: c[0],
    columns: [],
    pk: []
  };

  tables[tableName].columns.push({
    name: columnName,
    comment: columnComment,
    dataType: dataType,
    notNull: notNull,
    default: def
  });

  if (pk) {
    tables[tableName].pk.push(columnName);
  }
});

var query = [];

for (var tn in tables) {
  var table = tables[tn];

  query.push(`DROP TABLE IF EXISTS ${tn};`);
  query.push(`CREATE TABLE ${tn} (`);

  var columnQuery = [];
  table.columns.forEach(column => {
    var q = [' ', column.name, column.dataType];
    if (column.notNull) {
      q.push('NOT NULL');
    }
    if (column.default) {
      q.push(`DEFAULT ${column.default}`);
    }
    q.push(`COMMENT '${column.comment}'`);
    columnQuery.push(q.join(' '));
  });
  columnQuery.push(`  CONSTRAINT PK_${tn} PRIMARY KEY (${table.pk.join(', ')})`);
  query.push(columnQuery.join(',\r\n'));

  query.push(`);`);
  query.push('');
}

fs.writeFileSync('./query.sql', query.join('\r\n'));
