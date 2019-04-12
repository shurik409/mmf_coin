const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://shuri409:Sashathisisi1@mmfcoins-i1asg.azure.mongodb.net/test?retryWrites=true";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//     if(err) console.log(err);
//     const collection = client.db("mmfcoins").collection("users.balance");
//     // collection.insertOne({
//     //     id: 'test',
//     //     balance: 10
//     // })
//     collection.
//     collection.findOne({id: 'asd'})
//         .then(data => console.log(data));


//     // perform actions on the collection object
//     client.close();
// });

async function setNewUser(userId, userColection){
    // const userColection = client.db("mmfcoins").collection("users.balance");

    let user = await userColection.insertOne({
        id: `${userId}`,
        balance: 0,
        operations: ['Create']
    })
    return user.ops[0];
}

const getBalance = async (userId) =>{
    console.log(1, userId);

    userData = await new Promise((res, rej) => {
        client = new MongoClient(uri, { useNewUrlParser: true })
        client.connect(async err => {
            if(err) console.log(err);
            const userColection = client.db("mmfcoins").collection("users.balance");
            let data = await userColection.findOne({id: `${userId}`});
            if(data){
                console.log('user founded');
                client.close();
                res(data);
            } else {
                let newUser = await setNewUser(userId, userColection);
                console.log('user created');
                client.close();
                res(newUser);
            }
        })
    });

    return userData;
}

const addToBalance = async (userId, count) => {
    userData = await new Promise((res, rej) => {
        client = new MongoClient(uri, { useNewUrlParser: true })
        client.connect(async err => {
            if(err) console.log(err);
            const userColection = client.db("mmfcoins").collection("users.balance");
            console.log(0);
            let balance = await getBalance(userId)
            balance.balance += count;
            console.log(0, balance);
            let data = await userColection.findOneAndReplace({id: `${userId}`}, balance);
            console.log(1,data);
            res(data.value)
        })
    });
    console.log(2, userData);
    return userData;
}

module.exports.getBalance = getBalance;
module.exports.addToBalance = addToBalance;