import express from 'express';
import { accountsModel } from '../models/accountsModel.js';

const app = express();

app.get('/balance', async (req, res) => {
  try {
    const { agencia, conta } = req.body;
    const account = await accountsModel.findOne({conta: conta, agencia: agencia});
    if (account === null) {
      res.send('account not found')
    }
    res.send(account)
  } catch (err) {
    res.status(500).send(err)
    console.log(err);
  }
});

app.patch('/deposito', async (req, res) => {
  try {
    const { deposit, agencia, conta } = req.body;
    const account = await accountsModel.findOne({conta: conta, agencia: agencia})
    if (account === null) {
      res.send('account not found')
    }
    const newBalance = account.balance + deposit;
    const updatedAccount = await accountsModel.findOneAndUpdate({conta: conta, agencia: agencia},{ balance: newBalance }, {new: true});
    res.send(updatedAccount)
  } catch (error) {
    console.log(error);
  }
})
app.patch('/saque', async (req, res) => {
  try {
    const { saque, agencia, conta } = req.body;
    const account = await accountsModel.findOne({conta: conta, agencia: agencia})
    if (account === null) {
      res.send('account not found')
    }
    const newBalance = account.balance - saque - 1;
    if (newBalance < 0) {
      res.send('Insuficient Funds')
    }
    const updatedAccount = await accountsModel.findOneAndUpdate({conta: conta, agencia: agencia},{ balance: newBalance }, {new: true});
    res.send(updatedAccount)
  } catch (error) {
    console.log(error);
  }
})
app.delete('/delete', async (req, res) => {
  try {
    const { agencia, conta } = req.body;
    const account = await accountsModel.findOneAndDelete({conta: conta, agencia: agencia});
    if (account === null) {
      res.send('account not found')
    }
    const accountsAmountInAgency = await accountsModel.countDocuments({agencia: agencia})
    console.log(accountsAmountInAgency);
    res.send(account)
  } catch (err) {
    res.status(500).send(err)
    console.log(err);
  }
});
app.patch('/transferencia', async (req, res) => {
  try {
    const { origem, destino, valor } = req.body;
    const origin = await accountsModel.findOne({conta: origem})
    const destiny = await accountsModel.findOne({conta: destino})
    if (origin === null || destiny === null) {
      res.send('account not found')
    }
    let newOriginBalance = origin.balance - valor;
    const newDestinyBalance = destiny.balance + valor;
    if (origin.agencia !== destiny.agencia) {
      newOriginBalance -= 8;
    }
    const updatedOrigin = await accountsModel.findOneAndUpdate({conta: origem},{ balance: newOriginBalance }, {new: true});
    const updatedDestiny = await accountsModel.updateOne({conta: destino},{ balance: newDestinyBalance });
    res.send(updatedOrigin)
  } catch (error) {
    console.log(error);
  }
})
app.get('/media', async (req, res) => {
  try {
    const { agencia } = req.body;
    const agencyAccounts = await accountsModel.aggregate(
      [
      {
        $match: 
        {agencia: agencia }
      },
      { 
        $group: 
        { _id: agencia , media: { $avg: "$balance" }
      }}]);
    if (agencyAccounts === null) {
      res.send('agency not found')
    }
    res.send(agencyAccounts)
  } catch (err) {
    res.status(500).send(err)
    console.log(err);
  }
});
app.get('/menores', async (req, res) => {
  try {
    const { contas } = req.body;
    const smallerAccounts = await accountsModel.find({}).sort({balance:1, name: 1}).limit(contas);
    if (smallerAccounts === null) {
      res.send('agency not found')
    }
    res.send(smallerAccounts)
  } catch (err) {
    res.status(500).send(err)
    console.log(err);
  }
});
app.get('/maiores', async (req, res) => {
  try {
    const { contas } = req.body;
    const biggerAccounts = await accountsModel.find({}).sort({balance:-1, name: 1}).limit(contas);
    if (biggerAccounts === null) {
      res.send('agency not found')
    }
    res.send(biggerAccounts)
  } catch (err) {
    res.status(500).send(err)
    console.log(err);
  }
});
app.patch('/vip', async (req, res) => {
  try {
    const agencys = await accountsModel.distinct("agencia")
    const vips = []
    for (let i = 0; i < agencys.length; i++) {
      let agency = agencys[i];
      let accounts = await accountsModel.aggregate([
        {
          $match: { agencia: agency }
        }
      ])
      accounts.sort((a, b) => {
       let f = a.balance
       let g = b.balance
       let result = f > g ? -1 : f < g ? 1 : 0;
       return result;
      })
      let vip =  accounts[0]
      vips.push(vip)
    }
    const updates = []
    for (let i = 0; i < vips.length; i++) {
      let vip = vips[i]
      const updated = await accountsModel.findOneAndUpdate({conta: vip.conta},{ agencia: 99 }, {new: true});
      updates.push(updated)
    }
    res.send([vips, updates]);
  } catch (err) {
    res.status(500).send(err)
    console.log(err);
  }
})
export { app as accountsRouter };