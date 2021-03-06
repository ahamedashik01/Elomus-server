const { MongoClient } = require('mongodb');
const express = require('express');
var cors = require('cors');
require('dotenv').config();

const ObjcetId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// uri 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cdlp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// client 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('client connected');

        const database = client.db('elomus');
        //PRODUCT DATA 
        const productCollection = database.collection('products');
        //ORDER DATA 
        const orderCollection = database.collection('orders');
        //USER DATA
        const userCollection = database.collection('users');



        //USER METHOD

        //POST 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // PUT
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user, "hitting");
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });

        //PRODUCT METHOD 

        //GET 
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjcetId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        })

        //POST 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result);

        });

        //DELETE 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjcetId(id) }
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })


        //ORDER METHOD

        //POST
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        //GET
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // PUT
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjcetId(id) }
            const updateStatus = order.status;
            const updateDoc = {
                $set: {
                    updateStatus: "Shipped"
                }
            };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result);
        })

        //DELETE
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjcetId(id) }
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('ROOT OF Elomus SERVER')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});