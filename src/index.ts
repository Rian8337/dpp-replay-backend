import express from "express";
import cors from "cors";
import formData from "express-form-data";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(formData.parse({ maxFilesSize: 10000000 }));
app.use(formData.format());
app.use(formData.stream());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
    //@ts-expect-error bye
    console.dir(req.files, { depth: null });
    res.send("i love php");
});

const port = parseInt(process.env.PORT || "3005");

app.listen(port, () => console.log("Up"));
