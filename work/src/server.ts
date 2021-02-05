import * as express from "express";

const app = express();
const port = 3000;

app.get("/", (req: any, res: any) => {
  res.send("Hello world");
});

const server = app.listen(port, () => {
  console.log("listening on *:3000");
})