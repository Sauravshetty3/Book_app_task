const router = require("express").Router();
var fs = require("fs");
var rp = require("request-promise");
const csvtojsonV2 = require("csvtojson");
const { findSourceMap } = require("module");
const converter = require("json-2-csv");

router.get("/books-magazines", async(req, res) => {
    console.log("hi");
    try {
        let book = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/books.csv"
        );

        let magazine = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/magazines.csv"
        );

        res.status(222).send({ book: book, magazine: magazine });
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
});

router.get("/:type/:isbn", async(req, res) => {
    try {
        // Type - Book
        if (req.params.type === "book") {
            let book_data = await bookToCsc(
                "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/books.csv"
            );
            var filetered_book = book_data.filter((o) =>
                Object.values(o).includes(req.params.isbn)
            );
            if (filetered_book.length === 0) {
                return res.status(400).send("Invalid Book ISBN!");
            }
            return res.status(200).send(filetered_book);
        }

        // Type - Magazine
        if (req.params.type === "magazine") {
            let magazine_data = await bookToCsc(
                "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/magazines.csv"
            );
            var filetered_magazine = magazine_data.filter((o) =>
                Object.values(o).includes(req.params.isbn)
            );
            if (filetered_magazine.length === 0) {
                return res.status(400).send("Magazine ISBN not valid!");
            }
            return res.status(200).send(filetered_magazine);
        }
        return res.status(400).send("Invalid Input");
    } catch (error) {
        console.log(error);
    }
});

router.get("/author/by_email/:author_mail", async(req, res) => {
    try {
        let magazine_data = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/magazines.csv"
        );
        var filtered_magazine = magazine_data.filter(
            (data) => data.authors == req.params.author_mail
        );
        let book_data = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/books.csv"
        );
        let filtered_book = book_data.filter(
            (data) => data.authors == req.params.author_mail
        );

        return res
            .status(200)
            .send({ book: filtered_book, magazine: filtered_magazine });
        // if (req.params.authorMail === magazine_data.) {}
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/books/sort_byorder/alphabhetical", async(req, res) => {
    try {
        let books = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/books.csv"
        );
        let magzines = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/magazines.csv"
        );
        var book_mag = books.concat(magzines);
        let sorted_data = book_mag.sort((a, b) => a.title.localeCompare(b.title));
        console.log(book_mag);

        return res.status(200).send(sorted_data);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/download_csv", async(req, res) => {
    try {
        let books = await bookToCsc(
            "https://raw.githubusercontent.com/echocat/nodejs-kata-1/master/data/books.csv"
        );

        converter.json2csv(books, (err, csv) => {
            if (err) {
                throw err;
            }

            // print CSV string
            console.log(csv);

            // write CSV to a file
            fs.writeFileSync("books.csv", csv);
            const file = `./books.csv`;
            return res.download(file);
        });
    } catch (error) {
        console.log(error);
    }
});
// Function
let bookToCsc = async(url) => {
    const data = await rp(url);
    const csv = data.replaceAll(";", ",");
    const output = await csvtojsonV2({
        output: "json",
    }).fromString(csv);
    return output;
};

module.exports = router;