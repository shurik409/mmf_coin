const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://shuri409:Sashathisisi1@mmfcoins-i1asg.azure.mongodb.net/test?retryWrites=true";
const crypto = require('crypto');
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



async function setNewUser(userId, userColection, from){
    // const userColection = client.db("mmfcoins").collection("users.balance");

    let user = await userColection.insertOne({
        id: `${userId}`,
        firstName: from.first_name,
        lastName: from.last_name,
        userName: from.username,
        balance: 0,
        operations: [{
            type: 'Create',
            time: new Date(Date.now()).toString()
        }]
    })
    return user.ops[0];
}

const getBalance = async (userId, from) =>{
    console.log(1, userId);

    userData = await new Promise((res, rej) => {
        client = new MongoClient(uri, { useNewUrlParser: true })
        client.connect(async err => {
            if(err) console.log(err);
            let balance = await getBalanceFromClient(client, userId, from);
            client.close();
            res(balance);
        })
    });

    return userData;
}

const getBalanceFromClient = async (client, userId, from) => {
    const userColection = client.db("mmfcoins").collection("users.balance");
    let data = await userColection.findOne({id: `${userId}`});
    let balance;

    if(data){
        console.log('user founded');
        balance = data;
    } else {
        let newUser = await setNewUser(userId, userColection, from);
        console.log('user created');
        balance = newUser;
    }
    return balance;
}


const addToBalance = async (userId, qrHash, from) => {
    userData = await new Promise((res, rej) => {
        client = new MongoClient(uri, { useNewUrlParser: true })
        client.connect(async err => {
            if(err) console.log(err);
            const userColection = client.db("mmfcoins").collection("users.balance");
            const qrCodesColection = client.db("mmfcoins").collection("qrcodes");
            let qrCode = await qrCodesColection.findOne({id: qrHash});
            let data;
            if(!qrCode.activated){
                let balance = await getBalanceFromClient(client, userId, from);
                let count = parseInt(qrCode.value);
                qrCode.activated = true;
                
                balance.balance += count;
                balance.operations.push({
                    type:`Change balance on ${count}`,
                    time: new Date(Date.now()).toString()
                })
                await qrCodesColection.findOneAndReplace({id: qrHash}, qrCode);
                let userBalace = await userColection.findOneAndReplace({id: `${userId}`}, balance);
                data = Object.assign({
                    added: true,
                    text: 'Успешно',
                    addedValue: count
                }, userBalace.value);
            } else {
                data = {
                    added: false,
                    text: 'Этот QrCode уже использовался'
                }
            }
            client.close();
            res(data)
        })
    });
    console.log(2, userData);
    return userData;
}

const addQrCode = async(value, from) => {

    userData = await new Promise((res, rej) => {
        client = new MongoClient(uri, { useNewUrlParser: true })
        client.connect(async err => {
            if(err) console.log(err);
            let balance = await setNewQrCodes(value, client, from);
            client.close();
            res(balance);
        })
    });

    return userData;
}

async function setNewQrCodes(value, client, from){
    const qrCodesColection = client.db("mmfcoins").collection("qrcodes");
    let date = new Date(Date.now()).toString();
    let random = Math.random().toString();
    let hash = crypto.createHash('sha1').update(date + random).digest('hex');
    let fromUser = `${from.first_name} ${from.last_name} `

    let user = await qrCodesColection.insertOne({
        id: hash,
        time: date,
        value: value,
        activated: false,
        creatorFirstName: from.first_name,
        creatorLastName: from.last_name,
        creatorUserName: from.username
    })
    return user.ops[0];
}

module.exports.getBalance = getBalance;
module.exports.addToBalance = addToBalance;
module.exports.addQrCode = addQrCode;