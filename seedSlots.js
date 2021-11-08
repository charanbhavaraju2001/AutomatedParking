const mongoose = require('mongoose');
const Slot = require('./models/slots');

mongoose.connect('mongodb+srv://charan:charan@cluster0.qbshq.mongodb.net/testDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});


const seedDB = async () => {
    await Slot.deleteMany({});
    for (let i = 1; i <= 32; i++) {
        const slot = new Slot({
            slotid: i,
            user: '',
            status: 'unoccupied',
            enteredat: null,
            leftat: null
        })
        await slot.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})