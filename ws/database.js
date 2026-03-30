const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // força o Node a usar o DNS do gogle

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const URI = 'mongodb+srv://salaoUser:zwr0o5WYAuSfPw7D@clusterdev.souji7k.mongodb.net/Reservo?appName=ClusterDev'; 

    mongoose
  .connect(URI)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err)); //ver o erro caso ocorra

  