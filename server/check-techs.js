import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  specialization: String
}));

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
  title: String,
  category: String,
  assignedTo: mongoose.Schema.Types.ObjectId
}));

async function checkData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const techs = await User.find({ role: 'technician' });
  console.log("Technicians found:", techs.length);
  techs.forEach(t => {
    console.log(`- ${t.name} (${t.email}): Specialization: [${t.specialization}]`);
  });

  const recentTickets = await Ticket.find().sort({ createdAt: -1 }).limit(5);
  console.log("\nRecent Tickets:");
  recentTickets.forEach(tk => {
    console.log(`- ${tk.title} | Category: [${tk.category}] | AssignedTo: ${tk.assignedTo || 'UNASSIGNED'}`);
  });

  await mongoose.disconnect();
}

checkData();
