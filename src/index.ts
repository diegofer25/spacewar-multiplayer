import 'module-alias/register';
import { listen } from '@colyseus/tools';

import app from '@src/app.config';

// Create and listen on 2567 (or PORT environment variable.)
listen(app);
