import cors                                         from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import endpoints                                    from './endpoint';

const setCacheHeader = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const period = 60 * 60;

  if (req.method == 'GET') {
    res.set('Cache-control', `public, max-age=${period}`);
  } else {
    res.set('Cache-control', `no-store`);
  }

  next();
};

const app = express();
app.use(cors());

// apply cache header for all get requests
app.use(setCacheHeader);
endpoints(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`APP_LOG::App listening on port ${PORT}`);
});

module.exports = app;
