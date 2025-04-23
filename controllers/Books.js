const fs = require("fs").promises;
const { log } = require("console");
const Book = require("../models/Book");

exports.getAllBooks = function (req, res, next) {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = function (req, res, next) {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestRating = async (req, res, next) => {

  const getTopRatedBooks = async () => {
    try {
      const topRatedBooks = await Book.find()
        .sort({ averageRating: -1 }) // Tri par note décroissante
        .limit(3); // Limiter aux trois premiers
      return topRatedBooks;
    } catch (error) {
      throw error;
    }
  }

  try {
    const topRatedBooks = await getTopRatedBooks();
    res.json(topRatedBooks);
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue' });
  }
  // res.status(200).json({message:'operation réussis'});
};

exports.postNewBook = function (req, res, next) {
  console.log('oui')
  const receivedBook = JSON.parse(req.body.book);
  delete receivedBook._id;
  delete receivedBook._userId;
  const book = new Book({
    ...receivedBook,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename.split('.jpg')[0]}.webp`,
    averageRating: receivedBook.ratings[0].grade
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.updateBook = function (req, res, next) {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Non autorisé" });
      } else {
        if (req.file) {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`);
      }
      const dataReceived = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename.split('.jpg')[0]}.webp`,
        }
      : { ...req.body };
      delete dataReceived._userId;
        Book.updateOne(
            { _id: req.params.id },
            { ...dataReceived, _id: req.params.id }
          )
          .then(res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) => res.status(400).json({ error }));
      }
      console.log(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteOneBook = function (req, res, next) {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Non autorisé !" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Objet supprimé !" });
          })
          .catch((error) => res.status(401).json({ error }));
        fs.unlink(`images/${filename}`)
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.postRating = function (req, res, next) {
  const rating = {
    userId: req.body.userId,
    grade: req.body.rating,
  };
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      book.ratings.push(rating);
      const totalRating = book.ratings.length;
      const sumTotalRating = book.ratings.reduce(
        (accumulateur, valeurCourante) => accumulateur + valeurCourante.grade, 0,
      );
      book.averageRating = Math.ceil(sumTotalRating / totalRating)
      book.save()
      res.status(201).json(book)
    })
    .catch((error) => res.status(401).json({ error }));
};

// exports.deleteRating = function (req, res, next) {
//   console.log(req);
//   Book.findOne({ _id: req.params.id })
//   .then((book) => {
//     const rated = book.ratings.find(rating => rating.userId === req.params.userId);
//     if (rated) {
//       console.log('Yessssss');
//         res.status(200).json({message : 'YAYYY'})
//     } else {
//       res.status(404).json({ error: error });
//     }
// })
//   .catch((error) => res.status(400).json({ error: error }));
// }
