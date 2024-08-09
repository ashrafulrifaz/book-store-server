const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb').MongoClient;
const uri = `mongodb+srv://ashrafulislamrifaz:VQ6rWGSDgNlptVc8@cluster0.rejbvaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});

async function run() {
    try {

      const bookCollection = client.db('Book_Store_Management').collection('books')
      const preOrderCollection = client.db('Book_Store_Management').collection('pre-order')

      app.get('/all-books', async(req, res) => {
        const result = await bookCollection.find().toArray() 
        res.send(result)
      })

      app.get('/pre-orders', async(req, res) => {
        const result = await preOrderCollection.find().toArray() 
        res.send(result)
      })
      
      app.post('/new-book', async(req, res) => {
        const book = req.body
        const result = await bookCollection.insertOne(book)
        res.send(result)
      })

      app.post('/new-preorder', async(req, res) => {
        const preOrder = req.body
        const isCustomerExist = await preOrderCollection.find({customerName: preOrder.customerName}).toArray()        
        
        if(isCustomerExist.length > 0){
          const updateResult = await preOrderCollection.updateOne(
            { customerName: preOrder.customerName },
            { $push: { orderedBooks: { $each: preOrder.orderedBooks } } }
          );
          res.send(updateResult);
        } else {
          const result = await preOrderCollection.insertOne(preOrder)
          res.send(result)
        }
      })

      app.delete('/remove-book/:id', async(req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const result = await bookCollection.deleteOne(filter)
        res.send(result)
      })

      app.patch('/edit-book/:id', async(req, res) => {
        const id = req.params.id;
        const updateBook = req.body
        const filter = {_id: new ObjectId(id)}
        const book = {
          $set: {
            name: updateBook.name,
            price: updateBook.price,
            description: updateBook.description
          }
        }
        const result = await bookCollection.updateOne(filter, book)
        res.send(result)
      })
      
      app.patch('/preorder/:id', async(req, res) => {
        const id = req.params.id;
        const updatePreOrder = req.body
        const filter = {_id: new ObjectId(id)}
        const preOrder = {
          $set: {
            customerName: updatePreOrder.customerName,
            customerNumber: updatePreOrder.customerNumber,
            orderedBooks: updatePreOrder.orderedBooks
          }
        }
        const result = await preOrderCollection.updateOne(filter, preOrder)
        res.send(result)
      })

    //   await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Book Store Server')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})