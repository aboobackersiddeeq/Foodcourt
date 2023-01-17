const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: {
    type: [{
      name: {
        type: String,
      },
      mob: {
        type: Number,
      },
      house: {
        type: String,
      },
      landmark: {
        type: String,
      },
      city: {
        type: String,
      },
      district: {
        type: String,

      },
      state: {
        type: String,

      },
      pincode: {
        type: Number,

      },
    }],
  },
  userId: {
    type: String,
    ref: 'User',
  },
});
addressSchema.methods.editAdd = async function (data, id) {
  const add = this.address;
  // eslint-disable-next-line no-underscore-dangle, eqeqeq
  const Existing = await add.findIndex((obj) => obj._id == id);
  add[Existing] = data;
  return this.save();
};
module.exports = mongoose.model('address', addressSchema);
