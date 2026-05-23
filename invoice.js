const mongoose = require("mongoose");

const itemSchema = new mangoose.Schema({
    name:{type:String, required:true},
    quantity:{type:Number, required:true},
    unitPrice:{type:Number, required:true},
    taxPercent: {type:Number,default:0},
    total:{type:Number, required:true},
})

const invoiceSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true,
  },

  merchant: String,

  amount: Number,

  tax: Number,

  date: String,

  category: String,

  items: [
    {
      name: String,
      price: Number
    }
  ],

  aiInsight: String,

  fileUrl: String

}, {
  timestamps: true
});

module.exports = mongoose.model("Invoice", invoiceSchema);