const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://shuri409:Sashathisisi1@mmfcoins-i1asg.azure.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    if(err) console.log(err);
    const collection = client.db("mmfcoins").collection("users.balance");
    // collection.insertOne({
    //     id: 'test',
    //     balance: 10
    // })
    collection.findOne({id: 'asd'})
        .then(data => console.log(data));

    // perform actions on the collection object
    client.close();
});

function setNewUser(userId){
    client.connect(err => {
        if(err) console.log(err);
        const userColection = client.db("mmfcoins").collection("users.balance");

        userColection.findOne({id: userId})
            .then(data=> {
                if(!data){
                    userColection.insertOne({
                        id: userId,
                        balance: 0,
                        operations: ['Create']
                    })
                }
            })
    })
}