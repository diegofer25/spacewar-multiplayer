import 'module-alias/register';

import { listen } from '@colyseus/tools';

import app from '@src/app.config';

listen(app);
