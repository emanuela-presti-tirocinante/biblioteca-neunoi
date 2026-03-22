const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

async function fixUsersSchema() {
  console.log('Lettura schema attuale della tabella Users...');
  const [columns] = await sequelize.query('PRAGMA table_info(Users)');
  const existingCols = columns.map(c => c.name);
  console.log('Colonne trovate nel DB:', existingCols);

  const toAdd = [
    { name: 'last_login',       sql: 'ALTER TABLE Users ADD COLUMN last_login DATETIME' },
    { name: 'telefono',         sql: 'ALTER TABLE Users ADD COLUMN telefono VARCHAR(255)' },
    { name: 'tipo_documento',   sql: 'ALTER TABLE Users ADD COLUMN tipo_documento VARCHAR(255)' },
    { name: 'numero_documento', sql: 'ALTER TABLE Users ADD COLUMN numero_documento VARCHAR(255)' },
    { name: 'documento_path',   sql: 'ALTER TABLE Users ADD COLUMN documento_path VARCHAR(255)' },
  ];

  for (const col of toAdd) {
    if (!existingCols.includes(col.name)) {
      await sequelize.query(col.sql);
      console.log('Aggiunta colonna: ' + col.name);
    } else {
      console.log('Gia presente, saltata: ' + col.name);
    }
  }

  await sequelize.close();
  console.log('Fix completato!');
}

fixUsersSchema().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
