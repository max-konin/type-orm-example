import 'reflect-metadata';
import { createConnection, getConnectionOptions, Connection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const buildConnection = () : Promise<Connection> => getConnectionOptions().then(connectionOptions => {
  return createConnection(
    Object.assign(connectionOptions, {
      namingStrategy: new SnakeNamingStrategy()
    })
  );
});
