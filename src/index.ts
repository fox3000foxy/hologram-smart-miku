import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { PORT, PUBLIC_DIR } from './config';
import { registerRoutes } from './routes';

const app = express();

// initialize AIML interpreter with data
import { initAiml } from './aiml';
import { botProperties, datasets } from './data';

initAiml(botProperties, datasets.map((f) => `./data/datasets/${f}`));

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(PUBLIC_DIR));

registerRoutes(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
