const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Створення Express.js додатку
const app = express();

app.use(cors()); // Перемістити цей рядок після створення об'єкта `app`

// Підключення до бази даних
mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Створення моделі для зберігання зображень
const ImageSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String,
    index: Number,
    title: String,
    categoris: String,
    description: String,
    price: Number
});


const Image = mongoose.model('Image', ImageSchema);

// Налаштування для зберігання зображень
const storage = multer.memoryStorage();
const upload = multer({storage});

// Обробка POST-запиту для завантаження зображень
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const {originalname, buffer, mimetype} = req.file;
        const {title, description, price, categoris} = req.body; // Отримати значення нових полів з тіла запиту

        // Знайти останнє зображення в базі даних за зменшенням індексу
        const lastImage = await Image.findOne().sort({index: -1});

        let index = 1; // Значення індексу для нового зображення

        if (lastImage) {
            // Якщо є останнє зображення, збільшити його індекс на 1
            index = lastImage.index + 1;
        }

        const image = new Image({
            name: originalname,
            data: buffer,
            contentType: mimetype,
            index,
            title, // Додати значення заголовка
            categoris,
            description, // Додати значення опису
            price // Додати значення ціни
        });

        await image.save();
        res.status(200).send('Image uploaded successfully.');
    } catch (err) {
        console.error('Failed to upload image', err);
        res.status(500).send('Failed to upload image.');
    }
});


// Отримання обєкта за індексом
app.get('/imageByIndex/:index', async (req, res) => {
    try {
        const {index} = req.params;
        const image = await Image.findOne({index: Number(index)});
        if (!image) {
            return res.status(404).send('Image not found.');
        }
        res.status(200).json(image);
    } catch (err) {
        console.error('Failed to retrieve image', err);
        res.status(500).send('Failed to retrieve image.');
    }
});


//Отримання всіх обєктів бази даних
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (err) {
        console.error('Failed to retrieve images', err);
        res.status(500).send('Failed to retrieve images.');
    }
});


// Запуск сервера
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
