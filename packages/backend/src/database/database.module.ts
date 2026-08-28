import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from './data-source';

/**
 * Note there is no `poolErrorHandler` here: that option belongs to TypeORM's
 * Postgres driver only (the orchid example uses it because it runs Postgres). The
 * MySQL/MariaDB driver has no equivalent hook — a connection dropped by the
 * server surfaces as an error on the query that next tries to use it, which
 * Nest's own exception layer already logs.
 */
export const DATABASE = TypeOrmModule.forRoot(dataSourceOptions);
