import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from './data-source';

/**
 * No `poolErrorHandler`: that option is Postgres-only. On MariaDB a dropped
 * connection surfaces on the next query that uses it.
 */
export const DATABASE = TypeOrmModule.forRoot(dataSourceOptions);
