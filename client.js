const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const client = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());

// Crear un usuario
client.CreateUser({ name: 'John Doe', email: 'john@example.com' }, (err, response) => {
  if (err) console.error(err);
  else console.log('User created:', response.user);
});

// Obtener un usuario
client.GetUser({ id: 1 }, (err, response) => {
  if (err) console.error(err);
  else console.log('User retrieved:', response.user);
});

// Actualizar un usuario
client.UpdateUser({ id: 1, name: 'John Updated', email: 'john.updated@example.com' }, (err, response) => {
  if (err) console.error(err);
  else console.log('User updated:', response.user);
});

// Eliminar un usuario
client.DeleteUser({ id: 1 }, (err, response) => {
  if (err) console.error(err);
  else console.log('User deleted:', response.message);
});