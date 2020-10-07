import mongoose from 'mongoose';
//creating model schema
const accountSchema = mongoose.Schema({
  agencia: {
    type: Number,
    required: true,
  },
  conta: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    validate(value) {
      if (value < 0) throw new Error('Negative value for balance')
    }
  },
});
//defining model for our collection with created schema  
const accountsModel = mongoose.model('accounts', accountSchema, 'accounts');
export { accountsModel };