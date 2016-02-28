import mongoose from "mongoose";
import "./user";

const url =
        process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mongodb://localhost/semirara';

export default {
  connect: function(){
    return mongoose.connect(url);
  }
};
