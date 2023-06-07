import express from "express";
import bodyParser from 'body-parser'
import { cutImageHandler } from './controllers/cutImage'

const app = express();
const port = process.env.PORT || "8080";
// 设置时区

app.use(express.static('public'))

// post参数解析
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/cut", cutImageHandler);

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
