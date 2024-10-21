// server.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const sqlite3 = require('sqlite3').verbose();

// Cargar el archivo proto
const PROTO_PATH = './user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('database.db');

// Crear tabla de usuarios
db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)');
});

// Implementación de los métodos CRUD
const createUser = (call, callback) => {
  const { name, email } = call.request;
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
    if (err) return callback(err);
    callback(null, { user: { id: this.lastID, name, email } });
  });
};

const getUser = (call, callback) => {
  const { id } = call.request;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return callback(err);
    if (row) callback(null, { user: row });
    else callback({ code: grpc.status.NOT_FOUND, details: 'User not found' });
  });
};

const updateUser = (call, callback) => {
  const { id, name, email } = call.request;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function (err) {
    if (err) return callback(err);
    if (this.changes > 0) callback(null, { user: { id, name, email } });
    else callback({ code: grpc.status.NOT_FOUND, details: 'User not found' });
  });
};

const deleteUser = (call, callback) => {
  const { id } = call.request;
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) return callback(err);
    if (this.changes > 0) callback(null, { message: 'User deleted' });
    else callback({ code: grpc.status.NOT_FOUND, details: 'User not found' });
  });
};

// Inicializar el servidor gRPC
const server = new grpc.Server();
server.addService(userProto.UserService.service, {
  CreateUser: createUser,
  GetUser: getUser,
  UpdateUser: updateUser,
  DeleteUser: deleteUser,
});

const PORT = '50051';
server.bindAsync(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Server running at http://localhost:${PORT}`);
  server.start();
});